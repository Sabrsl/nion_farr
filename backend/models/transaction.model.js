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
exports.TransactionSchema = exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["ORDER_PAYMENT"] = "order_payment";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["REFUND"] = "refund";
    TransactionType["COMMISSION"] = "commission";
    TransactionType["SYSTEM_ADJUSTMENT"] = "system_adjustment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["REFUNDED"] = "refunded";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({
            timestamps: true,
            toJSON: {
                virtuals: true,
                transform: (doc, ret) => {
                    delete ret.__v;
                    ret.id = ret._id;
                    delete ret._id;
                    return ret;
                },
            },
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mongoose_2.Document;
    let _transactionId_decorators;
    let _transactionId_initializers = [];
    let _transactionId_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _withdrawal_decorators;
    let _withdrawal_initializers = [];
    let _withdrawal_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _paymentProvider_decorators;
    let _paymentProvider_initializers = [];
    let _paymentProvider_extraInitializers = [];
    let _externalTransactionId_decorators;
    let _externalTransactionId_initializers = [];
    let _externalTransactionId_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _processedAt_decorators;
    let _processedAt_initializers = [];
    let _processedAt_extraInitializers = [];
    let _isReversed_decorators;
    let _isReversed_initializers = [];
    let _isReversed_extraInitializers = [];
    let _reversalReason_decorators;
    let _reversalReason_initializers = [];
    let _reversalReason_extraInitializers = [];
    let _reversedAt_decorators;
    let _reversedAt_initializers = [];
    let _reversedAt_extraInitializers = [];
    let _source_decorators;
    let _source_initializers = [];
    let _source_extraInitializers = [];
    let _destination_decorators;
    let _destination_initializers = [];
    let _destination_extraInitializers = [];
    let _fee_decorators;
    let _fee_initializers = [];
    let _fee_extraInitializers = [];
    let _currency_decorators;
    let _currency_initializers = [];
    let _currency_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    var Transaction = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _transactionId_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true })];
            _type_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(TransactionType), required: true })];
            _amount_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _user_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' })];
            _status_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING })];
            _order_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order' })];
            _withdrawal_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Withdrawal' })];
            _paymentMethod_decorators = [(0, mongoose_1.Prop)()];
            _paymentProvider_decorators = [(0, mongoose_1.Prop)()];
            _externalTransactionId_decorators = [(0, mongoose_1.Prop)()];
            _description_decorators = [(0, mongoose_1.Prop)()];
            _metadata_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _processedAt_decorators = [(0, mongoose_1.Prop)()];
            _isReversed_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _reversalReason_decorators = [(0, mongoose_1.Prop)()];
            _reversedAt_decorators = [(0, mongoose_1.Prop)()];
            _source_decorators = [(0, mongoose_1.Prop)()];
            _destination_decorators = [(0, mongoose_1.Prop)()];
            _fee_decorators = [(0, mongoose_1.Prop)()];
            _currency_decorators = [(0, mongoose_1.Prop)()];
            _notes_decorators = [(0, mongoose_1.Prop)()];
            __esDecorate(null, null, _transactionId_decorators, { kind: "field", name: "transactionId", static: false, private: false, access: { has: obj => "transactionId" in obj, get: obj => obj.transactionId, set: (obj, value) => { obj.transactionId = value; } }, metadata: _metadata }, _transactionId_initializers, _transactionId_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _withdrawal_decorators, { kind: "field", name: "withdrawal", static: false, private: false, access: { has: obj => "withdrawal" in obj, get: obj => obj.withdrawal, set: (obj, value) => { obj.withdrawal = value; } }, metadata: _metadata }, _withdrawal_initializers, _withdrawal_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _paymentProvider_decorators, { kind: "field", name: "paymentProvider", static: false, private: false, access: { has: obj => "paymentProvider" in obj, get: obj => obj.paymentProvider, set: (obj, value) => { obj.paymentProvider = value; } }, metadata: _metadata }, _paymentProvider_initializers, _paymentProvider_extraInitializers);
            __esDecorate(null, null, _externalTransactionId_decorators, { kind: "field", name: "externalTransactionId", static: false, private: false, access: { has: obj => "externalTransactionId" in obj, get: obj => obj.externalTransactionId, set: (obj, value) => { obj.externalTransactionId = value; } }, metadata: _metadata }, _externalTransactionId_initializers, _externalTransactionId_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            __esDecorate(null, null, _processedAt_decorators, { kind: "field", name: "processedAt", static: false, private: false, access: { has: obj => "processedAt" in obj, get: obj => obj.processedAt, set: (obj, value) => { obj.processedAt = value; } }, metadata: _metadata }, _processedAt_initializers, _processedAt_extraInitializers);
            __esDecorate(null, null, _isReversed_decorators, { kind: "field", name: "isReversed", static: false, private: false, access: { has: obj => "isReversed" in obj, get: obj => obj.isReversed, set: (obj, value) => { obj.isReversed = value; } }, metadata: _metadata }, _isReversed_initializers, _isReversed_extraInitializers);
            __esDecorate(null, null, _reversalReason_decorators, { kind: "field", name: "reversalReason", static: false, private: false, access: { has: obj => "reversalReason" in obj, get: obj => obj.reversalReason, set: (obj, value) => { obj.reversalReason = value; } }, metadata: _metadata }, _reversalReason_initializers, _reversalReason_extraInitializers);
            __esDecorate(null, null, _reversedAt_decorators, { kind: "field", name: "reversedAt", static: false, private: false, access: { has: obj => "reversedAt" in obj, get: obj => obj.reversedAt, set: (obj, value) => { obj.reversedAt = value; } }, metadata: _metadata }, _reversedAt_initializers, _reversedAt_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: obj => "source" in obj, get: obj => obj.source, set: (obj, value) => { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            __esDecorate(null, null, _destination_decorators, { kind: "field", name: "destination", static: false, private: false, access: { has: obj => "destination" in obj, get: obj => obj.destination, set: (obj, value) => { obj.destination = value; } }, metadata: _metadata }, _destination_initializers, _destination_extraInitializers);
            __esDecorate(null, null, _fee_decorators, { kind: "field", name: "fee", static: false, private: false, access: { has: obj => "fee" in obj, get: obj => obj.fee, set: (obj, value) => { obj.fee = value; } }, metadata: _metadata }, _fee_initializers, _fee_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: obj => "currency" in obj, get: obj => obj.currency, set: (obj, value) => { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Transaction = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        transactionId = __runInitializers(this, _transactionId_initializers, void 0);
        type = (__runInitializers(this, _transactionId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        amount = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        user = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _user_initializers, void 0));
        status = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        order = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        withdrawal = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _withdrawal_initializers, void 0));
        paymentMethod = (__runInitializers(this, _withdrawal_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        paymentProvider = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _paymentProvider_initializers, void 0));
        externalTransactionId = (__runInitializers(this, _paymentProvider_extraInitializers), __runInitializers(this, _externalTransactionId_initializers, void 0));
        description = (__runInitializers(this, _externalTransactionId_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        metadata = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
        processedAt = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _processedAt_initializers, void 0));
        isReversed = (__runInitializers(this, _processedAt_extraInitializers), __runInitializers(this, _isReversed_initializers, void 0));
        reversalReason = (__runInitializers(this, _isReversed_extraInitializers), __runInitializers(this, _reversalReason_initializers, void 0));
        reversedAt = (__runInitializers(this, _reversalReason_extraInitializers), __runInitializers(this, _reversedAt_initializers, void 0));
        source = (__runInitializers(this, _reversedAt_extraInitializers), __runInitializers(this, _source_initializers, void 0));
        destination = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _destination_initializers, void 0));
        fee = (__runInitializers(this, _destination_extraInitializers), __runInitializers(this, _fee_initializers, void 0));
        currency = (__runInitializers(this, _fee_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
        notes = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _notes_extraInitializers);
        }
    };
    return Transaction = _classThis;
})();
exports.Transaction = Transaction;
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
