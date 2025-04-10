"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const otplib_1 = require("otplib");
const QRCode = __importStar(require("qrcode"));
const user_role_enum_1 = require("../../users/enums/user-role.enum");
let TwoFactorService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TwoFactorService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TwoFactorService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userRepository;
        auditService;
        logger = new common_1.Logger(TwoFactorService.name);
        APP_NAME = 'NionFar';
        constructor(userRepository, auditService) {
            this.userRepository = userRepository;
            this.auditService = auditService;
        }
        async generateSecret(userId) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('Utilisateur non trouvé');
            }
            const secret = otplib_1.authenticator.generateSecret();
            const otpauth = otplib_1.authenticator.keyuri(user.email, this.APP_NAME, secret);
            const qrCode = await QRCode.toDataURL(otpauth);
            // Sauvegarder le secret temporairement
            user.twoFactorSecret = secret;
            await this.userRepository.save(user);
            await this.auditService.log({
                userId,
                action: audit_service_1.AuditAction.TWO_FACTOR_ENABLED,
                details: {
                    message: 'Génération du secret 2FA',
                    type: 'secret_generation'
                },
                ipAddress: 'SYSTEM',
                userAgent: 'SYSTEM',
                timestamp: new Date()
            });
            return { secret, qrCode };
        }
        async verifyToken(userId, token) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.twoFactorSecret) {
                throw new common_1.NotFoundException('Utilisateur non trouvé ou 2FA non configuré');
            }
            const isValid = otplib_1.authenticator.verify({ token, secret: user.twoFactorSecret });
            await this.auditService.log({
                userId,
                action: isValid ? audit_service_1.AuditAction.TWO_FACTOR_ENABLED : audit_service_1.AuditAction.LOGIN_FAILED,
                details: {
                    message: isValid ? 'Vérification 2FA réussie' : 'Échec de la vérification 2FA',
                    success: isValid,
                    type: 'token_verification'
                },
                ipAddress: 'SYSTEM',
                userAgent: 'SYSTEM',
                timestamp: new Date()
            });
            return isValid;
        }
        async enable(userId, token) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.twoFactorSecret) {
                throw new common_1.NotFoundException('Utilisateur non trouvé ou 2FA non configuré');
            }
            const isValid = otplib_1.authenticator.verify({ token, secret: user.twoFactorSecret });
            if (!isValid) {
                throw new common_1.UnauthorizedException('Code 2FA invalide');
            }
            user.isTwoFactorEnabled = true;
            await this.userRepository.save(user);
            await this.auditService.log({
                userId,
                action: audit_service_1.AuditAction.TWO_FACTOR_ENABLED,
                details: {
                    message: '2FA activé avec succès',
                    success: true,
                    type: 'enable_2fa'
                },
                ipAddress: 'SYSTEM',
                userAgent: 'SYSTEM',
                timestamp: new Date()
            });
        }
        async disable(userId, token) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.isTwoFactorEnabled) {
                throw new common_1.NotFoundException('Utilisateur non trouvé ou 2FA non activé');
            }
            const isValid = otplib_1.authenticator.verify({ token, secret: user.twoFactorSecret });
            if (!isValid) {
                throw new common_1.UnauthorizedException('Code 2FA invalide');
            }
            user.isTwoFactorEnabled = false;
            user.twoFactorSecret = null;
            await this.userRepository.save(user);
            await this.auditService.log({
                userId,
                action: audit_service_1.AuditAction.TWO_FACTOR_DISABLED,
                details: {
                    message: '2FA désactivé',
                    success: true,
                    type: 'disable_2fa'
                },
                ipAddress: 'SYSTEM',
                userAgent: 'SYSTEM',
                timestamp: new Date()
            });
        }
        async isTwoFactorEnabled(userId) {
            try {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                return user?.isTwoFactorEnabled || false;
            }
            catch (error) {
                this.logger.error(`Erreur lors de la vérification du statut 2FA: ${error.message}`);
                throw error;
            }
        }
        async requireTwoFactor(userId) {
            try {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                // Vérifier si l'utilisateur a un rôle qui nécessite 2FA
                const rolesRequiring2FA = [user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPER_ADMIN];
                return user?.role && rolesRequiring2FA.includes(user.role) || false;
            }
            catch (error) {
                this.logger.error(`Erreur lors de la vérification de l'obligation 2FA: ${error.message}`);
                throw error;
            }
        }
        // Alias pour la compatibilité avec le code existant
        async enableTwoFactor(userId, token) {
            await this.enable(userId, token);
            return true;
        }
        // Alias pour la compatibilité avec le code existant
        async disableTwoFactor(userId) {
            // Pour la désactivation, nous n'avons pas besoin de vérifier le token
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.isTwoFactorEnabled) {
                throw new common_1.NotFoundException('Utilisateur non trouvé ou 2FA non activé');
            }
            user.isTwoFactorEnabled = false;
            user.twoFactorSecret = null;
            await this.userRepository.save(user);
            await this.auditService.log({
                userId,
                action: audit_service_1.AuditAction.TWO_FACTOR_DISABLED,
                details: {
                    message: '2FA désactivé',
                    success: true,
                    type: 'disable_2fa'
                },
                ipAddress: 'SYSTEM',
                userAgent: 'SYSTEM',
                timestamp: new Date()
            });
        }
    };
    return TwoFactorService = _classThis;
})();
exports.TwoFactorService = TwoFactorService;
