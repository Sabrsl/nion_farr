import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './security.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly excludedPaths = [
    '/health',
    '/health/detailed',
    '/security/csrf-tokens',
    '/auth/login',
    '/auth/register'
  ];

  constructor(
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip security checks for excluded paths
      if (this.excludedPaths.some(path => req.path.startsWith(path))) {
        this.logger.debug(`Skipping security checks for excluded path: ${req.path}`);
        return next();
      }

      // Skip security checks in development
      if (this.configService.get('NODE_ENV') === 'development') {
        return next();
      }

      // In production, validate CSRF tokens for non-GET requests
      if (this.configService.get('NODE_ENV') === 'production' && req.method !== 'GET') {
        const csrfToken = req.headers['x-csrf-token'];
        if (!csrfToken) {
          this.logger.warn(`CSRF token missing for path: ${req.path}`);
          return res.status(403).json({ 
            message: 'CSRF token missing',
            code: 'CSRF_TOKEN_MISSING'
          });
        }

        const isValid = await this.securityService.validateCsrfToken(csrfToken as string);
        if (!isValid) {
          this.logger.warn(`Invalid CSRF token for path: ${req.path}`);
          return res.status(403).json({ 
            message: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID'
          });
        }
      }

      // Continue with other security checks
      await this.securityService.checkBotDetection(req);
      await this.securityService.checkNoSqlInjection(req);
      await this.securityService.logRequest(req);

      next();
    } catch (error) {
      this.logger.error(`Security middleware error: ${error.message}`, error.stack);
      return res.status(500).json({ 
        message: 'Internal server error',
        code: 'SECURITY_ERROR'
      });
    }
  }
} 