import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../modules/auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  version: string;
  components: {
    [key: string]: {
      status: 'ok' | 'error';
      details?: any;
    };
  };
  uptime: number;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
    percentUsed: number;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({ 
    status: 200, 
    description: 'System health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        timestamp: { type: 'string', format: 'date-time' },
        environment: { type: 'string' },
        version: { type: 'string' },
        components: { 
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok', 'error'] },
              details: { type: 'object' }
            }
          }
        },
        uptime: { type: 'number' },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'string' },
            heapTotal: { type: 'string' },
            heapUsed: { type: 'string' },
            external: { type: 'string' },
            percentUsed: { type: 'number' }
          }
        }
      }
    }
  })
  async check(): Promise<HealthResponse> {
    return this.healthService.check();
  }

  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Simple ping check' })
  @ApiResponse({ status: 200, description: 'Ping response' })
  ping(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health check with component status' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async detailed(): Promise<HealthResponse> {
    return this.healthService.checkDetailed();
  }
} 