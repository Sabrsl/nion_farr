import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  Patch,
  Request,
  UsePipes,
  UnauthorizedException,
  Logger,
  BadRequestException
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { TwoFactorService } from '../services/two-factor.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { EnableTwoFactorDto } from '../dto/enable-two-factor.dto';
import { VerifyTwoFactorDto } from '../dto/verify-two-factor.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema 
} from '../schemas/auth.schema';
import { Public } from '../decorators/public.decorator';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ 
    status: 201, 
    description: 'L\'utilisateur a été créé avec succès.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides.' 
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Log détaillé des données reçues
      this.logger.log(`🔍 Tentative d'inscription - Données reçues: ${JSON.stringify({
        ...registerDto,
        password: registerDto.password ? '[MASKED]' : undefined
      })}`);
      
      // Vérifier la structure des données reçues
      if (!registerDto.email || !registerDto.password || !registerDto.firstName || !registerDto.lastName) {
        this.logger.warn('❌ Données d\'inscription incomplètes');
        throw new BadRequestException('Données d\'inscription incomplètes. Veuillez fournir email, password, firstName et lastName');
      }
      
      // Vérifier manuellement le schéma pour un log plus précis des erreurs
      const validationResult = registerSchema.safeParse(registerDto);
      if (!validationResult.success) {
        this.logger.error(`❌ Validation échouée pour l'inscription: ${JSON.stringify(validationResult.error.format())}`);
        
        // Transformer les erreurs Zod en format plus lisible pour le client
        const formattedErrors = {};
        for (const [field, error] of Object.entries(validationResult.error.formErrors.fieldErrors)) {
          formattedErrors[field] = error && error.length > 0 ? error[0] : 'Champ invalide';
        }
        
        throw new BadRequestException({
          message: 'Erreur de validation des données d\'inscription',
          errors: formattedErrors
        });
      }
      
      // Log de débogage avant de passer les données au service
      this.logger.debug(`✅ Données d'inscription validées: ${JSON.stringify({
        ...registerDto,
        password: '[MASKED]'
      })}`);
      
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.error(`❌ Erreur de validation lors de l'inscription: ${JSON.stringify(error.getResponse())}`);
      } else {
        this.logger.error(`❌ Erreur lors de l'inscription: ${error.message}`);
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'L\'utilisateur est connecté avec succès.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Identifiants invalides.' 
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Req() req: RequestWithUser,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(req.user);

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return {
        accessToken,
        user,
        message: 'Connexion réussie',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la connexion: ${error.message}`);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion d\'un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'L\'utilisateur est déconnecté avec succès.' 
  })
  async logout(@Req() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    try {
      await this.authService.logout(req.user.id);
      
      // Supprimer le cookie de refresh token
      response.clearCookie('refresh_token');
      
      return { message: 'Déconnexion réussie' };
    } catch (error) {
      this.logger.error(`Erreur lors de la déconnexion: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  @ApiOperation({ summary: 'Rafraîchir le token d\'accès' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token rafraîchi avec succès.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token invalide ou expiré.' 
  })
  async refreshToken(@Request() req, @Body() refreshTokenDto: any) {
    return this.authService.refreshToken(req.user.id, refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  @ApiOperation({ summary: 'Vérifier l\'adresse email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email vérifié avec succès.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token invalide ou expiré.' 
  })
  async verifyEmail(@Body() verifyEmailDto: any) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renvoyer l\'email de vérification' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de vérification renvoyé avec succès.' 
  })
  async resendVerificationEmail(@Req() req: RequestWithUser) {
    return this.authService.resendVerificationEmail(req.user.id);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de réinitialisation envoyé avec succès.' 
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mot de passe réinitialisé avec succès.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token invalide ou expiré.' 
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }

  @Get('two-factor/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer un QR code pour l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'QR code généré avec succès'
  })
  async generateTwoFactorQrCode(@Req() req: RequestWithUser) {
    try {
      return await this.twoFactorService.generateSecret(req.user.id);
    } catch (error) {
      this.logger.error(`Erreur lors de la génération du QR code 2FA: ${error.message}`);
      throw error;
    }
  }

  @Post('two-factor/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentification à deux facteurs activée avec succès'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Code invalide'
  })
  async enableTwoFactor(
    @Req() req: RequestWithUser,
    @Body() enableTwoFactorDto: EnableTwoFactorDto,
  ) {
    try {
      const result = await this.twoFactorService.enableTwoFactor(
        req.user.id,
        enableTwoFactorDto.twoFactorCode
      );
      
      if (!result) {
        throw new BadRequestException('Code 2FA invalide');
      }
      
      return { message: 'Authentification à deux facteurs activée avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de l'activation de la 2FA: ${error.message}`);
      throw error;
    }
  }

  @Post('two-factor/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désactiver l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentification à deux facteurs désactivée avec succès'
  })
  async disableTwoFactor(@Req() req: RequestWithUser) {
    try {
      await this.twoFactorService.disableTwoFactor(req.user.id);
      return { message: 'Authentification à deux facteurs désactivée avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la désactivation de la 2FA: ${error.message}`);
      throw error;
    }
  }

  @Post('two-factor/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier un code d\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Code vérifié avec succès'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Code invalide'
  })
  async verifyTwoFactor(@Body() verifyTwoFactorDto: VerifyTwoFactorDto) {
    try {
      const isValid = await this.twoFactorService.verifyToken(
        verifyTwoFactorDto.userId,
        verifyTwoFactorDto.twoFactorCode
      );
      
      if (!isValid) {
        throw new UnauthorizedException('Code 2FA invalide');
      }
      
      return { message: 'Code vérifié avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du code 2FA: ${error.message}`);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les informations de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations de l\'utilisateur récupérées avec succès.' 
  })
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Public()
  @Get('test-register')
  @ApiOperation({ summary: 'Test de l\'endpoint d\'inscription' })
  @ApiResponse({ status: 200, description: 'Test réussi' })
  async testRegisterEndpoint() {
    this.logger.log('🧪 Test de l\'endpoint d\'inscription appelé');
    return { 
      success: true, 
      message: 'Endpoint d\'inscription disponible', 
      expectedFormat: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        role: 'CLIENT'
      } 
    };
  }

  @Public()
  @Get('test-server')
  @ApiOperation({ summary: 'Vérifier l\'état du serveur et les configurations de sécurité' })
  @ApiResponse({ status: 200, description: 'État du serveur et configurations' })
  async testServerEndpoint() {
    this.logger.log('🔍 Test des configurations du serveur appelé');
    
    // Collecter des informations sur l'environnement pour aider au debugging
    const serverInfo = {
      success: true,
      message: 'Serveur fonctionnel',
      environment: process.env.NODE_ENV || 'development',
      csrfProtection: process.env.NODE_ENV === 'production' ? 'désactivée (JWT)' : 'désactivée (développement)',
      timestamp: new Date().toISOString(),
      apiVersion: '1.0.0',
      endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        refreshToken: '/api/auth/refresh-token'
      },
      securityMiddleware: {
        csrfExclusions: [
          '/health', '/health/detailed', '/security/csrf-tokens',
          '/auth/login', '/auth/register', '/auth/refresh-token',
          '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password',
          '/auth/verify-phone', '/auth/test-register', '/auth/test-server'
        ]
      }
    };
    
    return serverInfo;
  }

  @Public()
  @Post('test-csrf')
  @ApiOperation({ summary: 'Tester la protection CSRF' })
  @ApiResponse({ status: 200, description: 'Test CSRF réussi' })
  async testCsrfEndpoint(@Req() req: any, @Res() res: Response) {
    this.logger.log('🧪 Test de la protection CSRF appelé');
    
    // Récupérer et journaliser les en-têtes pertinents 
    const headers = {
      origin: req.headers.origin || 'non défini',
      referer: req.headers.referer || 'non défini',
      'x-csrf-token': req.headers['x-csrf-token'] ? 'présent' : 'absent',
      'content-type': req.headers['content-type'] || 'non défini',
      'user-agent': req.headers['user-agent'] || 'non défini'
    };
    
    this.logger.debug(`En-têtes de requête reçus: ${JSON.stringify(headers)}`);
    
    // Information sur les paramètres CORS
    const corsInfo = {
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4200',
        'https://nion-farr.vercel.app',
        'https://nionfar.sn',
        'https://www.nionfar.sn'
      ],
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      csrfProtectionStatus: process.env.NODE_ENV === 'production' ? 'désactivée (JWT)' : 'désactivée (développement)'
    };
    
    return res.status(200).json({
      success: true,
      message: 'Test CSRF réussi',
      requestInfo: {
        method: req.method,
        path: req.url || req.originalUrl || '/api/auth/test-csrf',
        headers: headers
      },
      serverConfig: {
        cors: corsInfo,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  }
} 