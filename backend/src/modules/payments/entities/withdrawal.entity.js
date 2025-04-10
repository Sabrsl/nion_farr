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
exports.Withdrawal = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let Withdrawal = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('withdrawals')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _paymentDetails_decorators;
    let _paymentDetails_initializers = [];
    let _paymentDetails_extraInitializers = [];
    let _transactionId_decorators;
    let _transactionId_initializers = [];
    let _transactionId_extraInitializers = [];
    let _processedAt_decorators;
    let _processedAt_initializers = [];
    let _processedAt_extraInitializers = [];
    let _completedAt_decorators;
    let _completedAt_initializers = [];
    let _completedAt_extraInitializers = [];
    let _rejectionReason_decorators;
    let _rejectionReason_initializers = [];
    let _rejectionReason_extraInitializers = [];
    let _processedBy_decorators;
    let _processedBy_initializers = [];
    let _processedBy_extraInitializers = [];
    let _processedById_decorators;
    let _processedById_initializers = [];
    let _processedById_extraInitializers = [];
    let _history_decorators;
    let _history_initializers = [];
    let _history_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Withdrawal = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _user_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }), (0, typeorm_1.JoinColumn)({ name: 'userId' })];
            _userId_decorators = [(0, typeorm_1.Column)({ nullable: false })];
            _amount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 })];
            _status_decorators = [(0, typeorm_1.Column)()];
            _method_decorators = [(0, typeorm_1.Column)()];
            _paymentDetails_decorators = [(0, typeorm_1.Column)({ type: 'json', nullable: false })];
            _transactionId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _processedAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _completedAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _rejectionReason_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _processedBy_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'processedById' })];
            _processedById_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _history_decorators = [(0, typeorm_1.Column)({ type: 'json', default: '[]' })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _paymentDetails_decorators, { kind: "field", name: "paymentDetails", static: false, private: false, access: { has: obj => "paymentDetails" in obj, get: obj => obj.paymentDetails, set: (obj, value) => { obj.paymentDetails = value; } }, metadata: _metadata }, _paymentDetails_initializers, _paymentDetails_extraInitializers);
            __esDecorate(null, null, _transactionId_decorators, { kind: "field", name: "transactionId", static: false, private: false, access: { has: obj => "transactionId" in obj, get: obj => obj.transactionId, set: (obj, value) => { obj.transactionId = value; } }, metadata: _metadata }, _transactionId_initializers, _transactionId_extraInitializers);
            __esDecorate(null, null, _processedAt_decorators, { kind: "field", name: "processedAt", static: false, private: false, access: { has: obj => "processedAt" in obj, get: obj => obj.processedAt, set: (obj, value) => { obj.processedAt = value; } }, metadata: _metadata }, _processedAt_initializers, _processedAt_extraInitializers);
            __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: obj => "completedAt" in obj, get: obj => obj.completedAt, set: (obj, value) => { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
            __esDecorate(null, null, _rejectionReason_decorators, { kind: "field", name: "rejectionReason", static: false, private: false, access: { has: obj => "rejectionReason" in obj, get: obj => obj.rejectionReason, set: (obj, value) => { obj.rejectionReason = value; } }, metadata: _metadata }, _rejectionReason_initializers, _rejectionReason_extraInitializers);
            __esDecorate(null, null, _processedBy_decorators, { kind: "field", name: "processedBy", static: false, private: false, access: { has: obj => "processedBy" in obj, get: obj => obj.processedBy, set: (obj, value) => { obj.processedBy = value; } }, metadata: _metadata }, _processedBy_initializers, _processedBy_extraInitializers);
            __esDecorate(null, null, _processedById_decorators, { kind: "field", name: "processedById", static: false, private: false, access: { has: obj => "processedById" in obj, get: obj => obj.processedById, set: (obj, value) => { obj.processedById = value; } }, metadata: _metadata }, _processedById_initializers, _processedById_extraInitializers);
            __esDecorate(null, null, _history_decorators, { kind: "field", name: "history", static: false, private: false, access: { has: obj => "history" in obj, get: obj => obj.history, set: (obj, value) => { obj.history = value; } }, metadata: _metadata }, _history_initializers, _history_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Withdrawal = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
        userId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        amount = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        status = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        method = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _method_initializers, void 0));
        paymentDetails = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _paymentDetails_initializers, void 0));
        transactionId = (__runInitializers(this, _paymentDetails_extraInitializers), __runInitializers(this, _transactionId_initializers, void 0));
        processedAt = (__runInitializers(this, _transactionId_extraInitializers), __runInitializers(this, _processedAt_initializers, void 0));
        completedAt = (__runInitializers(this, _processedAt_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
        rejectionReason = (__runInitializers(this, _completedAt_extraInitializers), __runInitializers(this, _rejectionReason_initializers, void 0));
        processedBy = (__runInitializers(this, _rejectionReason_extraInitializers), __runInitializers(this, _processedBy_initializers, void 0));
        processedById = (__runInitializers(this, _processedBy_extraInitializers), __runInitializers(this, _processedById_initializers, void 0));
        history = (__runInitializers(this, _processedById_extraInitializers), __runInitializers(this, _history_initializers, void 0));
        createdAt = (__runInitializers(this, _history_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    return Withdrawal = _classThis;
})();
exports.Withdrawal = Withdrawal;
