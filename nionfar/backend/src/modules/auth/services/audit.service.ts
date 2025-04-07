import { Injectable, Logger } from '@nestjs/common';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  MIGRATION_RUN = 'MIGRATION_RUN',
  OTHER = 'OTHER'
}

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  async log(entry: AuditLogEntry): Promise<void> {
    // Dans un environnement de production, nous enregistrerions cela dans une base de données
    // Pour l'instant, nous allons simplement logger l'information
    this.logger.log(`Audit: ${entry.action} - User: ${entry.userId || 'Unknown'} - ${JSON.stringify(entry.details || {})}`);
  }
} 