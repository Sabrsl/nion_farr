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
const public_decorator_1 = require("./decorators/public.decorator");
let AuthController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('auth'), (0, common_1.Controller)('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _register_decorators;
    let _login_decorators;
    let _refreshTokens_decorators;
    let _verifyEmail_decorators;
    let _getCsrfTokens_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _register_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('register'), (0, swagger_1.ApiOperation)({ summary: 'Inscription d\'un nouvel utilisateur' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'L\'utilisateur a été créé avec succès' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Requête invalide' })];
            _login_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('login'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Connexion d\'un utilisateur' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'utilisateur a été connecté avec succès' }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides' })];
            _refreshTokens_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('refresh'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Rafraîchir les tokens d\'authentification' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Les tokens ont été rafraîchis avec succès' }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Token de rafraîchissement invalide' })];
            _verifyEmail_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('verify-email/:token'), (0, swagger_1.ApiOperation)({ summary: 'Vérifier l\'email d\'un utilisateur' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'email a été vérifié avec succès' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Token invalide' })];
            _getCsrfTokens_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('csrf-tokens'), (0, swagger_1.ApiOperation)({ summary: 'Get CSRF tokens' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'CSRF tokens generated successfully' })];
            __esDecorate(this, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refreshTokens_decorators, { kind: "method", name: "refreshTokens", static: false, private: false, access: { has: obj => "refreshTokens" in obj, get: obj => obj.refreshTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyEmail_decorators, { kind: "method", name: "verifyEmail", static: false, private: false, access: { has: obj => "verifyEmail" in obj, get: obj => obj.verifyEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCsrfTokens_decorators, { kind: "method", name: "getCsrfTokens", static: false, private: false, access: { has: obj => "getCsrfTokens" in obj, get: obj => obj.getCsrfTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        securityService;
        constructor(authService, securityService) {
            this.authService = authService;
            this.securityService = securityService;
        }
        async register(registerDto) {
            return this.authService.register(registerDto);
        }
        async login(loginDto) {
            return this.authService.login(loginDto);
        }
        async refreshTokens(refreshTokenDto) {
            return this.authService.refreshToken(refreshTokenDto);
        }
        async verifyEmail(token) {
            // À implémenter - verification du token d'email
            return { success: true, message: 'Email vérifié avec succès' };
        }
        async getCsrfTokens() {
            const token = this.securityService.generateCsrfToken();
            return {
                token
            };
        }
    };
    return AuthController = _classThis;
})();
exports.AuthController = AuthController;
