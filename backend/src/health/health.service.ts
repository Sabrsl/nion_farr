import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class HealthService {
  private packageVersion: string;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    // Lecture du numéro de version depuis package.json
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        this.packageVersion = packageJson.version || '0.0.0';
      } else {
        this.packageVersion = '0.0.0';
      }
    } catch (error) {
      this.packageVersion = '0.0.0';
    }
  }

  /**
   * Vérification de santé de base
   */
  async check(): Promise<HealthResponse> {
    const isDbConnected = this.connection.readyState === 1;
    
    const memoryUsage = process.memoryUsage();
    const percentUsed = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    const response: HealthResponse = {
      status: isDbConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      version: this.packageVersion,
      components: {
        database: {
          status: isDbConnected ? 'ok' : 'error',
          details: {
            connected: isDbConnected
          }
        },
        api: {
          status: 'ok'
        }
      },
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        percentUsed
      }
    };
    
    return response;
  }

  /**
   * Vérification de santé détaillée
   */
  async checkDetailed(): Promise<HealthResponse> {
    const isDbConnected = this.connection.readyState === 1;
    let collections = [];
    
    if (isDbConnected) {
      try {
        collections = await this.connection.db.listCollections().toArray();
        collections = collections.map(col => col.name);
      } catch (error) {
        collections = ['Erreur lors de la récupération des collections'];
      }
    }
    
    const memoryUsage = process.memoryUsage();
    const percentUsed = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    // Récupération de l'utilisation CPU
    const cpuUsage = process.cpuUsage();
    const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Conversion en secondes
    
    // Récupération des informations système
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
      loadAvg: os.loadavg()
    };
    
    const response: HealthResponse = {
      status: isDbConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      version: this.packageVersion,
      components: {
        database: {
          status: isDbConnected ? 'ok' : 'error',
          details: {
            connected: isDbConnected,
            collections
          }
        },
        api: {
          status: 'ok'
        },
        system: {
          status: 'ok',
          details: systemInfo
        },
        deployment: {
          status: 'ok',
          details: {
            railway: process.env.RAILWAY_DEPLOYMENT === 'true',
            memory_optimized: process.env.MEMORY_OPTIMIZED === 'true',
            port: process.env.PORT
          }
        }
      },
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        percentUsed
      }
    };
    
    return response;
  }
} 