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
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const service_entity_1 = require("../../services/entities/service.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Review = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('reviews')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _reviewer_decorators;
    let _reviewer_initializers = [];
    let _reviewer_extraInitializers = [];
    let _reviewerId_decorators;
    let _reviewerId_initializers = [];
    let _reviewerId_extraInitializers = [];
    let _reviewee_decorators;
    let _reviewee_initializers = [];
    let _reviewee_extraInitializers = [];
    let _revieweeId_decorators;
    let _revieweeId_initializers = [];
    let _revieweeId_extraInitializers = [];
    let _service_decorators;
    let _service_initializers = [];
    let _service_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _comment_decorators;
    let _comment_initializers = [];
    let _comment_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Review = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _reviewer_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.givenReviews), (0, typeorm_1.JoinColumn)({ name: 'reviewerId' })];
            _reviewerId_decorators = [(0, typeorm_1.Column)()];
            _reviewee_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedReviews), (0, typeorm_1.JoinColumn)({ name: 'revieweeId' })];
            _revieweeId_decorators = [(0, typeorm_1.Column)()];
            _service_decorators = [(0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.reviews), (0, typeorm_1.JoinColumn)({ name: 'serviceId' })];
            _serviceId_decorators = [(0, typeorm_1.Column)()];
            _order_decorators = [(0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.reviews), (0, typeorm_1.JoinColumn)({ name: 'orderId' })];
            _orderId_decorators = [(0, typeorm_1.Column)()];
            _rating_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: false })];
            _comment_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _reviewer_decorators, { kind: "field", name: "reviewer", static: false, private: false, access: { has: obj => "reviewer" in obj, get: obj => obj.reviewer, set: (obj, value) => { obj.reviewer = value; } }, metadata: _metadata }, _reviewer_initializers, _reviewer_extraInitializers);
            __esDecorate(null, null, _reviewerId_decorators, { kind: "field", name: "reviewerId", static: false, private: false, access: { has: obj => "reviewerId" in obj, get: obj => obj.reviewerId, set: (obj, value) => { obj.reviewerId = value; } }, metadata: _metadata }, _reviewerId_initializers, _reviewerId_extraInitializers);
            __esDecorate(null, null, _reviewee_decorators, { kind: "field", name: "reviewee", static: false, private: false, access: { has: obj => "reviewee" in obj, get: obj => obj.reviewee, set: (obj, value) => { obj.reviewee = value; } }, metadata: _metadata }, _reviewee_initializers, _reviewee_extraInitializers);
            __esDecorate(null, null, _revieweeId_decorators, { kind: "field", name: "revieweeId", static: false, private: false, access: { has: obj => "revieweeId" in obj, get: obj => obj.revieweeId, set: (obj, value) => { obj.revieweeId = value; } }, metadata: _metadata }, _revieweeId_initializers, _revieweeId_extraInitializers);
            __esDecorate(null, null, _service_decorators, { kind: "field", name: "service", static: false, private: false, access: { has: obj => "service" in obj, get: obj => obj.service, set: (obj, value) => { obj.service = value; } }, metadata: _metadata }, _service_initializers, _service_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: obj => "comment" in obj, get: obj => obj.comment, set: (obj, value) => { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Review = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        reviewer = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _reviewer_initializers, void 0));
        reviewerId = (__runInitializers(this, _reviewer_extraInitializers), __runInitializers(this, _reviewerId_initializers, void 0));
        reviewee = (__runInitializers(this, _reviewerId_extraInitializers), __runInitializers(this, _reviewee_initializers, void 0));
        revieweeId = (__runInitializers(this, _reviewee_extraInitializers), __runInitializers(this, _revieweeId_initializers, void 0));
        service = (__runInitializers(this, _revieweeId_extraInitializers), __runInitializers(this, _service_initializers, void 0));
        serviceId = (__runInitializers(this, _service_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        order = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        orderId = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
        rating = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
        comment = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
        createdAt = (__runInitializers(this, _comment_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    return Review = _classThis;
})();
exports.Review = Review;
