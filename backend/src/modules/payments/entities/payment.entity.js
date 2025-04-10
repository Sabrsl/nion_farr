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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Payment = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('payments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _transactionId_decorators;
    let _transactionId_initializers = [];
    let _transactionId_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _providerResponse_decorators;
    let _providerResponse_initializers = [];
    let _providerResponse_extraInitializers = [];
    let _providerTransactionId_decorators;
    let _providerTransactionId_initializers = [];
    let _providerTransactionId_extraInitializers = [];
    let _providerFee_decorators;
    let _providerFee_initializers = [];
    let _providerFee_extraInitializers = [];
    let _serviceFee_decorators;
    let _serviceFee_initializers = [];
    let _serviceFee_extraInitializers = [];
    let _currency_decorators;
    let _currency_initializers = [];
    let _currency_extraInitializers = [];
    let _failureReason_decorators;
    let _failureReason_initializers = [];
    let _failureReason_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Payment = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _transactionId_decorators = [(0, typeorm_1.Column)({ unique: true })];
            _user_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User), (0, typeorm_1.JoinColumn)({ name: 'userId' })];
            _userId_decorators = [(0, typeorm_1.Column)()];
            _order_decorators = [(0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.payments, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'orderId' })];
            _orderId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _amount_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
            _status_decorators = [(0, typeorm_1.Column)()];
            _method_decorators = [(0, typeorm_1.Column)()];
            _type_decorators = [(0, typeorm_1.Column)()];
            _description_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
            _metadata_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
            _providerResponse_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
            _providerTransactionId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _providerFee_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _serviceFee_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _currency_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _failureReason_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _transactionId_decorators, { kind: "field", name: "transactionId", static: false, private: false, access: { has: obj => "transactionId" in obj, get: obj => obj.transactionId, set: (obj, value) => { obj.transactionId = value; } }, metadata: _metadata }, _transactionId_initializers, _transactionId_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            __esDecorate(null, null, _providerResponse_decorators, { kind: "field", name: "providerResponse", static: false, private: false, access: { has: obj => "providerResponse" in obj, get: obj => obj.providerResponse, set: (obj, value) => { obj.providerResponse = value; } }, metadata: _metadata }, _providerResponse_initializers, _providerResponse_extraInitializers);
            __esDecorate(null, null, _providerTransactionId_decorators, { kind: "field", name: "providerTransactionId", static: false, private: false, access: { has: obj => "providerTransactionId" in obj, get: obj => obj.providerTransactionId, set: (obj, value) => { obj.providerTransactionId = value; } }, metadata: _metadata }, _providerTransactionId_initializers, _providerTransactionId_extraInitializers);
            __esDecorate(null, null, _providerFee_decorators, { kind: "field", name: "providerFee", static: false, private: false, access: { has: obj => "providerFee" in obj, get: obj => obj.providerFee, set: (obj, value) => { obj.providerFee = value; } }, metadata: _metadata }, _providerFee_initializers, _providerFee_extraInitializers);
            __esDecorate(null, null, _serviceFee_decorators, { kind: "field", name: "serviceFee", static: false, private: false, access: { has: obj => "serviceFee" in obj, get: obj => obj.serviceFee, set: (obj, value) => { obj.serviceFee = value; } }, metadata: _metadata }, _serviceFee_initializers, _serviceFee_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: obj => "currency" in obj, get: obj => obj.currency, set: (obj, value) => { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _failureReason_decorators, { kind: "field", name: "failureReason", static: false, private: false, access: { has: obj => "failureReason" in obj, get: obj => obj.failureReason, set: (obj, value) => { obj.failureReason = value; } }, metadata: _metadata }, _failureReason_initializers, _failureReason_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Payment = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        transactionId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _transactionId_initializers, void 0));
        user = (__runInitializers(this, _transactionId_extraInitializers), __runInitializers(this, _user_initializers, void 0));
        userId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        order = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        orderId = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
        amount = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _amount_initializers, void 0)); // Amount in FCFA
        status = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        method = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _method_initializers, void 0));
        type = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        description = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        metadata = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
        providerResponse = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _providerResponse_initializers, void 0));
        providerTransactionId = (__runInitializers(this, _providerResponse_extraInitializers), __runInitializers(this, _providerTransactionId_initializers, void 0));
        providerFee = (__runInitializers(this, _providerTransactionId_extraInitializers), __runInitializers(this, _providerFee_initializers, void 0));
        serviceFee = (__runInitializers(this, _providerFee_extraInitializers), __runInitializers(this, _serviceFee_initializers, void 0));
        currency = (__runInitializers(this, _serviceFee_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
        failureReason = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _failureReason_initializers, void 0));
        createdAt = (__runInitializers(this, _failureReason_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor(partial) {
            __runInitializers(this, _updatedAt_extraInitializers);
            Object.assign(this, partial);
        }
    };
    return Payment = _classThis;
})();
exports.Payment = Payment;
