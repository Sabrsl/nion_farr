import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health status' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async checkDetailed() {
    return this.healthService.checkDetailed();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping test that does not require database' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping() {
    return {
      status: 'ok',
      message: 'pong',
      timestamp: new Date().toISOString(),
      railway: process.env.RAILWAY_DEPLOYMENT === 'true',
      render: process.env.IS_RENDER === 'true',
      environment: process.env.NODE_ENV,
      memoryOptimized: process.env.MEMORY_OPTIMIZED === 'true',
      port: process.env.PORT || 'non défini',
      hostname: '0.0.0.0', // On écoute sur toutes les interfaces
    };
  }
} 