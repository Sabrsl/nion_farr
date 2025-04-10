import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';

@ApiTags('App')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint racine' })
  @ApiResponse({ status: 200, description: 'Renvoie un message de bienvenue' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({ status: 200, description: 'L\'API est en bon état de fonctionnement' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

@ApiTags('Root')
@Controller()
export class RootController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Route racine de l\'API (healthcheck Railway)' })
  @ApiResponse({ status: 200, description: 'API en fonctionnement' })
  getRoot() {
    return {
      status: 'ok',
      message: 'NionFar API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      railway: process.env.RAILWAY_DEPLOYMENT === 'true'
    };
  }

  @Public()
  @Get('railway-health')
  @ApiOperation({ summary: 'Route de healthcheck spécifique à Railway' })
  @ApiResponse({ status: 200, description: 'API en fonctionnement' })
  getRailwayHealth() {
    return {
      status: 'ok',
      message: 'Railway healthcheck passed',
      timestamp: new Date().toISOString()
    };
  }
} 