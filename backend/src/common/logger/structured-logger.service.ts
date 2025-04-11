import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as Transport from 'winston-transport';

export interface LogContext {
  [key: string]: any;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context: string = 'Application';
  private requestId: string | null = null;
  private userId: string | null = null;

  constructor() {
    // Créer des transports personnalisés pour les logs
    const transports: Transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    ];

    // Ajouter un fichier de log si nous ne sommes pas en environnement de test
    if (process.env.NODE_ENV !== 'test') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    // Créer le logger Winston
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'nionfar-api'
      },
      transports,
    });
  }

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  setRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  setUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  private buildLogEntry(message: any, context?: LogContext): any {
    // Si le message est déjà un objet, l'utiliser comme base
    const logEntry = typeof message === 'object' ? { ...message } : { message };
    
    // Ajouter le contexte
    logEntry.context = this.context;
    
    // Ajouter l'ID de requête et l'ID utilisateur s'ils existent
    if (this.requestId) {
      logEntry.requestId = this.requestId;
    }
    
    if (this.userId) {
      logEntry.userId = this.userId;
    }
    
    // Fusionner avec le contexte additionnel si fourni
    if (context) {
      Object.assign(logEntry, context);
    }
    
    return logEntry;
  }

  log(message: any, context?: LogContext): void {
    this.logger.info(this.buildLogEntry(message, context));
  }

  error(message: any, trace?: string, context?: LogContext): void {
    const logEntry = this.buildLogEntry(message, context);
    
    if (trace) {
      logEntry.trace = trace;
    }
    
    this.logger.error(logEntry);
  }

  warn(message: any, context?: LogContext): void {
    this.logger.warn(this.buildLogEntry(message, context));
  }

  debug(message: any, context?: LogContext): void {
    this.logger.debug(this.buildLogEntry(message, context));
  }

  verbose(message: any, context?: LogContext): void {
    this.logger.verbose(this.buildLogEntry(message, context));
  }
} 