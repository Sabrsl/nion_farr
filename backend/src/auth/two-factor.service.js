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
const mongoose_1 = require("mongoose");
const otplib_1 = require("otplib");
const qrcode = __importStar(require("qrcode"));
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
        connection;
        configService;
        logger = new common_1.Logger(TwoFactorService.name);
        APP_NAME = 'Nionfar';
        constructor(connection, configService) {
            this.connection = connection;
            this.configService = configService;
        }
        async generateSecret(userId) {
            // Générer un secret unique pour l'utilisateur
            const secret = otplib_1.authenticator.generateSecret();
            // Créer l'URI pour le QR code
            const otpauth = otplib_1.authenticator.keyuri(userId, this.APP_NAME, secret);
            // Générer le QR code
            const qrCode = await qrcode.toDataURL(otpauth);
            // Enregistrer le secret dans la base de données (à utiliser uniquement après vérification)
            await this.connection.collection('twoFactorSecrets').updateOne({ userId }, {
                $set: {
                    secret,
                    verified: false,
                    createdAt: new Date()
                }
            }, { upsert: true });
            return { secret, qrCode };
        }
        async verifyToken(userId, token) {
            // Récupérer le secret de l'utilisateur
            const userSecret = await this.connection.collection('twoFactorSecrets').findOne({ userId });
            if (!userSecret || !userSecret.secret) {
                return false;
            }
            // Vérifier le token
            const isValid = otplib_1.authenticator.verify({
                token,
                secret: userSecret.secret
            });
            return isValid;
        }
        async enableTwoFactor(userId, token) {
            // Vérifier le token
            const isValid = await this.verifyToken(userId, token);
            if (!isValid) {
                return false;
            }
            // Marquer le secret comme vérifié
            await this.connection.collection('twoFactorSecrets').updateOne({ userId }, { $set: { verified: true } });
            // Mettre à jour le statut 2FA de l'utilisateur
            await this.connection.collection('users').updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $set: { twoFactorEnabled: true } });
            return true;
        }
        async disableTwoFactor(userId) {
            // Supprimer le secret
            await this.connection.collection('twoFactorSecrets').deleteOne({ userId });
            // Mettre à jour le statut 2FA de l'utilisateur
            await this.connection.collection('users').updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $set: { twoFactorEnabled: false } });
        }
        async isTwoFactorEnabled(userId) {
            const user = await this.connection.collection('users').findOne({ _id: new mongoose_1.Types.ObjectId(userId) });
            return user?.twoFactorEnabled || false;
        }
        async requireTwoFactor(userId) {
            const user = await this.connection.collection('users').findOne({ _id: new mongoose_1.Types.ObjectId(userId) });
            // Vérifier si l'utilisateur a un rôle qui nécessite 2FA
            const rolesRequiring2FA = ['admin', 'manager', 'finance'];
            return user?.roles?.some(role => rolesRequiring2FA.includes(role)) || false;
        }
    };
    return TwoFactorService = _classThis;
})();
exports.TwoFactorService = TwoFactorService;
