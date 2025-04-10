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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let TokenService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TokenService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TokenService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        jwtService;
        configService;
        logger = new common_1.Logger(TokenService.name);
        ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes en secondes
        REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 jours en secondes
        constructor(connection, jwtService, configService) {
            this.connection = connection;
            this.jwtService = jwtService;
            this.configService = configService;
            try {
                // Créer l'index TTL pour supprimer automatiquement les tokens expirés
                this.connection.collection('refreshTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            }
            catch (error) {
                this.logger.error(`Failed to create TTL index: ${error.message}`);
            }
        }
        async generateTokens(userId, roles) {
            try {
                // Générer un identifiant unique pour le token de rafraîchissement
                const tokenId = (0, uuid_1.v4)();
                // Créer le token d'accès
                const accessToken = this.jwtService.sign({
                    sub: userId,
                    roles,
                    type: 'access'
                }, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
                // Créer le token de rafraîchissement
                const refreshToken = this.jwtService.sign({
                    sub: userId,
                    tokenId,
                    type: 'refresh'
                }, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
                // Enregistrer le token de rafraîchissement dans la base de données
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + this.REFRESH_TOKEN_EXPIRY);
                await this.connection.collection('refreshTokens').insertOne({
                    tokenId,
                    userId,
                    expiresAt,
                    createdAt: new Date(),
                    revoked: false
                });
                return { accessToken, refreshToken };
            }
            catch (error) {
                this.logger.error(`Failed to generate tokens: ${error.message}`);
                throw new common_1.UnauthorizedException('Failed to generate authentication tokens');
            }
        }
        async verifyRefreshToken(token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload.type !== 'refresh') {
                    this.logger.warn(`Invalid token type: ${payload.type}`);
                    return null;
                }
                // Vérifier si le token existe et n'est pas révoqué
                const storedToken = await this.connection.collection('refreshTokens').findOne({
                    tokenId: payload.tokenId,
                    revoked: false
                });
                if (!storedToken) {
                    this.logger.warn(`Token not found or revoked: ${payload.tokenId}`);
                    return null;
                }
                return {
                    userId: payload.sub,
                    tokenId: payload.tokenId
                };
            }
            catch (error) {
                this.logger.error(`Error verifying refresh token: ${error.message}`);
                return null;
            }
        }
        async revokeRefreshToken(tokenId) {
            try {
                await this.connection.collection('refreshTokens').updateOne({ tokenId }, { $set: { revoked: true } });
            }
            catch (error) {
                this.logger.error(`Failed to revoke refresh token: ${error.message}`);
                throw new common_1.UnauthorizedException('Failed to revoke refresh token');
            }
        }
        async revokeAllUserTokens(userId) {
            try {
                await this.connection.collection('refreshTokens').updateMany({ userId, revoked: false }, { $set: { revoked: true } });
            }
            catch (error) {
                this.logger.error(`Failed to revoke all user tokens: ${error.message}`);
                throw new common_1.UnauthorizedException('Failed to revoke all user tokens');
            }
        }
    };
    return TokenService = _classThis;
})();
exports.TokenService = TokenService;
