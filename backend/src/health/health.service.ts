import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    try {
      // Vérifier la connexion à MongoDB
      const dbStatus = this.connection.readyState === 1;
      
      if (!dbStatus) {
        this.logger.error('Database connection is not ready');
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed',
        };
      }
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async checkDetailed() {
    try {
      // Vérifier la connexion à MongoDB
      const dbStatus = this.connection.readyState === 1;
      
      // Informations sur le système
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = os.loadavg();
      
      // Informations sur l'application
      const nodeVersion = process.version;
      const environment = this.configService.get<string>('NODE_ENV') || 'development';
      
      // Vérifier les collections MongoDB
      const collections = dbStatus ? await this.connection.db.listCollections().toArray() : [];
      const collectionNames = collections.map(c => c.name);
      
      return {
        status: dbStatus ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbStatus,
          collections: collectionNames,
        },
        system: {
          uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
          memory: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          },
          cpu: {
            loadAverage: cpuUsage,
          },
        },
        application: {
          nodeVersion,
          environment,
        },
      };
    } catch (error) {
      this.logger.error(`Detailed health check failed: ${error.message}`, error.stack);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
} 