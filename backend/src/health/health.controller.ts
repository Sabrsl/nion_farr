import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../modules/auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Get detailed health status' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async checkDetailedHealth() {
    return this.healthService.checkDetailedHealth();
  }

  @Get('mongodb')
  @Public()
  async checkMongoConnection() {
    return this.healthService.checkMongoConnection();
  }

  @Get('database-stats')
  @Public()
  async getDatabaseStats() {
    return this.healthService.getDatabaseStats();
  }
} 