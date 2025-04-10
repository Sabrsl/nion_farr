import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { getMemoryConfig } from '../config/environment';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly memoryConfig = getMemoryConfig();

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
      
      // Récupérer les informations de déploiement
      const deploymentInfo = this.getDeploymentInfo();
      
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
            heapUsagePercent: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`,
          },
          cpu: {
            loadAverage: cpuUsage,
          },
        },
        application: {
          nodeVersion,
          environment,
          deploymentPlatform: this.memoryConfig.deploymentPlatform,
          memoryOptimized: this.memoryConfig.isConstrained,
          deployment: deploymentInfo,
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
  
  /**
   * Récupère les informations de déploiement selon la plateforme
   */
  private getDeploymentInfo() {
    const isRailway = process.env.RAILWAY_DEPLOYMENT === 'true';
    const isRender = process.env.IS_RENDER === 'true';
    
    if (isRailway) {
      return {
        platform: 'Railway',
        projectId: process.env.RAILWAY_PROJECT_ID,
        serviceName: process.env.RAILWAY_SERVICE_NAME,
        environment: process.env.RAILWAY_ENVIRONMENT_NAME,
        publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
      };
    }
    
    if (isRender) {
      return {
        platform: 'Render',
        serviceType: process.env.RENDER_SERVICE_TYPE,
        serviceId: process.env.RENDER_SERVICE_ID,
      };
    }
    
    return {
      platform: 'Local/Other',
    };
  }
} 