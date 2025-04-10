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
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const audit_log_service_1 = require("./audit-log.service");
let SecurityService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SecurityService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SecurityService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        configService;
        auditLogService;
        logger = new common_1.Logger(SecurityService.name);
        CSRF_TOKEN_EXPIRY = 24 * 60 * 60; // 24 heures en secondes
        BOT_DETECTION_THRESHOLD = 100; // requêtes par minute
        BLACKLIST_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
        csrfSecret;
        csrfTokens = new Map();
        // Règles contextuelles pour la détection NoSQL
        contextualRules = [
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
        suspiciousPatterns = [
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
        constructor(connection, configService, auditLogService) {
            this.connection = connection;
            this.configService = configService;
            this.auditLogService = auditLogService;
            this.csrfSecret = this.configService.get('CSRF_SECRET') || (0, uuid_1.v4)();
            // Créer l'index TTL pour les tokens CSRF
            this.connection.collection('csrfTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            // Créer l'index TTL pour les logs de requêtes
            this.connection.collection('requestLogs').createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 } // 1 heure
            );
            // Créer l'index TTL pour la liste noire
            this.connection.collection('blacklistedIps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            // Créer des index pour les recherches courantes
            this.connection.collection('requestLogs').createIndex({ ipAddress: 1, timestamp: -1 });
            this.connection.collection('blacklistedIps').createIndex({ ipAddress: 1 });
        }
        /**
         * Génère un token CSRF pour une session
         */
        generateCsrfToken() {
            const token = (0, uuid_1.v4)();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            this.csrfTokens.set(token, { token, expiresAt });
            return token;
        }
        /**
         * Vérifie si un token CSRF est valide
         */
        async validateCsrfToken(token) {
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
            }
            catch (error) {
                this.logger.error(`Error validating CSRF token: ${error.message}`);
                return false;
            }
        }
        /**
         * Enregistre une requête pour la détection de bots
         */
        async logRequest(req) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            const path = req.path;
            this.logger.debug(`Request: ${ipAddress} - ${userAgent} - ${path}`);
        }
        /**
         * Vérifie si une IP est probablement un bot
         */
        async isBot(ipAddress) {
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
            }
            catch (error) {
                this.logger.error(`Failed to check if IP is bot: ${error.message}`);
                return false;
            }
        }
        /**
         * Ajoute une IP à la liste noire
         */
        async addToBlacklist(ipAddress, reason) {
            try {
                const blacklistEntry = {
                    ipAddress,
                    reason,
                    timestamp: new Date(),
                    expiresAt: new Date(Date.now() + this.BLACKLIST_DURATION),
                };
                await this.connection.collection('blacklistedIps').insertOne(blacklistEntry);
                await this.auditLogService.logSecurityEvent({
                    eventType: audit_log_service_1.SecurityEventType.IP_BLOCKED,
                    severity: audit_log_service_1.SecuritySeverity.WARNING,
                    ipAddress,
                    details: { reason },
                    timestamp: new Date(),
                });
            }
            catch (error) {
                this.logger.error(`Failed to add IP to blacklist: ${error.message}`);
            }
        }
        /**
         * Nettoie une entrée pour prévenir les injections NoSQL
         */
        sanitizeInput(input) {
            if (typeof input === 'string') {
                return input.replace(/[${}()\\]/g, '\\$&');
            }
            if (Array.isArray(input)) {
                return input.map(item => this.sanitizeInput(item));
            }
            if (typeof input === 'object' && input !== null) {
                const sanitized = {};
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
        detectNoSqlInjection(input, path) {
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
                    /\$[\s]*[a-zA-Z0-9_]+/g, // Détecte les opérateurs MongoDB: $gt, $lt, etc.
                    /\.[a-zA-Z0-9_]+\(/g, // Détecte les méthodes potentielles: .exec()
                    /\{\s*\$where\s*:/g, // Détecte l'opérateur $where  
                    /;.+/g, // Points-virgules
                    /db\s*\.\s*[a-zA-Z0-9_]+\s*\(/g, // Appels à la base de données
                    /function\s*\(/g, // Définitions de fonctions
                    /eval\s*\(/g, // Eval
                ];
                const hasInjection = patterns.some(pattern => pattern.test(serialized));
                if (hasInjection) {
                    this.logger.warn(`Détection NoSQL: Injection potentielle détectée pour ${path}`);
                    return true;
                }
            }
            return false;
        }
        async checkBotDetection(req) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            // Log request for monitoring
            this.logger.debug(`Request from IP: ${ipAddress}, User-Agent: ${userAgent}`);
            // TODO: Implement bot detection logic
        }
        async checkNoSqlInjection(req) {
            // TODO: Implement NoSQL injection detection
        }
    };
    return SecurityService = _classThis;
})();
exports.SecurityService = SecurityService;
