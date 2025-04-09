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
  ];

  constructor(
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip security checks for excluded paths
    if (this.excludedPaths.includes(req.path)) {
      return next();
    }

    // Skip security checks in test mode
    if (this.configService.get('NODE_ENV') === 'test') {
      return next();
    }

    // In production, only validate CSRF for non-GET requests
    if (this.configService.get('NODE_ENV') === 'production') {
      if (req.method !== 'GET') {
        const csrfToken = req.headers['x-csrf-token'];
        const sessionId = req.headers['x-session-id'];

        if (!csrfToken || !sessionId) {
          return res.status(403).json({
            message: 'CSRF token or session ID missing',
          });
        }

        try {
          await this.securityService.validateCsrfToken(
            csrfToken as string,
            sessionId as string,
          );
        } catch (error) {
          return res.status(403).json({
            message: 'Invalid CSRF token',
          });
        }
      }
    }

    // Continue with other security checks
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Check for bot detection
    const isBot = await this.securityService.isBot(ipAddress);
    if (isBot) {
      this.logger.warn(`Bot detected: ${ipAddress} - ${userAgent}`);
      return res.status(403).json({
        message: 'Access denied: Bot detected',
      });
    }

    // Check for NoSQL injection
    if (req.body && Object.keys(req.body).length > 0) {
      const hasInjection = this.securityService.detectNoSqlInjection(req.body, req.path);
      if (hasInjection) {
        this.logger.warn(`NoSQL injection detected in request body for path: ${req.path}`);
        return res.status(400).json({
          message: 'Invalid request: Possible NoSQL injection detected',
        });
      }
    }

    if (req.query && Object.keys(req.query).length > 0) {
      const hasInjection = this.securityService.detectNoSqlInjection(req.query, req.path);
      if (hasInjection) {
        this.logger.warn(`NoSQL injection detected in query parameters for path: ${req.path}`);
        return res.status(400).json({
          message: 'Invalid request: Possible NoSQL injection detected',
        });
      }
    }

    // Log the request
    await this.securityService.logRequest(ipAddress, userAgent, req.path);

    next();
  }
} 