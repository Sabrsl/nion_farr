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
exports.LoginAttemptService = void 0;
const common_1 = require("@nestjs/common");
let LoginAttemptService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var LoginAttemptService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoginAttemptService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        logger = new common_1.Logger(LoginAttemptService.name);
        MAX_ATTEMPTS = 5;
        LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes
        ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 heure en millisecondes
        constructor(connection) {
            this.connection = connection;
            // Créer l'index TTL pour supprimer automatiquement les tentatives après la fenêtre
            this.connection.collection('loginAttempts').createIndex({ createdAt: 1 }, { expireAfterSeconds: this.ATTEMPT_WINDOW / 1000 });
        }
        async recordFailedAttempt(identifier) {
            const now = new Date();
            const lockoutEndsAt = new Date(now.getTime() + this.LOCKOUT_DURATION);
            // Enregistrer la tentative échouée
            await this.connection.collection('loginAttempts').insertOne({
                identifier,
                createdAt: now,
            });
            // Compter les tentatives dans la fenêtre
            const attempts = await this.connection.collection('loginAttempts').countDocuments({
                identifier,
                createdAt: { $gte: new Date(now.getTime() - this.ATTEMPT_WINDOW) }
            });
            const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - attempts);
            const isLocked = attempts >= this.MAX_ATTEMPTS;
            return {
                isLocked,
                remainingAttempts,
                lockoutEndsAt: isLocked ? lockoutEndsAt : undefined
            };
        }
        async isLocked(identifier) {
            const now = new Date();
            // Compter les tentatives dans la fenêtre
            const attempts = await this.connection.collection('loginAttempts').countDocuments({
                identifier,
                createdAt: { $gte: new Date(now.getTime() - this.ATTEMPT_WINDOW) }
            });
            const isLocked = attempts >= this.MAX_ATTEMPTS;
            if (isLocked) {
                // Calculer quand le verrouillage se termine
                const lockoutEndsAt = new Date(now.getTime() + this.LOCKOUT_DURATION);
                return { isLocked, lockoutEndsAt };
            }
            return { isLocked: false };
        }
        async resetAttempts(identifier) {
            await this.connection.collection('loginAttempts').deleteMany({ identifier });
        }
    };
    return LoginAttemptService = _classThis;
})();
exports.LoginAttemptService = LoginAttemptService;
