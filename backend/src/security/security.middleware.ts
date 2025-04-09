import { Injectable, NestMiddleware, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './security.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly EXCLUDED_PATHS = [
    '/health',
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
    '/services/categories',
    '/categories',
    '/users/roles',
    '/test',
  ];

  constructor(private readonly securityService: SecurityService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérifier si le chemin est exclu des vérifications de sécurité
      if (this.EXCLUDED_PATHS.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Vérifier le mode test (pour désactiver temporairement)
      const isTestMode = req.headers['x-test-mode'] === 'true' || 
                         req.query.testMode === 'true';
      
      if (isTestMode) {
        this.logger.log('Test mode activated, skipping security checks');
        return next();
      }

      // Détecter les bots
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || '';
      const path = req.path;

      await this.securityService.logRequest(ipAddress, userAgent, path);
      
      const isBot = await this.securityService.isBot(ipAddress);
      if (isBot) {
        this.logger.warn(`Bot detected: ${ipAddress} - ${userAgent}`);
        throw new UnauthorizedException('Access denied: Bot detected');
      }

      // Vérifier le token CSRF pour les requêtes non-GET
      if (req.method !== 'GET') {
        const csrfToken = req.headers['x-csrf-token'] as string;
        const sessionId = req.headers['x-session-id'] as string;

        if (!csrfToken || !sessionId) {
          throw new UnauthorizedException('CSRF token or session ID missing');
        }

        const isValidCsrfToken = await this.securityService.validateCsrfToken(csrfToken, sessionId);
        if (!isValidCsrfToken) {
          throw new UnauthorizedException('Invalid CSRF token');
        }
      }

      // Nettoyer les entrées pour prévenir les injections NoSQL
      if (req.body) {
        req.body = this.securityService.sanitizeInput(req.body);
      }

      if (req.query) {
        req.query = this.securityService.sanitizeInput(req.query);
      }

      if (req.params) {
        req.params = this.securityService.sanitizeInput(req.params);
      }

      // Détecter les tentatives d'injection NoSQL
      if (req.body && this.securityService.detectNoSqlInjection(req.body, path)) {
        throw new BadRequestException('Invalid request: Possible NoSQL injection detected');
      }

      if (req.query && this.securityService.detectNoSqlInjection(req.query, path)) {
        throw new BadRequestException('Invalid request: Possible NoSQL injection detected');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
} 