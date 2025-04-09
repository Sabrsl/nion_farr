import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService, SecurityEventType, SecuritySeverity } from './audit-log.service';
import { Request } from 'express';

interface BlacklistedIp {
  ipAddress: string;
  reason: string;
  timestamp: Date;
  expiresAt: Date;
}

interface RequestLog {
  ipAddress: string;
  timestamp: Date;
  userAgent: string;
  path: string;
}

interface ContextualRule {
  path: string;
  allowedOperators: string[];
  description: string;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly CSRF_TOKEN_EXPIRY = 24 * 60 * 60; // 24 heures en secondes
  private readonly BOT_DETECTION_THRESHOLD = 100; // requêtes par minute
  private readonly BLACKLIST_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  private readonly csrfSecret: string;
  private readonly csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

  // Règles contextuelles pour la détection NoSQL
  private readonly contextualRules: ContextualRule[] = [
    {
      path: '/api/products',
      allowedOperators: ['$gt', '$gte', '$lt', '$lte', '$in'],
      description: 'Filtres de prix et catégories autorisés',
    },
    {
      path: '/api/orders',
      allowedOperators: ['$in', '$nin', '$eq'],
      description: 'Filtres de statut de commande autorisés',
    },
  ];

  // Patterns de détection NoSQL
  private readonly suspiciousPatterns = [
    /\$[a-zA-Z]+/, // Opérateurs MongoDB
    /\{.*\}/, // Objets JSON
    /\[.*\]/, // Tableaux
    /\$ne/i, // Not equal
    /\$gt/i, // Greater than
    /\$lt/i, // Less than
    /\$gte/i, // Greater than or equal
    /\$lte/i, // Less than or equal
    /\$in/i, // In array
    /\$nin/i, // Not in array
    /\$or/i, // OR condition
    /\$and/i, // AND condition
    /\$nor/i, // NOR condition
    /\$not/i, // NOT condition
    /\$exists/i, // Field exists
    /\$type/i, // Field type
    /\$regex/i, // Regular expression
    /\$options/i, // Regex options
    /\$text/i, // Text search
    /\$search/i, // Text search
    /\$language/i, // Text search language
    /\$caseSensitive/i, // Case sensitive
    /\$diacriticSensitive/i, // Diacritic sensitive
    /\$meta/i, // Meta operator
    /\$slice/i, // Array slice
    /\$elemMatch/i, // Element match
    /\$size/i, // Array size
    /\$all/i, // All elements match
    /\$mod/i, // Modulo
    /\$where/i, // Where clause
    /\$geoWithin/i, // Geo within
    /\$geoIntersects/i, // Geo intersects
    /\$near/i, // Near
    /\$nearSphere/i, // Near sphere
    /\$maxDistance/i, // Max distance
    /\$center/i, // Center
    /\$centerSphere/i, // Center sphere
    /\$box/i, // Box
    /\$polygon/i, // Polygon
    /\$geometry/i, // Geometry
    /\$uniqueDocs/i, // Unique docs
    /\$isolated/i, // Isolated
    /\$atomic/i, // Atomic
    /\$comment/i, // Comment
    /\$explain/i, // Explain
    /\$hint/i, // Hint
    /\$maxScan/i, // Max scan
    /\$maxTimeMS/i, // Max time MS
    /\$min/i, // Min
    /\$max/i, // Max
    /\$orderby/i, // Order by
    /\$natural/i, // Natural
    /\$key/i, // Key
    /\$snapshot/i, // Snapshot
    /\$returnKey/i, // Return key
    /\$showDiskLoc/i, // Show disk loc
    /\$showRecordId/i, // Show record ID
    /\$returnNew/i, // Return new
    /\$upsert/i, // Upsert
    /\$multi/i, // Multi
    /\$currentDate/i, // Current date
    /\$setOnInsert/i, // Set on insert
    /\$inc/i, // Increment
    /\$mul/i, // Multiply
    /\$rename/i, // Rename
    /\$unset/i, // Unset
    /\$addToSet/i, // Add to set
    /\$pop/i, // Pop
    /\$pull/i, // Pull
    /\$push/i, // Push
    /\$pullAll/i, // Pull all
    /\$position/i, // Position
    /\$each/i, // Each
    /\$sort/i, // Sort
    /\$bit/i, // Bit
  ];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.csrfSecret = this.configService.get<string>('CSRF_SECRET') || uuidv4();

