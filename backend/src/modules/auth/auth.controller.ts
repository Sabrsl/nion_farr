import { Body, Controller, Post, HttpCode, HttpStatus, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SecurityService } from '../../security/security.service';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly securityService: SecurityService
  ) {
    this.logger.log('AuthController initialisé - routes disponibles :');
    this.logger.log('POST /auth/register - Inscription d\'un nouvel utilisateur');
    this.logger.log('POST /auth/login - Connexion d\'un utilisateur');
    this.logger.log('POST /auth/refresh - Rafraîchir les tokens d\'authentification');
    this.logger.log('GET /auth/verify-email/:token - Vérifier l\'email d\'un utilisateur');
    this.logger.log('GET /auth/csrf-tokens - Obtenir un token CSRF');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'L\'utilisateur a été créé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Tentative d'inscription pour l'utilisateur: ${registerDto.email}`);
    console.log('📥 Données reçues pour inscription:', JSON.stringify(registerDto, null, 2));
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'L\'utilisateur a été connecté avec succès' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Tentative de connexion pour l'utilisateur: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Connexion réussie pour l'utilisateur: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Échec de connexion pour l'utilisateur ${loginDto.email}: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens d\'authentification' })
  @ApiResponse({ status: 200, description: 'Les tokens ont été rafraîchis avec succès' })
  @ApiResponse({ status: 401, description: 'Token de rafraîchissement invalide' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Public()
  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Vérifier l\'email d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'L\'email a été vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide' })
  async verifyEmail(@Param('token') token: string) {
    // À implémenter - verification du token d'email
    return { success: true, message: 'Email vérifié avec succès' };
  }

  @Public()
  @Get('csrf-tokens')
  @ApiOperation({ summary: 'Get CSRF tokens' })
  @ApiResponse({ status: 200, description: 'CSRF tokens generated successfully' })
  async getCsrfTokens() {
    this.logger.log('Génération d\'un nouveau token CSRF');
    const token = this.securityService.generateCsrfToken();
    
    return {
      token
    };
  }
} 