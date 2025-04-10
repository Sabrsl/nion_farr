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
exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
let SecurityMiddleware = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SecurityMiddleware = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SecurityMiddleware = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        securityService;
        configService;
        logger = new common_1.Logger(SecurityMiddleware.name);
        excludedPaths = [
            '/health',
            '/health/detailed',
            '/security/csrf-tokens',
            '/auth/login',
            '/auth/register'
        ];
        constructor(securityService, configService) {
            this.securityService = securityService;
            this.configService = configService;
        }
        async use(req, res, next) {
            try {
                // Skip security checks for excluded paths
                if (this.excludedPaths.some(path => req.path.startsWith(path))) {
                    this.logger.debug(`Skipping security checks for excluded path: ${req.path}`);
                    return next();
                }
                // Skip security checks in development
                if (this.configService.get('NODE_ENV') === 'development') {
                    return next();
                }
                // In production, validate CSRF tokens for non-GET requests
                if (this.configService.get('NODE_ENV') === 'production' && req.method !== 'GET') {
                    const csrfToken = req.headers['x-csrf-token'];
                    if (!csrfToken) {
                        this.logger.warn(`CSRF token missing for path: ${req.path}`);
                        return res.status(403).json({
                            message: 'CSRF token missing',
                            code: 'CSRF_TOKEN_MISSING'
                        });
                    }
                    const isValid = await this.securityService.validateCsrfToken(csrfToken);
                    if (!isValid) {
                        this.logger.warn(`Invalid CSRF token for path: ${req.path}`);
                        return res.status(403).json({
                            message: 'Invalid CSRF token',
                            code: 'CSRF_TOKEN_INVALID'
                        });
                    }
                }
                // Continue with other security checks
                await this.securityService.checkBotDetection(req);
                await this.securityService.checkNoSqlInjection(req);
                await this.securityService.logRequest(req);
                next();
            }
            catch (error) {
                this.logger.error(`Security middleware error: ${error.message}`, error.stack);
                return res.status(500).json({
                    message: 'Internal server error',
                    code: 'SECURITY_ERROR'
                });
            }
        }
    };
    return SecurityMiddleware = _classThis;
})();
exports.SecurityMiddleware = SecurityMiddleware;