    // Créer l'index TTL pour les tokens CSRF
    this.connection.collection('csrfTokens').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    // Créer l'index TTL pour les logs de requêtes
    this.connection.collection('requestLogs').createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 60 * 60 } // 1 heure
    );

    // Créer l'index TTL pour la liste noire
    this.connection.collection('blacklistedIps').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    // Créer des index pour les recherches courantes
    this.connection.collection('requestLogs').createIndex({ ipAddress: 1, timestamp: -1 });
    this.connection.collection('blacklistedIps').createIndex({ ipAddress: 1 });
  }

  /**
   * Génère un token CSRF pour une session
   */
  generateCsrfToken(): string {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.csrfTokens.set(token, { token, expiresAt });
    return token;
  }

  /**
   * Vérifie si un token CSRF est valide
   */
  async validateCsrfToken(token: string): Promise<boolean> {
    try {
      const tokenData = this.csrfTokens.get(token);
      if (!tokenData) {
        this.logger.warn(`CSRF token not found: ${token}`);
        return false;
      }

      if (tokenData.expiresAt < new Date()) {
        this.logger.warn(`CSRF token expired: ${token}`);
        this.csrfTokens.delete(token);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating CSRF token: ${error.message}`);
      return false;
    }
  }

  /**
   * Enregistre une requête pour la détection de bots
   */
  async logRequest(req: Request): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const path = req.path;
    
    this.logger.debug(`Request: ${ipAddress} - ${userAgent} - ${path}`);
  }

  /**
   * Vérifie si une IP est probablement un bot
   */
  async isBot(ipAddress: string): Promise<boolean> {
    try {
      // Vérifier d'abord si l'IP est sur la liste noire
      const blacklisted = await this.connection.collection('blacklistedIps').findOne({ ipAddress });
      if (blacklisted) {
        return true;
      }

      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const requestCount = await this.connection.collection('requestLogs').countDocuments({
        ipAddress,
        timestamp: { $gte: oneMinuteAgo },
      });

      if (requestCount > this.BOT_DETECTION_THRESHOLD) {
        // Ajouter l'IP à la liste noire
        await this.addToBlacklist(ipAddress, 'Détection de bot par seuil de requêtes');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to check if IP is bot: ${error.message}`);
      return false;
    }
  }

  /**
   * Ajoute une IP à la liste noire
   */
  private async addToBlacklist(ipAddress: string, reason: string): Promise<void> {
    try {
      const blacklistEntry: BlacklistedIp = {
        ipAddress,
        reason,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + this.BLACKLIST_DURATION),
      };

      await this.connection.collection('blacklistedIps').insertOne(blacklistEntry);
      await this.auditLogService.logSecurityEvent({
        eventType: SecurityEventType.IP_BLOCKED,
        severity: SecuritySeverity.WARNING,
        ipAddress,
        details: { reason },
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to add IP to blacklist: ${error.message}`);
    }
  }

  /**
   * Nettoie une entrée pour prévenir les injections NoSQL
   */
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.replace(/[${}()\\]/g, '\\$&');
    }
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  /**
   * Détecte les tentatives d'injection NoSQL
   */
  detectNoSqlInjection(input: any, path: string): boolean {
    // Vérifier si le chemin est dans les règles contextuelles
    const contextRule = this.contextualRules.find(rule => path.startsWith(rule.path));
    
    if (typeof input === 'object' && input !== null) {
      const serialized = JSON.stringify(input);
      
      // Si nous avons une règle contextuelle, appliquer des règles spécifiques
      if (contextRule) {
        // Vérifier uniquement les opérateurs non autorisés pour ce chemin
        const unauthorizedOperators = this.suspiciousPatterns
          .filter(pattern => {
            const operator = pattern.source.replace(/[\\\$\/\^]/g, '');
            return !contextRule.allowedOperators.includes(`$${operator}`);
          });
          
        const hasUnauthorizedOperator = unauthorizedOperators.some(pattern => pattern.test(serialized));
        if (hasUnauthorizedOperator) {
          this.logger.warn(`Détection NoSQL: Opérateur non autorisé détecté pour ${path}`);
          return true;
        }
        return false;
      }
      
      // Pour les chemins sans règles contextuelles, appliquer la détection complète
      const patterns = [
        /\$[\s]*[a-zA-Z0-9_]+/g,    // Détecte les opérateurs MongoDB: $gt, $lt, etc.
        /\.[a-zA-Z0-9_]+\(/g,        // Détecte les méthodes potentielles: .exec()
        /\{\s*\$where\s*:/g,         // Détecte l'opérateur $where  
        /;.+/g,                      // Points-virgules
        /db\s*\.\s*[a-zA-Z0-9_]+\s*\(/g, // Appels à la base de données
        /function\s*\(/g,            // Définitions de fonctions
        /eval\s*\(/g,                // Eval
      ];
      
      const hasInjection = patterns.some(pattern => pattern.test(serialized));
      if (hasInjection) {
        this.logger.warn(`Détection NoSQL: Injection potentielle détectée pour ${path}`);
        return true;
      }
    }
    
    return false;
  }

  async checkBotDetection(req: Request): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Log request for monitoring
    this.logger.debug(`Request from IP: ${ipAddress}, User-Agent: ${userAgent}`);
    
    // TODO: Implement bot detection logic
  }

  async checkNoSqlInjection(req: Request): Promise<void> {
    // TODO: Implement NoSQL injection detection
  }
} 