"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const register_dto_1 = require("../dto/register.dto");
const login_dto_1 = require("../dto/login.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const local_auth_guard_1 = require("../guards/local-auth.guard");
const refresh_token_guard_1 = require("../guards/refresh-token.guard");
const zod_validation_pipe_1 = require("../../../common/pipes/zod-validation.pipe");
const auth_schema_1 = require("../schemas/auth.schema");
const public_decorator_1 = require("../decorators/public.decorator");
let AuthController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Authentification'), (0, common_1.Controller)('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _register_decorators;
    let _login_decorators;
    let _logout_decorators;
    let _refreshToken_decorators;
    let _verifyEmail_decorators;
    let _resendVerificationEmail_decorators;
    let _forgotPassword_decorators;
    let _resetPassword_decorators;
    let _generateTwoFactorQrCode_decorators;
    let _enableTwoFactor_decorators;
    let _disableTwoFactor_decorators;
    let _verifyTwoFactor_decorators;
    let _getProfile_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _register_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('register'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.registerSchema)), (0, swagger_1.ApiOperation)({ summary: 'Inscription d\'un nouvel utilisateur' }), (0, swagger_1.ApiResponse)({
                    status: 201,
                    description: 'L\'utilisateur a été créé avec succès.'
                }), (0, swagger_1.ApiResponse)({
                    status: 400,
                    description: 'Données invalides.'
                }), (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto })];
            _login_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('login'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.loginSchema)), (0, swagger_1.ApiOperation)({ summary: 'Connexion d\'un utilisateur' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'L\'utilisateur est connecté avec succès.'
                }), (0, swagger_1.ApiResponse)({
                    status: 401,
                    description: 'Identifiants invalides.'
                }), (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto })];
            _logout_decorators = [(0, common_1.Post)('logout'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Déconnexion d\'un utilisateur' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'L\'utilisateur est déconnecté avec succès.'
                })];
            _refreshToken_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('refresh-token'), (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.refreshTokenSchema)), (0, swagger_1.ApiOperation)({ summary: 'Rafraîchir le token d\'accès' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Token rafraîchi avec succès.'
                }), (0, swagger_1.ApiResponse)({
                    status: 401,
                    description: 'Refresh token invalide ou expiré.'
                })];
            _verifyEmail_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('verify-email'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.verifyEmailSchema)), (0, swagger_1.ApiOperation)({ summary: 'Vérifier l\'adresse email' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Email vérifié avec succès.'
                }), (0, swagger_1.ApiResponse)({
                    status: 400,
                    description: 'Token invalide ou expiré.'
                })];
            _resendVerificationEmail_decorators = [(0, common_1.Post)('resend-verification'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Renvoyer l\'email de vérification' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Email de vérification renvoyé avec succès.'
                })];
            _forgotPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('forgot-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.forgotPasswordSchema)), (0, swagger_1.ApiOperation)({ summary: 'Demander la réinitialisation du mot de passe' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Email de réinitialisation envoyé avec succès.'
                })];
            _resetPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('reset-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(auth_schema_1.resetPasswordSchema)), (0, swagger_1.ApiOperation)({ summary: 'Réinitialiser le mot de passe' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Mot de passe réinitialisé avec succès.'
                }), (0, swagger_1.ApiResponse)({
                    status: 400,
                    description: 'Token invalide ou expiré.'
                })];
            _generateTwoFactorQrCode_decorators = [(0, common_1.Get)('two-factor/generate'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Générer un QR code pour l\'authentification à deux facteurs' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'QR code généré avec succès'
                })];
            _enableTwoFactor_decorators = [(0, common_1.Post)('two-factor/enable'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Activer l\'authentification à deux facteurs' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Authentification à deux facteurs activée avec succès'
                }), (0, swagger_1.ApiResponse)({
                    status: 400,
                    description: 'Code invalide'
                })];
            _disableTwoFactor_decorators = [(0, common_1.Post)('two-factor/disable'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Désactiver l\'authentification à deux facteurs' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Authentification à deux facteurs désactivée avec succès'
                })];
            _verifyTwoFactor_decorators = [(0, common_1.Post)('two-factor/verify'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Vérifier un code d\'authentification à deux facteurs' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Code vérifié avec succès'
                }), (0, swagger_1.ApiResponse)({
                    status: 400,
                    description: 'Code invalide'
                })];
            _getProfile_decorators = [(0, common_1.Get)('profile'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Obtenir les informations de l\'utilisateur connecté' }), (0, swagger_1.ApiResponse)({
                    status: 200,
                    description: 'Informations de l\'utilisateur récupérées avec succès.'
                })];
            __esDecorate(this, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: obj => "logout" in obj, get: obj => obj.logout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refreshToken_decorators, { kind: "method", name: "refreshToken", static: false, private: false, access: { has: obj => "refreshToken" in obj, get: obj => obj.refreshToken }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyEmail_decorators, { kind: "method", name: "verifyEmail", static: false, private: false, access: { has: obj => "verifyEmail" in obj, get: obj => obj.verifyEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resendVerificationEmail_decorators, { kind: "method", name: "resendVerificationEmail", static: false, private: false, access: { has: obj => "resendVerificationEmail" in obj, get: obj => obj.resendVerificationEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: obj => "forgotPassword" in obj, get: obj => obj.forgotPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: obj => "resetPassword" in obj, get: obj => obj.resetPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateTwoFactorQrCode_decorators, { kind: "method", name: "generateTwoFactorQrCode", static: false, private: false, access: { has: obj => "generateTwoFactorQrCode" in obj, get: obj => obj.generateTwoFactorQrCode }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _enableTwoFactor_decorators, { kind: "method", name: "enableTwoFactor", static: false, private: false, access: { has: obj => "enableTwoFactor" in obj, get: obj => obj.enableTwoFactor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _disableTwoFactor_decorators, { kind: "method", name: "disableTwoFactor", static: false, private: false, access: { has: obj => "disableTwoFactor" in obj, get: obj => obj.disableTwoFactor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyTwoFactor_decorators, { kind: "method", name: "verifyTwoFactor", static: false, private: false, access: { has: obj => "verifyTwoFactor" in obj, get: obj => obj.verifyTwoFactor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        twoFactorService;
        logger = new common_1.Logger(AuthController.name);
        constructor(authService, twoFactorService) {
            this.authService = authService;
            this.twoFactorService = twoFactorService;
        }
        async register(registerDto) {
            try {
                return await this.authService.register(registerDto);
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'inscription: ${error.message}`);
                throw error;
            }
        }
        async login(req, loginDto, response) {
            try {
                const { accessToken, refreshToken, user } = await this.authService.login(req.user);
                response.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                });
                return {
                    accessToken,
                    user,
                    message: 'Connexion réussie',
                };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la connexion: ${error.message}`);
                throw error;
            }
        }
        async logout(req, response) {
            try {
                await this.authService.logout(req.user.id);
                // Supprimer le cookie de refresh token
                response.clearCookie('refresh_token');
                return { message: 'Déconnexion réussie' };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la déconnexion: ${error.message}`);
                throw error;
            }
        }
        async refreshToken(req, refreshTokenDto) {
            return this.authService.refreshToken(req.user.id, refreshTokenDto.refreshToken);
        }
        async verifyEmail(verifyEmailDto) {
            return this.authService.verifyEmail(verifyEmailDto.token);
        }
        async resendVerificationEmail(req) {
            return this.authService.resendVerificationEmail(req.user.id);
        }
        async forgotPassword(forgotPasswordDto) {
            return this.authService.forgotPassword(forgotPasswordDto.email);
        }
        async resetPassword(resetPasswordDto) {
            return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        }
        async generateTwoFactorQrCode(req) {
            try {
                return await this.twoFactorService.generateSecret(req.user.id);
            }
            catch (error) {
                this.logger.error(`Erreur lors de la génération du QR code 2FA: ${error.message}`);
                throw error;
            }
        }
        async enableTwoFactor(req, enableTwoFactorDto) {
            try {
                const result = await this.twoFactorService.enableTwoFactor(req.user.id, enableTwoFactorDto.twoFactorCode);
                if (!result) {
                    throw new common_1.BadRequestException('Code 2FA invalide');
                }
                return { message: 'Authentification à deux facteurs activée avec succès' };
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'activation de la 2FA: ${error.message}`);
                throw error;
            }
        }
        async disableTwoFactor(req) {
            try {
                await this.twoFactorService.disableTwoFactor(req.user.id);
                return { message: 'Authentification à deux facteurs désactivée avec succès' };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la désactivation de la 2FA: ${error.message}`);
                throw error;
            }
        }
        async verifyTwoFactor(verifyTwoFactorDto) {
            try {
                const isValid = await this.twoFactorService.verifyToken(verifyTwoFactorDto.userId, verifyTwoFactorDto.twoFactorCode);
                if (!isValid) {
                    throw new common_1.UnauthorizedException('Code 2FA invalide');
                }
                return { message: 'Code vérifié avec succès' };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la vérification du code 2FA: ${error.message}`);
                throw error;
            }
        }
        getProfile(req) {
            return req.user;
        }
    };
    return AuthController = _classThis;
})();
exports.AuthController = AuthController;
