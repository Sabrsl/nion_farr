import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  
  @Get()
  @ApiOperation({ summary: 'Endpoint racine' })
  @ApiResponse({ status: 200, description: 'Renvoie un message de bienvenue' })
  getHello(): { message: string } {
    return { message: 'Bienvenue sur l\'API de NionFar - Plateforme de services freelance au Sénégal' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({ status: 200, description: 'L\'API est en bon état de fonctionnement' })
  healthCheck(): { status: string; timestamp: string; version: string; } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    };
  }
} 