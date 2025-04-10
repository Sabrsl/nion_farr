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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const service_entity_1 = require("../../services/entities/service.entity");
const service_option_entity_1 = require("../../services/entities/service-option.entity");
const order_status_enum_1 = require("../enums/order-status.enum");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
let Order = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('orders')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _orderNumber_decorators;
    let _orderNumber_initializers = [];
    let _orderNumber_extraInitializers = [];
    let _client_decorators;
    let _client_initializers = [];
    let _client_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _freelancer_decorators;
    let _freelancer_initializers = [];
    let _freelancer_extraInitializers = [];
    let _freelancerId_decorators;
    let _freelancerId_initializers = [];
    let _freelancerId_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    let _totalPrice_decorators;
    let _totalPrice_initializers = [];
    let _totalPrice_extraInitializers = [];
    let _basePrice_decorators;
    let _basePrice_initializers = [];
    let _basePrice_extraInitializers = [];
    let _optionsPrice_decorators;
    let _optionsPrice_initializers = [];
    let _optionsPrice_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _completionDate_decorators;
    let _completionDate_initializers = [];
    let _completionDate_extraInitializers = [];
    let _deadline_decorators;
    let _deadline_initializers = [];
    let _deadline_extraInitializers = [];
    let _requirements_decorators;
    let _requirements_initializers = [];
    let _requirements_extraInitializers = [];
    let _attachments_decorators;
    let _attachments_initializers = [];
    let _attachments_extraInitializers = [];
    let _isRated_decorators;
    let _isRated_initializers = [];
    let _isRated_extraInitializers = [];
    let _isPaid_decorators;
    let _isPaid_initializers = [];
    let _isPaid_extraInitializers = [];
    let _cancelReason_decorators;
    let _cancelReason_initializers = [];
    let _cancelReason_extraInitializers = [];
    let _deliveryMessage_decorators;
    let _deliveryMessage_initializers = [];
    let _deliveryMessage_extraInitializers = [];
    let _deliveryFiles_decorators;
    let _deliveryFiles_initializers = [];
    let _deliveryFiles_extraInitializers = [];
    let _payments_decorators;
    let _payments_initializers = [];
    let _payments_extraInitializers = [];
    let _reviews_decorators;
    let _reviews_initializers = [];
    let _reviews_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Order = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _orderNumber_decorators = [(0, typeorm_1.Column)({ unique: true })];
            _client_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.clientOrders), (0, typeorm_1.JoinColumn)({ name: 'clientId' })];
            _clientId_decorators = [(0, typeorm_1.Column)()];
            _freelancer_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.freelancerOrders), (0, typeorm_1.JoinColumn)({ name: 'freelancerId' })];
            _freelancerId_decorators = [(0, typeorm_1.Column)()];
            _service_decorators = [(0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.orders), (0, typeorm_1.JoinColumn)({ name: 'serviceId' })];
            _serviceId_decorators = [(0, typeorm_1.Column)()];
            _options_decorators = [(0, typeorm_1.ManyToMany)(() => service_option_entity_1.ServiceOption), (0, typeorm_1.JoinTable)({
                    name: 'order_service_options',
                    joinColumn: { name: 'orderId', referencedColumnName: 'id' },
                    inverseJoinColumn: { name: 'optionId', referencedColumnName: 'id' },
                })];
            _totalPrice_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
            _basePrice_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
            _optionsPrice_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
            _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: order_status_enum_1.OrderStatus, default: order_status_enum_1.OrderStatus.PENDING })];
            _startDate_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
            _completionDate_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
            _deadline_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
            _requirements_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
            _attachments_decorators = [(0, typeorm_1.Column)({ type: 'simple-array', nullable: true })];
            _isRated_decorators = [(0, typeorm_1.Column)({ default: false })];
            _isPaid_decorators = [(0, typeorm_1.Column)({ default: false })];
            _cancelReason_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _deliveryMessage_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
            _deliveryFiles_decorators = [(0, typeorm_1.Column)({ type: 'simple-array', nullable: true })];
            _payments_decorators = [(0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.order)];
            _reviews_decorators = [(0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.order)];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: obj => "orderNumber" in obj, get: obj => obj.orderNumber, set: (obj, value) => { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
            __esDecorate(null, null, _client_decorators, { kind: "field", name: "client", static: false, private: false, access: { has: obj => "client" in obj, get: obj => obj.client, set: (obj, value) => { obj.client = value; } }, metadata: _metadata }, _client_initializers, _client_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _freelancer_decorators, { kind: "field", name: "freelancer", static: false, private: false, access: { has: obj => "freelancer" in obj, get: obj => obj.freelancer, set: (obj, value) => { obj.freelancer = value; } }, metadata: _metadata }, _freelancer_initializers, _freelancer_extraInitializers);
            __esDecorate(null, null, _freelancerId_decorators, { kind: "field", name: "freelancerId", static: false, private: false, access: { has: obj => "freelancerId" in obj, get: obj => obj.freelancerId, set: (obj, value) => { obj.freelancerId = value; } }, metadata: _metadata }, _freelancerId_initializers, _freelancerId_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: obj => "totalPrice" in obj, get: obj => obj.totalPrice, set: (obj, value) => { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _totalPrice_extraInitializers);
            __esDecorate(null, null, _basePrice_decorators, { kind: "field", name: "basePrice", static: false, private: false, access: { has: obj => "basePrice" in obj, get: obj => obj.basePrice, set: (obj, value) => { obj.basePrice = value; } }, metadata: _metadata }, _basePrice_initializers, _basePrice_extraInitializers);
            __esDecorate(null, null, _optionsPrice_decorators, { kind: "field", name: "optionsPrice", static: false, private: false, access: { has: obj => "optionsPrice" in obj, get: obj => obj.optionsPrice, set: (obj, value) => { obj.optionsPrice = value; } }, metadata: _metadata }, _optionsPrice_initializers, _optionsPrice_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _completionDate_decorators, { kind: "field", name: "completionDate", static: false, private: false, access: { has: obj => "completionDate" in obj, get: obj => obj.completionDate, set: (obj, value) => { obj.completionDate = value; } }, metadata: _metadata }, _completionDate_initializers, _completionDate_extraInitializers);
            __esDecorate(null, null, _deadline_decorators, { kind: "field", name: "deadline", static: false, private: false, access: { has: obj => "deadline" in obj, get: obj => obj.deadline, set: (obj, value) => { obj.deadline = value; } }, metadata: _metadata }, _deadline_initializers, _deadline_extraInitializers);
            __esDecorate(null, null, _requirements_decorators, { kind: "field", name: "requirements", static: false, private: false, access: { has: obj => "requirements" in obj, get: obj => obj.requirements, set: (obj, value) => { obj.requirements = value; } }, metadata: _metadata }, _requirements_initializers, _requirements_extraInitializers);
            __esDecorate(null, null, _attachments_decorators, { kind: "field", name: "attachments", static: false, private: false, access: { has: obj => "attachments" in obj, get: obj => obj.attachments, set: (obj, value) => { obj.attachments = value; } }, metadata: _metadata }, _attachments_initializers, _attachments_extraInitializers);
            __esDecorate(null, null, _isRated_decorators, { kind: "field", name: "isRated", static: false, private: false, access: { has: obj => "isRated" in obj, get: obj => obj.isRated, set: (obj, value) => { obj.isRated = value; } }, metadata: _metadata }, _isRated_initializers, _isRated_extraInitializers);
            __esDecorate(null, null, _isPaid_decorators, { kind: "field", name: "isPaid", static: false, private: false, access: { has: obj => "isPaid" in obj, get: obj => obj.isPaid, set: (obj, value) => { obj.isPaid = value; } }, metadata: _metadata }, _isPaid_initializers, _isPaid_extraInitializers);
            __esDecorate(null, null, _cancelReason_decorators, { kind: "field", name: "cancelReason", static: false, private: false, access: { has: obj => "cancelReason" in obj, get: obj => obj.cancelReason, set: (obj, value) => { obj.cancelReason = value; } }, metadata: _metadata }, _cancelReason_initializers, _cancelReason_extraInitializers);
            __esDecorate(null, null, _deliveryMessage_decorators, { kind: "field", name: "deliveryMessage", static: false, private: false, access: { has: obj => "deliveryMessage" in obj, get: obj => obj.deliveryMessage, set: (obj, value) => { obj.deliveryMessage = value; } }, metadata: _metadata }, _deliveryMessage_initializers, _deliveryMessage_extraInitializers);
            __esDecorate(null, null, _deliveryFiles_decorators, { kind: "field", name: "deliveryFiles", static: false, private: false, access: { has: obj => "deliveryFiles" in obj, get: obj => obj.deliveryFiles, set: (obj, value) => { obj.deliveryFiles = value; } }, metadata: _metadata }, _deliveryFiles_initializers, _deliveryFiles_extraInitializers);
            __esDecorate(null, null, _payments_decorators, { kind: "field", name: "payments", static: false, private: false, access: { has: obj => "payments" in obj, get: obj => obj.payments, set: (obj, value) => { obj.payments = value; } }, metadata: _metadata }, _payments_initializers, _payments_extraInitializers);
            __esDecorate(null, null, _reviews_decorators, { kind: "field", name: "reviews", static: false, private: false, access: { has: obj => "reviews" in obj, get: obj => obj.reviews, set: (obj, value) => { obj.reviews = value; } }, metadata: _metadata }, _reviews_initializers, _reviews_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Order = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        orderNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orderNumber_initializers, void 0));
        client = (__runInitializers(this, _orderNumber_extraInitializers), __runInitializers(this, _client_initializers, void 0));
        clientId = (__runInitializers(this, _client_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        freelancer = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _freelancer_initializers, void 0));
        freelancerId = (__runInitializers(this, _freelancer_extraInitializers), __runInitializers(this, _freelancerId_initializers, void 0));
        service = (__runInitializers(this, _freelancerId_extraInitializers), __runInitializers(this, _service_initializers, void 0));
        serviceId = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        options = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _options_initializers, void 0));
        totalPrice = (__runInitializers(this, _options_extraInitializers), __runInitializers(this, _totalPrice_initializers, void 0)); // Total price in FCFA
        basePrice = (__runInitializers(this, _totalPrice_extraInitializers), __runInitializers(this, _basePrice_initializers, void 0)); // Base price in FCFA (without options)
        optionsPrice = (__runInitializers(this, _basePrice_extraInitializers), __runInitializers(this, _optionsPrice_initializers, void 0)); // Total options price in FCFA
        status = (__runInitializers(this, _optionsPrice_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        startDate = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        completionDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _completionDate_initializers, void 0));
        deadline = (__runInitializers(this, _completionDate_extraInitializers), __runInitializers(this, _deadline_initializers, void 0));
        requirements = (__runInitializers(this, _deadline_extraInitializers), __runInitializers(this, _requirements_initializers, void 0));
        attachments = (__runInitializers(this, _requirements_extraInitializers), __runInitializers(this, _attachments_initializers, void 0));
        isRated = (__runInitializers(this, _attachments_extraInitializers), __runInitializers(this, _isRated_initializers, void 0));
        isPaid = (__runInitializers(this, _isRated_extraInitializers), __runInitializers(this, _isPaid_initializers, void 0));
        cancelReason = (__runInitializers(this, _isPaid_extraInitializers), __runInitializers(this, _cancelReason_initializers, void 0));
        deliveryMessage = (__runInitializers(this, _cancelReason_extraInitializers), __runInitializers(this, _deliveryMessage_initializers, void 0));
        deliveryFiles = (__runInitializers(this, _deliveryMessage_extraInitializers), __runInitializers(this, _deliveryFiles_initializers, void 0));
        payments = (__runInitializers(this, _deliveryFiles_extraInitializers), __runInitializers(this, _payments_initializers, void 0));
        reviews = (__runInitializers(this, _payments_extraInitializers), __runInitializers(this, _reviews_initializers, void 0));
        createdAt = (__runInitializers(this, _reviews_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor(partial) {
            __runInitializers(this, _updatedAt_extraInitializers);
            Object.assign(this, partial);
        }
    };
    return Order = _classThis;
})();
exports.Order = Order;
