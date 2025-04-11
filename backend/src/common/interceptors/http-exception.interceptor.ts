import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Déterminer le statut HTTP approprié
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // Générer un code d'erreur unique pour le traçage
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    // Obtenir le message d'erreur
    const message = 
      exception instanceof HttpException
        ? exception.message
        : 'Une erreur interne est survenue';
    
    // Déterminer si nous devons exposer les détails de l'erreur
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Journaliser l'erreur avec tous les détails
    this.logger.error({
      errorId,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      status,
      message: exception.message || message,
      stack: exception.stack,
    });
    
    // En production, capturer l'erreur dans Sentry
    if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      try {
        Sentry.captureException(exception);
        Sentry.setContext('request', {
          url: request.url,
          method: request.method,
          query: request.query,
          headers: request.headers,
          errorId,
        });
      } catch (sentryError) {
        this.logger.error('Erreur lors de la capture Sentry: ' + sentryError);
      }
    }
    
    // Construire la réponse d'erreur standardisée
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      errorId,
      message,
      details: !isProduction ? exception.stack : undefined,
      // Pour les erreurs de validation
      validation: exception.response?.message || undefined
    };
    
    // Filtrer les propriétés undefined
    Object.keys(responseBody).forEach(key => 
      responseBody[key] === undefined && delete responseBody[key]
    );
    
    response.status(status).json(responseBody);
  }
} 