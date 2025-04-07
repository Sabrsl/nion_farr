import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_GENERATED = 'TOKEN_GENERATED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SECURITY_SETTING_CHANGE = 'SECURITY_SETTING_CHANGE',
  IP_BLOCKED = 'IP_BLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum SecuritySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface SecurityAuditLog {
  timestamp: Date;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly RETENTION_PERIOD = 365 * 24 * 60 * 60; // 365 jours en secondes

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    // Créer l'index TTL pour supprimer automatiquement les logs après la période de rétention
    this.connection.collection('securityAuditLogs').createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: this.RETENTION_PERIOD }
    );

    // Créer des index pour les recherches courantes
    this.connection.collection('securityAuditLogs').createIndex({ eventType: 1, timestamp: -1 });
    this.connection.collection('securityAuditLogs').createIndex({ userId: 1, timestamp: -1 });
    this.connection.collection('securityAuditLogs').createIndex({ severity: 1, timestamp: -1 });
    this.connection.collection('securityAuditLogs').createIndex({ ipAddress: 1, timestamp: -1 });
  }

  /**
   * Enregistre un événement de sécurité
   */
  async logSecurityEvent(log: SecurityAuditLog): Promise<void> {
    try {
      await this.connection.collection('securityAuditLogs').insertOne({
        ...log,
        timestamp: log.timestamp || new Date(),
      });

      // Journaliser les événements critiques ou d'erreur
      if (log.severity === SecuritySeverity.CRITICAL || log.severity === SecuritySeverity.ERROR) {
        this.logger.error(
          `Security event: ${log.eventType} - ${log.severity} - User: ${log.userId || 'unknown'} - IP: ${log.ipAddress || 'unknown'}`,
          log.details
        );
      } else if (log.severity === SecuritySeverity.WARNING) {
        this.logger.warn(
          `Security event: ${log.eventType} - ${log.severity} - User: ${log.userId || 'unknown'} - IP: ${log.ipAddress || 'unknown'}`,
          log.details
        );
      }
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les logs d'audit de sécurité par type d'événement
   */
  async getLogsByEventType(
    eventType: SecurityEventType,
    limit: number = 100,
    skip: number = 0,
  ): Promise<SecurityAuditLog[]> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({ eventType })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      action: log.action,
      details: log.details,
      metadata: log.metadata,
    }));
  }

  /**
   * Récupère les logs d'audit de sécurité par utilisateur
   */
  async getLogsByUserId(
    userId: string,
    limit: number = 100,
    skip: number = 0,
  ): Promise<SecurityAuditLog[]> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      action: log.action,
      details: log.details,
      metadata: log.metadata,
    }));
  }

  /**
   * Récupère les logs d'audit de sécurité par niveau de sévérité
   */
  async getLogsBySeverity(
    severity: SecuritySeverity,
    limit: number = 100,
    skip: number = 0,
  ): Promise<SecurityAuditLog[]> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({ severity })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      action: log.action,
      details: log.details,
      metadata: log.metadata,
    }));
  }

  /**
   * Récupère les logs d'audit de sécurité par plage de dates
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
    skip: number = 0,
  ): Promise<SecurityAuditLog[]> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      action: log.action,
      details: log.details,
      metadata: log.metadata,
    }));
  }

  /**
   * Recherche les logs d'audit de sécurité
   */
  async searchLogs(
    query: Record<string, any>,
    limit: number = 100,
    skip: number = 0,
  ): Promise<SecurityAuditLog[]> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      action: log.action,
      details: log.details,
      metadata: log.metadata,
    }));
  }

  /**
   * Exporte les logs d'audit de sécurité au format CSV
   */
  async exportLogsToCsv(
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .toArray();

    // En-têtes CSV
    const headers = [
      'Timestamp',
      'Event Type',
      'Severity',
      'User ID',
      'Username',
      'IP Address',
      'User Agent',
      'Resource Type',
      'Resource ID',
      'Action',
      'Details',
    ];

    // Lignes CSV
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.eventType,
      log.severity,
      log.userId || '',
      log.username || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.resourceType || '',
      log.resourceId || '',
      log.action || '',
      JSON.stringify(log.details),
    ]);

    // Générer le CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Génère un rapport de sécurité
   */
  async generateSecurityReport(
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, any>> {
    const logs = await this.connection.collection('securityAuditLogs')
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();

    // Compter les événements par type
    const eventTypeCounts = {};
    logs.forEach(log => {
      eventTypeCounts[log.eventType] = (eventTypeCounts[log.eventType] || 0) + 1;
    });

    // Compter les événements par sévérité
    const severityCounts = {};
    logs.forEach(log => {
      severityCounts[log.severity] = (severityCounts[log.severity] || 0) + 1;
    });

    // Compter les événements par utilisateur
    const userCounts = {};
    logs.forEach(log => {
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    // Compter les événements par IP
    const ipCounts = {};
    logs.forEach(log => {
      if (log.ipAddress) {
        ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
      }
    });

    // Trouver les IPs suspectes (plus de 10 événements d'erreur)
    const suspiciousIps = Object.entries(ipCounts)
      .filter(([ip, count]) => (count as number) > 10)
      .map(([ip]) => ip);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      totalEvents: logs.length,
      eventTypeCounts,
      severityCounts,
      userCounts,
      ipCounts,
      suspiciousIps,
    };
  }
} 