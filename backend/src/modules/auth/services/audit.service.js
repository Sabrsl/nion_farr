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
exports.AuditService = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
var AuditAction;
(function (AuditAction) {
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["LOGIN_FAILED"] = "LOGIN_FAILED";
    AuditAction["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditAction["PASSWORD_RESET"] = "PASSWORD_RESET";
    AuditAction["TWO_FACTOR_ENABLED"] = "TWO_FACTOR_ENABLED";
    AuditAction["TWO_FACTOR_DISABLED"] = "TWO_FACTOR_DISABLED";
    AuditAction["USER_CREATED"] = "USER_CREATED";
    AuditAction["USER_UPDATED"] = "USER_UPDATED";
    AuditAction["USER_DELETED"] = "USER_DELETED";
    AuditAction["ROLE_CHANGED"] = "ROLE_CHANGED";
    AuditAction["PERMISSION_CHANGED"] = "PERMISSION_CHANGED";
    AuditAction["DATA_EXPORTED"] = "DATA_EXPORTED";
    AuditAction["DATA_IMPORTED"] = "DATA_IMPORTED";
    AuditAction["PAYMENT_PROCESSED"] = "PAYMENT_PROCESSED";
    AuditAction["REFUND_PROCESSED"] = "REFUND_PROCESSED";
    AuditAction["SETTINGS_CHANGED"] = "SETTINGS_CHANGED";
    AuditAction["API_KEY_CREATED"] = "API_KEY_CREATED";
    AuditAction["API_KEY_REVOKED"] = "API_KEY_REVOKED";
    AuditAction["BACKUP_CREATED"] = "BACKUP_CREATED";
    AuditAction["BACKUP_RESTORED"] = "BACKUP_RESTORED";
    AuditAction["MIGRATION_RUN"] = "MIGRATION_RUN";
    AuditAction["OTHER"] = "OTHER";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let AuditService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuditService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(AuditService.name);
        async log(entry) {
            // Dans un environnement de production, nous enregistrerions cela dans une base de données
            // Pour l'instant, nous allons simplement logger l'information
            this.logger.log(`Audit: ${entry.action} - User: ${entry.userId || 'Unknown'} - ${JSON.stringify(entry.details || {})}`);
        }
    };
    return AuditService = _classThis;
})();
exports.AuditService = AuditService;
