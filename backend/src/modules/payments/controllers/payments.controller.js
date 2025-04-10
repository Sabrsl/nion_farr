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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
const zod_validation_pipe_1 = require("../../../common/pipes/zod-validation.pipe");
const payment_schema_1 = require("../schemas/payment.schema");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let PaymentsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('payments'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createPayment_decorators;
    let _findAll_decorators;
    let _findUserPayments_decorators;
    let _findOne_decorators;
    let _handleWebhook_decorators;
    let _updateStatus_decorators;
    let _requestWithdrawal_decorators;
    let _getWithdrawalHistory_decorators;
    let _getUserTransactions_decorators;
    let _getUserBalance_decorators;
    var PaymentsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createPayment_decorators = [(0, common_1.Post)(), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(payment_schema_1.createPaymentSchema))];
            _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN)];
            _findUserPayments_decorators = [(0, common_1.Get)('user')];
            _findOne_decorators = [(0, common_1.Get)(':id')];
            _handleWebhook_decorators = [(0, common_1.Post)('webhook'), (0, public_decorator_1.Public)(), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(payment_schema_1.paymentWebhookSchema))];
            _updateStatus_decorators = [(0, common_1.Patch)(':id/status'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(payment_schema_1.updatePaymentStatusSchema))];
            _requestWithdrawal_decorators = [(0, common_1.Post)('withdrawal'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(payment_schema_1.withdrawalSchema))];
            _getWithdrawalHistory_decorators = [(0, common_1.Get)('withdrawal/history')];
            _getUserTransactions_decorators = [(0, common_1.Get)('transactions')];
            _getUserBalance_decorators = [(0, common_1.Get)('balance')];
            __esDecorate(this, null, _createPayment_decorators, { kind: "method", name: "createPayment", static: false, private: false, access: { has: obj => "createPayment" in obj, get: obj => obj.createPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findUserPayments_decorators, { kind: "method", name: "findUserPayments", static: false, private: false, access: { has: obj => "findUserPayments" in obj, get: obj => obj.findUserPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _requestWithdrawal_decorators, { kind: "method", name: "requestWithdrawal", static: false, private: false, access: { has: obj => "requestWithdrawal" in obj, get: obj => obj.requestWithdrawal }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getWithdrawalHistory_decorators, { kind: "method", name: "getWithdrawalHistory", static: false, private: false, access: { has: obj => "getWithdrawalHistory" in obj, get: obj => obj.getWithdrawalHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUserTransactions_decorators, { kind: "method", name: "getUserTransactions", static: false, private: false, access: { has: obj => "getUserTransactions" in obj, get: obj => obj.getUserTransactions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUserBalance_decorators, { kind: "method", name: "getUserBalance", static: false, private: false, access: { has: obj => "getUserBalance" in obj, get: obj => obj.getUserBalance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(paymentsService) {
            this.paymentsService = paymentsService;
        }
        createPayment(createPaymentDto, req) {
            return this.paymentsService.createPayment(createPaymentDto, req.user.id);
        }
        findAll() {
            return this.paymentsService.findAll();
        }
        findUserPayments(req) {
            return this.paymentsService.findUserPayments(req.user.id);
        }
        findOne(id, req) {
            return this.paymentsService.findOne(id, req.user);
        }
        handleWebhook(webhookData) {
            return this.paymentsService.handleWebhook(webhookData);
        }
        updateStatus(id, statusData) {
            return this.paymentsService.updateStatus(id, statusData);
        }
        requestWithdrawal(withdrawalDto, req) {
            return this.paymentsService.requestWithdrawal(withdrawalDto, req.user.id);
        }
        getWithdrawalHistory(req) {
            return this.paymentsService.getWithdrawalHistory(req.user.id);
        }
        getUserTransactions(req) {
            return this.paymentsService.getUserTransactions(req.user.id);
        }
        getUserBalance(req) {
            return this.paymentsService.getUserBalance(req.user.id);
        }
    };
    return PaymentsController = _classThis;
})();
exports.PaymentsController = PaymentsController;
