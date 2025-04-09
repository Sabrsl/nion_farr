import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types, Collection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

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
  _id?: Types.ObjectId;
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

type AuditLogDocument = AuditLogEntry & { _id: Types.ObjectId };

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly RETENTION_DAYS = 365; // Conserver les logs pendant 1 an
  private readonly auditLogsCollection: Collection<AuditLogDocument>;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    this.auditLogsCollection = this.connection.collection<AuditLogDocument>('auditLogs');
    
    // Créer l'index TTL pour supprimer automatiquement les logs après la période de rétention
    this.auditLogsCollection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: this.RETENTION_DAYS * 24 * 60 * 60 }
    );
    
    // Créer des index pour les recherches courantes
    this.auditLogsCollection.createIndex({ userId: 1, timestamp: -1 });
    this.auditLogsCollection.createIndex({ action: 1, timestamp: -1 });
    this.auditLogsCollection.createIndex({ resourceType: 1, resourceId: 1 });
  }

  async log(entry: Omit<AuditLogEntry, '_id'>): Promise<void> {
    try {
      await this.auditLogsCollection.insertOne({
        ...entry,
        timestamp: entry.timestamp || new Date()
      } as AuditLogDocument);
    } catch (error) {
      this.logger.error(`Failed to log audit entry: ${error.message}`, error.stack);
    }
  }

  async getUserAuditLogs(userId: string, limit = 100, skip = 0): Promise<AuditLogDocument[]> {
    return this.auditLogsCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async getResourceAuditLogs(resourceType: string, resourceId: string, limit = 100, skip = 0): Promise<AuditLogDocument[]> {
    return this.auditLogsCollection
      .find({ resourceType, resourceId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async getActionAuditLogs(action: AuditAction, limit = 100, skip = 0): Promise<AuditLogDocument[]> {
    return this.auditLogsCollection
      .find({ action })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async searchAuditLogs(query: Record<string, any>, limit = 100, skip = 0): Promise<AuditLogDocument[]> {
    return this.auditLogsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date, limit = 100, skip = 0): Promise<AuditLogDocument[]> {
    return this.auditLogsCollection
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
} 