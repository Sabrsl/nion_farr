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

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
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
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, user, requiresTwoFactor } = await this.authService.login(loginDto);
    
    // Configurer le cookie pour le refresh token
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // Si 2FA est requis, ne pas envoyer le token d'accès
    if (requiresTwoFactor) {
      return {
        message: 'Authentification à deux facteurs requise',
        requiresTwoFactor: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    }

    return {
      accessToken,
      user,
      message: 'Connexion réussie',
    };
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
    await this.authService.logout(req.user.id);
    
    // Supprimer le cookie de refresh token
    response.clearCookie('refresh_token');
    
    return { message: 'Déconnexion réussie' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token d\'accès' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token rafraîchi avec succès.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token invalide ou expiré.' 
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Vérifier si le refresh token est dans les cookies
    const cookieRefreshToken = req.cookies?.refresh_token;
    const refreshToken = refreshTokenDto.refreshToken || cookieRefreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token non fourni');
    }

    const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshToken(refreshToken);

    // Mettre à jour le cookie de refresh token
    if (newRefreshToken) {
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
    }

    return {
      accessToken,
      user,
      message: 'Token rafraîchi avec succès',
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier l\'adresse email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email vérifié avec succès.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token invalide ou expiré.' 
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de réinitialisation envoyé avec succès.' 
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
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
      resetPasswordDto.newPassword,
    );
  }

  @Get('two-factor/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer un QR code pour l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'QR code généré avec succès.' 
  })
  async generateTwoFactorQrCode(@Req() req: RequestWithUser) {
    return this.authService.generateTwoFactorQrCode(req.user.id);
  }

  @Post('two-factor/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentification à deux facteurs activée avec succès.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Code invalide.' 
  })
  async enableTwoFactor(
    @Req() req: RequestWithUser,
    @Body() enableTwoFactorDto: EnableTwoFactorDto,
  ) {
    return this.authService.enableTwoFactor(req.user.id, enableTwoFactorDto.twoFactorCode);
  }

  @Post('two-factor/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désactiver l\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentification à deux facteurs désactivée avec succès.' 
  })
  async disableTwoFactor(@Req() req: RequestWithUser) {
    return this.authService.disableTwoFactor(req.user.id);
  }

  @Post('two-factor/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier le code d\'authentification à deux facteurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Code vérifié avec succès.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Code invalide.' 
  })
  async verifyTwoFactor(
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.verifyTwoFactor(
      verifyTwoFactorDto.userId,
      verifyTwoFactorDto.twoFactorCode,
    );

    // Configurer le cookie pour le refresh token
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return {
      accessToken,
      user,
      message: 'Authentification à deux facteurs réussie',
    };
  }

  @Get('me')
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
} 