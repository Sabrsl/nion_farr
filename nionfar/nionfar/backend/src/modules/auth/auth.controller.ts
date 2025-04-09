import { Body, Controller, Post, HttpCode, HttpStatus, Get, Param, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Response } from 'express';

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
  async verifyEmail(
    @Param('token') token: string,
    @Res() res: Response,
    @Query('redirect') redirectUrl?: string
  ) {
    try {
      const result = await this.authService.verifyEmail(token);
      
      // Si un URL de redirection est fourni, on redirige l'utilisateur
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }
      
      // Sinon, on retourne le résultat
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Email vérifié avec succès',
        ...result
      });
    } catch (error) {
      if (redirectUrl) {
        return res.redirect(`${redirectUrl}?error=invalid-token`);
      }
      
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Token invalide'
      });
    }
  }
} 