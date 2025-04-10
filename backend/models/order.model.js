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
exports.OrderSchema = exports.Order = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["EN_ATTENTE"] = "en_attente";
    OrderStatus["EN_ATTENTE_PAIEMENT"] = "en_attente_paiement";
    OrderStatus["EN_ATTENTE_ACCEPTATION"] = "en_attente_acceptation";
    OrderStatus["EN_COURS"] = "en_cours";
    OrderStatus["LIVRE"] = "livre";
    OrderStatus["REVISION_DEMANDEE"] = "revision_demandee";
    OrderStatus["EN_MODIFICATION"] = "en_modification";
    OrderStatus["TERMINE"] = "termine";
    OrderStatus["ANNULE"] = "annule";
    OrderStatus["LITIGE"] = "litige";
    OrderStatus["LIVRAISON_EN_RETARD"] = "livraison_en_retard";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["EN_ATTENTE"] = "en_attente";
    PaymentStatus["PAYE"] = "paye";
    PaymentStatus["REMBOURSE"] = "rembourse";
    PaymentStatus["ANNULE"] = "annule";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WAVE"] = "wave";
    PaymentMethod["ORANGE_MONEY"] = "orange_money";
    PaymentMethod["FREE_MONEY"] = "free_money";
    PaymentMethod["CARTE_BANCAIRE"] = "carte_bancaire";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Order = (() => {
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
    let _orderNumber_decorators;
    let _orderNumber_initializers = [];
    let _orderNumber_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _client_decorators;
    let _client_initializers = [];
    let _client_extraInitializers = [];
    let _provider_decorators;
    let _provider_initializers = [];
    let _provider_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _serviceFee_decorators;
    let _serviceFee_initializers = [];
    let _serviceFee_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    let _paymentStatus_decorators;
    let _paymentStatus_initializers = [];
    let _paymentStatus_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _transactionId_decorators;
    let _transactionId_initializers = [];
    let _transactionId_extraInitializers = [];
    let _paymentDate_decorators;
    let _paymentDate_initializers = [];
    let _paymentDate_extraInitializers = [];
    let _deliveryTime_decorators;
    let _deliveryTime_initializers = [];
    let _deliveryTime_extraInitializers = [];
    let _deadline_decorators;
    let _deadline_initializers = [];
    let _deadline_extraInitializers = [];
    let _expectedDeliveryDate_decorators;
    let _expectedDeliveryDate_initializers = [];
    let _expectedDeliveryDate_extraInitializers = [];
    let _completedDate_decorators;
    let _completedDate_initializers = [];
    let _completedDate_extraInitializers = [];
    let _requirements_decorators;
    let _requirements_initializers = [];
    let _requirements_extraInitializers = [];
    let _deliverables_decorators;
    let _deliverables_initializers = [];
    let _deliverables_extraInitializers = [];
    let _revisionsCount_decorators;
    let _revisionsCount_initializers = [];
    let _revisionsCount_extraInitializers = [];
    let _revisionsRemaining_decorators;
    let _revisionsRemaining_initializers = [];
    let _revisionsRemaining_extraInitializers = [];
    let _cancelReason_decorators;
    let _cancelReason_initializers = [];
    let _cancelReason_extraInitializers = [];
    let _cancelledBy_decorators;
    let _cancelledBy_initializers = [];
    let _cancelledBy_extraInitializers = [];
    let _cancelledAt_decorators;
    let _cancelledAt_initializers = [];
    let _cancelledAt_extraInitializers = [];
    let _deliveryValidationDeadline_decorators;
    let _deliveryValidationDeadline_initializers = [];
    let _deliveryValidationDeadline_extraInitializers = [];
    let _isReviewed_decorators;
    let _isReviewed_initializers = [];
    let _isReviewed_extraInitializers = [];
    let _review_decorators;
    let _review_initializers = [];
    let _review_extraInitializers = [];
    let _dispute_decorators;
    let _dispute_initializers = [];
    let _dispute_extraInitializers = [];
    let _timeline_decorators;
    let _timeline_initializers = [];
    let _timeline_extraInitializers = [];
    var Order = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _orderNumber_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true })];
            _service_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Service', required: true })];
            _client_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true })];
            _provider_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true })];
            _status_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(OrderStatus), default: OrderStatus.EN_ATTENTE_PAIEMENT })];
            _price_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _serviceFee_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _totalAmount_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _paymentStatus_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(PaymentStatus), default: PaymentStatus.EN_ATTENTE })];
            _paymentMethod_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(PaymentMethod) })];
            _transactionId_decorators = [(0, mongoose_1.Prop)()];
            _paymentDate_decorators = [(0, mongoose_1.Prop)()];
            _deliveryTime_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _deadline_decorators = [(0, mongoose_1.Prop)()];
            _expectedDeliveryDate_decorators = [(0, mongoose_1.Prop)()];
            _completedDate_decorators = [(0, mongoose_1.Prop)()];
            _requirements_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: [] })];
            _deliverables_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: [] })];
            _revisionsCount_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _revisionsRemaining_decorators = [(0, mongoose_1.Prop)({ default: 3 })];
            _cancelReason_decorators = [(0, mongoose_1.Prop)({ type: String })];
            _cancelledBy_decorators = [(0, mongoose_1.Prop)()];
            _cancelledAt_decorators = [(0, mongoose_1.Prop)()];
            _deliveryValidationDeadline_decorators = [(0, mongoose_1.Prop)()];
            _isReviewed_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _review_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _dispute_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _timeline_decorators = [(0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.Mixed }], default: [] })];
            __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: obj => "orderNumber" in obj, get: obj => obj.orderNumber, set: (obj, value) => { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _client_decorators, { kind: "field", name: "client", static: false, private: false, access: { has: obj => "client" in obj, get: obj => obj.client, set: (obj, value) => { obj.client = value; } }, metadata: _metadata }, _client_initializers, _client_extraInitializers);
            __esDecorate(null, null, _provider_decorators, { kind: "field", name: "provider", static: false, private: false, access: { has: obj => "provider" in obj, get: obj => obj.provider, set: (obj, value) => { obj.provider = value; } }, metadata: _metadata }, _provider_initializers, _provider_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _serviceFee_decorators, { kind: "field", name: "serviceFee", static: false, private: false, access: { has: obj => "serviceFee" in obj, get: obj => obj.serviceFee, set: (obj, value) => { obj.serviceFee = value; } }, metadata: _metadata }, _serviceFee_initializers, _serviceFee_extraInitializers);
            __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
            __esDecorate(null, null, _paymentStatus_decorators, { kind: "field", name: "paymentStatus", static: false, private: false, access: { has: obj => "paymentStatus" in obj, get: obj => obj.paymentStatus, set: (obj, value) => { obj.paymentStatus = value; } }, metadata: _metadata }, _paymentStatus_initializers, _paymentStatus_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _transactionId_decorators, { kind: "field", name: "transactionId", static: false, private: false, access: { has: obj => "transactionId" in obj, get: obj => obj.transactionId, set: (obj, value) => { obj.transactionId = value; } }, metadata: _metadata }, _transactionId_initializers, _transactionId_extraInitializers);
            __esDecorate(null, null, _paymentDate_decorators, { kind: "field", name: "paymentDate", static: false, private: false, access: { has: obj => "paymentDate" in obj, get: obj => obj.paymentDate, set: (obj, value) => { obj.paymentDate = value; } }, metadata: _metadata }, _paymentDate_initializers, _paymentDate_extraInitializers);
            __esDecorate(null, null, _deliveryTime_decorators, { kind: "field", name: "deliveryTime", static: false, private: false, access: { has: obj => "deliveryTime" in obj, get: obj => obj.deliveryTime, set: (obj, value) => { obj.deliveryTime = value; } }, metadata: _metadata }, _deliveryTime_initializers, _deliveryTime_extraInitializers);
            __esDecorate(null, null, _deadline_decorators, { kind: "field", name: "deadline", static: false, private: false, access: { has: obj => "deadline" in obj, get: obj => obj.deadline, set: (obj, value) => { obj.deadline = value; } }, metadata: _metadata }, _deadline_initializers, _deadline_extraInitializers);
            __esDecorate(null, null, _expectedDeliveryDate_decorators, { kind: "field", name: "expectedDeliveryDate", static: false, private: false, access: { has: obj => "expectedDeliveryDate" in obj, get: obj => obj.expectedDeliveryDate, set: (obj, value) => { obj.expectedDeliveryDate = value; } }, metadata: _metadata }, _expectedDeliveryDate_initializers, _expectedDeliveryDate_extraInitializers);
            __esDecorate(null, null, _completedDate_decorators, { kind: "field", name: "completedDate", static: false, private: false, access: { has: obj => "completedDate" in obj, get: obj => obj.completedDate, set: (obj, value) => { obj.completedDate = value; } }, metadata: _metadata }, _completedDate_initializers, _completedDate_extraInitializers);
            __esDecorate(null, null, _requirements_decorators, { kind: "field", name: "requirements", static: false, private: false, access: { has: obj => "requirements" in obj, get: obj => obj.requirements, set: (obj, value) => { obj.requirements = value; } }, metadata: _metadata }, _requirements_initializers, _requirements_extraInitializers);
            __esDecorate(null, null, _deliverables_decorators, { kind: "field", name: "deliverables", static: false, private: false, access: { has: obj => "deliverables" in obj, get: obj => obj.deliverables, set: (obj, value) => { obj.deliverables = value; } }, metadata: _metadata }, _deliverables_initializers, _deliverables_extraInitializers);
            __esDecorate(null, null, _revisionsCount_decorators, { kind: "field", name: "revisionsCount", static: false, private: false, access: { has: obj => "revisionsCount" in obj, get: obj => obj.revisionsCount, set: (obj, value) => { obj.revisionsCount = value; } }, metadata: _metadata }, _revisionsCount_initializers, _revisionsCount_extraInitializers);
            __esDecorate(null, null, _revisionsRemaining_decorators, { kind: "field", name: "revisionsRemaining", static: false, private: false, access: { has: obj => "revisionsRemaining" in obj, get: obj => obj.revisionsRemaining, set: (obj, value) => { obj.revisionsRemaining = value; } }, metadata: _metadata }, _revisionsRemaining_initializers, _revisionsRemaining_extraInitializers);
            __esDecorate(null, null, _cancelReason_decorators, { kind: "field", name: "cancelReason", static: false, private: false, access: { has: obj => "cancelReason" in obj, get: obj => obj.cancelReason, set: (obj, value) => { obj.cancelReason = value; } }, metadata: _metadata }, _cancelReason_initializers, _cancelReason_extraInitializers);
            __esDecorate(null, null, _cancelledBy_decorators, { kind: "field", name: "cancelledBy", static: false, private: false, access: { has: obj => "cancelledBy" in obj, get: obj => obj.cancelledBy, set: (obj, value) => { obj.cancelledBy = value; } }, metadata: _metadata }, _cancelledBy_initializers, _cancelledBy_extraInitializers);
            __esDecorate(null, null, _cancelledAt_decorators, { kind: "field", name: "cancelledAt", static: false, private: false, access: { has: obj => "cancelledAt" in obj, get: obj => obj.cancelledAt, set: (obj, value) => { obj.cancelledAt = value; } }, metadata: _metadata }, _cancelledAt_initializers, _cancelledAt_extraInitializers);
            __esDecorate(null, null, _deliveryValidationDeadline_decorators, { kind: "field", name: "deliveryValidationDeadline", static: false, private: false, access: { has: obj => "deliveryValidationDeadline" in obj, get: obj => obj.deliveryValidationDeadline, set: (obj, value) => { obj.deliveryValidationDeadline = value; } }, metadata: _metadata }, _deliveryValidationDeadline_initializers, _deliveryValidationDeadline_extraInitializers);
            __esDecorate(null, null, _isReviewed_decorators, { kind: "field", name: "isReviewed", static: false, private: false, access: { has: obj => "isReviewed" in obj, get: obj => obj.isReviewed, set: (obj, value) => { obj.isReviewed = value; } }, metadata: _metadata }, _isReviewed_initializers, _isReviewed_extraInitializers);
            __esDecorate(null, null, _review_decorators, { kind: "field", name: "review", static: false, private: false, access: { has: obj => "review" in obj, get: obj => obj.review, set: (obj, value) => { obj.review = value; } }, metadata: _metadata }, _review_initializers, _review_extraInitializers);
            __esDecorate(null, null, _dispute_decorators, { kind: "field", name: "dispute", static: false, private: false, access: { has: obj => "dispute" in obj, get: obj => obj.dispute, set: (obj, value) => { obj.dispute = value; } }, metadata: _metadata }, _dispute_initializers, _dispute_extraInitializers);
            __esDecorate(null, null, _timeline_decorators, { kind: "field", name: "timeline", static: false, private: false, access: { has: obj => "timeline" in obj, get: obj => obj.timeline, set: (obj, value) => { obj.timeline = value; } }, metadata: _metadata }, _timeline_initializers, _timeline_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Order = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderNumber = __runInitializers(this, _orderNumber_initializers, void 0);
        service = (__runInitializers(this, _orderNumber_extraInitializers), __runInitializers(this, _service_initializers, void 0));
        client = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _client_initializers, void 0));
        provider = (__runInitializers(this, _client_extraInitializers), __runInitializers(this, _provider_initializers, void 0));
        status = (__runInitializers(this, _provider_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        price = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        serviceFee = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _serviceFee_initializers, void 0));
        totalAmount = (__runInitializers(this, _serviceFee_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
        paymentStatus = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _paymentStatus_initializers, void 0));
        paymentMethod = (__runInitializers(this, _paymentStatus_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        transactionId = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _transactionId_initializers, void 0));
        paymentDate = (__runInitializers(this, _transactionId_extraInitializers), __runInitializers(this, _paymentDate_initializers, void 0));
        deliveryTime = (__runInitializers(this, _paymentDate_extraInitializers), __runInitializers(this, _deliveryTime_initializers, void 0));
        deadline = (__runInitializers(this, _deliveryTime_extraInitializers), __runInitializers(this, _deadline_initializers, void 0));
        expectedDeliveryDate = (__runInitializers(this, _deadline_extraInitializers), __runInitializers(this, _expectedDeliveryDate_initializers, void 0));
        completedDate = (__runInitializers(this, _expectedDeliveryDate_extraInitializers), __runInitializers(this, _completedDate_initializers, void 0));
        requirements = (__runInitializers(this, _completedDate_extraInitializers), __runInitializers(this, _requirements_initializers, void 0));
        deliverables = (__runInitializers(this, _requirements_extraInitializers), __runInitializers(this, _deliverables_initializers, void 0));
        revisionsCount = (__runInitializers(this, _deliverables_extraInitializers), __runInitializers(this, _revisionsCount_initializers, void 0));
        revisionsRemaining = (__runInitializers(this, _revisionsCount_extraInitializers), __runInitializers(this, _revisionsRemaining_initializers, void 0));
        cancelReason = (__runInitializers(this, _revisionsRemaining_extraInitializers), __runInitializers(this, _cancelReason_initializers, void 0));
        cancelledBy = (__runInitializers(this, _cancelReason_extraInitializers), __runInitializers(this, _cancelledBy_initializers, void 0));
        cancelledAt = (__runInitializers(this, _cancelledBy_extraInitializers), __runInitializers(this, _cancelledAt_initializers, void 0));
        deliveryValidationDeadline = (__runInitializers(this, _cancelledAt_extraInitializers), __runInitializers(this, _deliveryValidationDeadline_initializers, void 0));
        isReviewed = (__runInitializers(this, _deliveryValidationDeadline_extraInitializers), __runInitializers(this, _isReviewed_initializers, void 0));
        review = (__runInitializers(this, _isReviewed_extraInitializers), __runInitializers(this, _review_initializers, void 0));
        dispute = (__runInitializers(this, _review_extraInitializers), __runInitializers(this, _dispute_initializers, void 0));
        timeline = (__runInitializers(this, _dispute_extraInitializers), __runInitializers(this, _timeline_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _timeline_extraInitializers);
        }
    };
    return Order = _classThis;
})();
exports.Order = Order;
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
