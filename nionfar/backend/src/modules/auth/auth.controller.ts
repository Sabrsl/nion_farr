import { Body, Controller, Post, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'L\'utilisateur a été créé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'L\'utilisateur a été connecté avec succès' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
} 