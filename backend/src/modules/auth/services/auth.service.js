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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const user_entity_1 = require("../../users/entities/user.entity");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        jwtService;
        configService;
        emailService;
        smsService;
        usersRepository;
        tokenService;
        logger = new common_1.Logger(AuthService.name);
        constructor(jwtService, configService, emailService, smsService, usersRepository, tokenService) {
            this.jwtService = jwtService;
            this.configService = configService;
            this.emailService = emailService;
            this.smsService = smsService;
            this.usersRepository = usersRepository;
            this.tokenService = tokenService;
        }
        async validateUser(email, password) {
            // TODO: Implémenter la validation utilisateur avec la base de données
            const user = { id: '1', email: 'test@example.com', password: await bcrypt.hash('password', 10), role: 'user', isTwoFactorEnabled: false };
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return null;
            }
            const { password: _, ...result } = user;
            return result;
        }
        async login(user, rememberMe) {
            const payload = { sub: user.id, username: user.email };
            // Générer les tokens
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'refreshSecret',
                expiresIn: rememberMe ? '7d' : '24h',
            });
            // Stocker le refresh token en base de données
            await this.storeRefreshToken(user.id, refreshToken);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isFreelancer: user.isFreelancer,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                },
            };
        }
        async refreshToken(userId, refreshToken) {
            // Vérifier que le refresh token existe dans la base de données
            const isRefreshTokenValid = await this.validateRefreshToken(userId, refreshToken);
            if (!isRefreshTokenValid) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            // Récupérer l'utilisateur
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'email', 'role', 'firstName', 'lastName', 'isFreelancer', 'isTwoFactorEnabled'],
            });
            // Générer un nouveau token d'accès
            const payload = { sub: user.id, username: user.email };
            const accessToken = this.jwtService.sign(payload);
            return {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isFreelancer: user.isFreelancer,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                },
            };
        }
        async logout(userId) {
            // TODO: Implémenter la déconnexion avec la base de données
            // Idéalement, on invaliderait le refreshToken en base
            return { message: 'Déconnexion réussie.' };
        }
        async register(registerDto) {
            try {
                this.logger.log(`Inscription d'un nouvel utilisateur: ${registerDto.email}`);
                // Vérifier si l'utilisateur existe déjà
                const existingUser = await this.usersRepository.findOne({
                    where: { email: registerDto.email }
                });
                if (existingUser) {
                    throw new common_1.ConflictException('Cet email est déjà utilisé');
                }
                // Hasher le mot de passe
                const hashedPassword = await bcrypt.hash(registerDto.password, 10);
                const verificationToken = (0, uuid_1.v4)();
                // Créer une nouvelle entité utilisateur avec les données fournies
                const newUser = new user_entity_1.User({
                    email: registerDto.email,
                    username: registerDto.username,
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                    password: hashedPassword,
                    emailVerificationToken: verificationToken,
                    isEmailVerified: false,
                    role: registerDto.role?.toLowerCase() || 'client',
                    isFreelancer: registerDto.isFreelancer || registerDto.role?.toLowerCase() === 'freelancer'
                });
                // Sauvegarder l'utilisateur dans la base de données
                const savedUser = await this.usersRepository.save(newUser);
                this.logger.log(`Utilisateur créé avec succès: ${savedUser.id}`);
                // Essayer d'envoyer un email de vérification
                try {
                    await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);
                    this.logger.log(`Email de vérification envoyé à: ${savedUser.email}`);
                }
                catch (emailError) {
                    this.logger.error(`Erreur lors de l'envoi de l'email: ${emailError.message}`);
                    // On continue malgré l'erreur d'email
                }
                // Générer un token pour l'utilisateur
                const payload = {
                    sub: savedUser.id,
                    email: savedUser.email,
                    role: savedUser.role
                };
                const token = this.jwtService.sign(payload);
                // Préparer la réponse sans données sensibles
                const { password, emailVerificationToken, ...userResponse } = savedUser;
                return {
                    message: 'Inscription réussie',
                    user: userResponse,
                    token
                };
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'inscription: ${error.message}`);
                if (error instanceof common_1.ConflictException) {
                    throw error;
                }
                throw new common_1.BadRequestException(error.message || "Une erreur est survenue lors de l'inscription");
            }
        }
        async verifyEmail(token) {
            // TODO: Implémenter la vérification d'email avec la base de données
            if (token !== 'fake-token') {
                throw new common_1.BadRequestException('Token invalide ou expiré');
            }
            return { message: 'Email vérifié avec succès.' };
        }
        async forgotPassword(email) {
            // TODO: Implémenter la réinitialisation de mot de passe avec la base de données
            const resetToken = (0, uuid_1.v4)();
            await this.emailService.sendPasswordResetEmail(email, resetToken);
            return { message: 'Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation.' };
        }
        async resetPassword(token, newPassword) {
            // TODO: Implémenter la réinitialisation de mot de passe avec la base de données
            if (token !== 'fake-token') {
                throw new common_1.BadRequestException('Token invalide ou expiré');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            return { message: 'Mot de passe réinitialisé avec succès.' };
        }
        async generateTwoFactorQrCode(userId) {
            // TODO: Implémenter la génération de QR code avec la base de données
            const user = { id: userId, email: 'test@example.com' };
            const secret = otplib_1.authenticator.generateSecret();
            const otpAuthUrl = otplib_1.authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_APP_NAME'), secret);
            const qrCodeDataUrl = await (0, qrcode_1.toDataURL)(otpAuthUrl);
            return {
                secret,
                qrCodeDataUrl,
            };
        }
        async enableTwoFactor(userId, twoFactorCode) {
            // TODO: Implémenter l'activation de l'authentification à deux facteurs avec la base de données
            const user = { id: userId, twoFactorSecret: 'FAKE_SECRET' };
            const isCodeValid = otplib_1.authenticator.verify({
                token: twoFactorCode,
                secret: user.twoFactorSecret,
            });
            if (!isCodeValid) {
                throw new common_1.UnauthorizedException('Code invalide');
            }
            return { message: 'Authentification à deux facteurs activée avec succès.' };
        }
        async disableTwoFactor(userId) {
            // TODO: Implémenter la désactivation de l'authentification à deux facteurs avec la base de données
            return { message: 'Authentification à deux facteurs désactivée avec succès.' };
        }
        async resendVerificationEmail(userId) {
            // TODO: Implémenter le renvoi d'email de vérification avec la base de données
            const user = { id: userId, email: 'test@example.com' };
            const verificationToken = (0, uuid_1.v4)();
            await this.emailService.sendVerificationEmail(user.email, verificationToken);
            return { message: 'Email de vérification renvoyé avec succès.' };
        }
        async verifyTwoFactor(userId, twoFactorCode) {
            // TODO: Implémenter la vérification de l'authentification à deux facteurs avec la base de données
            const user = {
                id: userId,
                email: 'test@example.com',
                role: 'user',
                twoFactorSecret: 'FAKE_SECRET'
            };
            const isCodeValid = otplib_1.authenticator.verify({
                token: twoFactorCode,
                secret: user.twoFactorSecret,
            });
            if (!isCodeValid) {
                throw new common_1.UnauthorizedException('Code invalide');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            return {
                accessToken: this.jwtService.sign(payload),
                refreshToken: this.jwtService.sign(payload, {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                    expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
                }),
                user,
            };
        }
        async storeRefreshToken(userId, refreshToken) {
            try {
                // Ici, vous pouvez stocker le token dans la base de données
                // Par exemple, mettre à jour l'utilisateur avec son refresh token actuel
                await this.usersRepository.update(userId, {
                    refreshToken: refreshToken,
                });
            }
            catch (error) {
                this.logger.error(`Failed to store refresh token: ${error.message}`);
                throw new common_1.UnauthorizedException('Failed to store refresh token');
            }
        }
        async validateRefreshToken(userId, token) {
            try {
                // Récupérer l'utilisateur avec son token de rafraîchissement
                const user = await this.usersRepository.findOne({
                    where: { id: userId },
                    select: ['id', 'refreshToken'],
                });
                if (!user || !user.refreshToken) {
                    return false;
                }
                // Vérifier que le token correspond
                return user.refreshToken === token;
            }
            catch (error) {
                this.logger.error(`Failed to validate refresh token: ${error.message}`);
                return false;
            }
        }
    };
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
