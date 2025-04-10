"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = exports.SecuritySeverity = exports.SecurityEventType = void 0;
const common_1 = require("@nestjs/common");
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["AUTH_SUCCESS"] = "AUTH_SUCCESS";
    SecurityEventType["AUTH_FAILURE"] = "AUTH_FAILURE";
    SecurityEventType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    SecurityEventType["PASSWORD_RESET"] = "PASSWORD_RESET";
    SecurityEventType["TOKEN_GENERATED"] = "TOKEN_GENERATED";
    SecurityEventType["TOKEN_REVOKED"] = "TOKEN_REVOKED";
    SecurityEventType["ROLE_CHANGE"] = "ROLE_CHANGE";
    SecurityEventType["PERMISSION_CHANGE"] = "PERMISSION_CHANGE";
    SecurityEventType["SECURITY_SETTING_CHANGE"] = "SECURITY_SETTING_CHANGE";
    SecurityEventType["IP_BLOCKED"] = "IP_BLOCKED";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["DATA_ACCESS"] = "DATA_ACCESS";
    SecurityEventType["DATA_MODIFICATION"] = "DATA_MODIFICATION";
    SecurityEventType["CONFIGURATION_CHANGE"] = "CONFIGURATION_CHANGE";
    SecurityEventType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["INFO"] = "INFO";
    SecuritySeverity["WARNING"] = "WARNING";
    SecuritySeverity["ERROR"] = "ERROR";
    SecuritySeverity["CRITICAL"] = "CRITICAL";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
let AuditLogService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuditLogService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditLogService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        configService;
        logger = new common_1.Logger(AuditLogService.name);
        RETENTION_PERIOD = 365 * 24 * 60 * 60; // 365 jours en secondes
        constructor(connection, configService) {
            this.connection = connection;
            this.configService = configService;
            // Créer l'index TTL pour supprimer automatiquement les logs après la période de rétention
            this.connection.collection('securityAuditLogs').createIndex({ timestamp: 1 }, { expireAfterSeconds: this.RETENTION_PERIOD });
            // Créer des index pour les recherches courantes
            this.connection.collection('securityAuditLogs').createIndex({ eventType: 1, timestamp: -1 });
            this.connection.collection('securityAuditLogs').createIndex({ userId: 1, timestamp: -1 });
            this.connection.collection('securityAuditLogs').createIndex({ severity: 1, timestamp: -1 });
            this.connection.collection('securityAuditLogs').createIndex({ ipAddress: 1, timestamp: -1 });
        }
        /**
         * Enregistre un événement de sécurité
         */
        async logSecurityEvent(log) {
            try {
                await this.connection.collection('securityAuditLogs').insertOne({
                    ...log,
                    timestamp: log.timestamp || new Date(),
                });
                // Journaliser les événements critiques ou d'erreur
                if (log.severity === SecuritySeverity.CRITICAL || log.severity === SecuritySeverity.ERROR) {
                    this.logger.error(`Security event: ${log.eventType} - ${log.severity} - User: ${log.userId || 'unknown'} - IP: ${log.ipAddress || 'unknown'}`, log.details);
                }
                else if (log.severity === SecuritySeverity.WARNING) {
                    this.logger.warn(`Security event: ${log.eventType} - ${log.severity} - User: ${log.userId || 'unknown'} - IP: ${log.ipAddress || 'unknown'}`, log.details);
                }
            }
            catch (error) {
                this.logger.error(`Failed to log security event: ${error.message}`);
                throw error;
            }
        }
        /**
         * Récupère les logs d'audit de sécurité par type d'événement
         */
        async getLogsByEventType(eventType, limit = 100, skip = 0) {
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
        async getLogsByUserId(userId, limit = 100, skip = 0) {
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
        async getLogsBySeverity(severity, limit = 100, skip = 0) {
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
        async getLogsByDateRange(startDate, endDate, limit = 100, skip = 0) {
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
        async searchLogs(query, limit = 100, skip = 0) {
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
        async exportLogsToCsv(startDate, endDate) {
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
        async generateSecurityReport(startDate, endDate) {
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
                .filter(([ip, count]) => count > 10)
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
    };
    return AuditLogService = _classThis;
})();
exports.AuditLogService = AuditLogService;
