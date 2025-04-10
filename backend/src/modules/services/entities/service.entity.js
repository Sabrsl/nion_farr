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
exports.Service = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const service_option_entity_1 = require("./service-option.entity");
const service_category_entity_1 = require("./service-category.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const service_status_enum_1 = require("../enums/service-status.enum");
let Service = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('services')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _provider_decorators;
    let _provider_initializers = [];
    let _provider_extraInitializers = [];
    let _providerId_decorators;
    let _providerId_initializers = [];
    let _providerId_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _categoryId_decorators;
    let _categoryId_initializers = [];
    let _categoryId_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    let _deliveryTime_decorators;
    let _deliveryTime_initializers = [];
    let _deliveryTime_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _totalReviews_decorators;
    let _totalReviews_initializers = [];
    let _totalReviews_extraInitializers = [];
    let _totalOrders_decorators;
    let _totalOrders_initializers = [];
    let _totalOrders_extraInitializers = [];
    let _tags_decorators;
    let _tags_initializers = [];
    let _tags_extraInitializers = [];
    let _images_decorators;
    let _images_initializers = [];
    let _images_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _views_decorators;
    let _views_initializers = [];
    let _views_extraInitializers = [];
    let _likes_decorators;
    let _likes_initializers = [];
    let _likes_extraInitializers = [];
    let _likedBy_decorators;
    let _likedBy_initializers = [];
    let _likedBy_extraInitializers = [];
    let _orders_decorators;
    let _orders_initializers = [];
    let _orders_extraInitializers = [];
    let _reviews_decorators;
    let _reviews_initializers = [];
    let _reviews_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Service = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _title_decorators = [(0, typeorm_1.Column)()];
            _description_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
            _price_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
            _provider_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.services), (0, typeorm_1.JoinColumn)({ name: 'providerId' })];
            _providerId_decorators = [(0, typeorm_1.Column)()];
            _category_decorators = [(0, typeorm_1.ManyToOne)(() => service_category_entity_1.ServiceCategory, (category) => category.services), (0, typeorm_1.JoinColumn)({ name: 'categoryId' })];
            _categoryId_decorators = [(0, typeorm_1.Column)()];
            _options_decorators = [(0, typeorm_1.OneToMany)(() => service_option_entity_1.ServiceOption, (option) => option.service, { cascade: true })];
            _deliveryTime_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
            _rating_decorators = [(0, typeorm_1.Column)({ default: 0 })];
            _totalReviews_decorators = [(0, typeorm_1.Column)({ default: 0 })];
            _totalOrders_decorators = [(0, typeorm_1.Column)({ default: 0 })];
            _tags_decorators = [(0, typeorm_1.Column)({ type: 'simple-array', nullable: true })];
            _images_decorators = [(0, typeorm_1.Column)({ type: 'simple-array', nullable: true })];
            _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
            _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: service_status_enum_1.ServiceStatus, default: service_status_enum_1.ServiceStatus.ACTIVE })];
            _views_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
            _likes_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
            _likedBy_decorators = [(0, typeorm_1.ManyToMany)(() => user_entity_1.User), (0, typeorm_1.JoinTable)({
                    name: 'service_likes',
                    joinColumn: { name: 'serviceId', referencedColumnName: 'id' },
                    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
                })];
            _orders_decorators = [(0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.service)];
            _reviews_decorators = [(0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.service)];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _provider_decorators, { kind: "field", name: "provider", static: false, private: false, access: { has: obj => "provider" in obj, get: obj => obj.provider, set: (obj, value) => { obj.provider = value; } }, metadata: _metadata }, _provider_initializers, _provider_extraInitializers);
            __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: obj => "categoryId" in obj, get: obj => obj.categoryId, set: (obj, value) => { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(null, null, _deliveryTime_decorators, { kind: "field", name: "deliveryTime", static: false, private: false, access: { has: obj => "deliveryTime" in obj, get: obj => obj.deliveryTime, set: (obj, value) => { obj.deliveryTime = value; } }, metadata: _metadata }, _deliveryTime_initializers, _deliveryTime_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _totalReviews_decorators, { kind: "field", name: "totalReviews", static: false, private: false, access: { has: obj => "totalReviews" in obj, get: obj => obj.totalReviews, set: (obj, value) => { obj.totalReviews = value; } }, metadata: _metadata }, _totalReviews_initializers, _totalReviews_extraInitializers);
            __esDecorate(null, null, _totalOrders_decorators, { kind: "field", name: "totalOrders", static: false, private: false, access: { has: obj => "totalOrders" in obj, get: obj => obj.totalOrders, set: (obj, value) => { obj.totalOrders = value; } }, metadata: _metadata }, _totalOrders_initializers, _totalOrders_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: obj => "tags" in obj, get: obj => obj.tags, set: (obj, value) => { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: obj => "images" in obj, get: obj => obj.images, set: (obj, value) => { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: obj => "views" in obj, get: obj => obj.views, set: (obj, value) => { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
            __esDecorate(null, null, _likes_decorators, { kind: "field", name: "likes", static: false, private: false, access: { has: obj => "likes" in obj, get: obj => obj.likes, set: (obj, value) => { obj.likes = value; } }, metadata: _metadata }, _likes_initializers, _likes_extraInitializers);
            __esDecorate(null, null, _likedBy_decorators, { kind: "field", name: "likedBy", static: false, private: false, access: { has: obj => "likedBy" in obj, get: obj => obj.likedBy, set: (obj, value) => { obj.likedBy = value; } }, metadata: _metadata }, _likedBy_initializers, _likedBy_extraInitializers);
            __esDecorate(null, null, _orders_decorators, { kind: "field", name: "orders", static: false, private: false, access: { has: obj => "orders" in obj, get: obj => obj.orders, set: (obj, value) => { obj.orders = value; } }, metadata: _metadata }, _orders_initializers, _orders_extraInitializers);
            __esDecorate(null, null, _reviews_decorators, { kind: "field", name: "reviews", static: false, private: false, access: { has: obj => "reviews" in obj, get: obj => obj.reviews, set: (obj, value) => { obj.reviews = value; } }, metadata: _metadata }, _reviews_initializers, _reviews_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Service = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        title = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        price = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _price_initializers, void 0)); // In FCFA (1000 = 1000 FCFA)
        provider = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _provider_initializers, void 0));
        providerId = (__runInitializers(this, _provider_extraInitializers), __runInitializers(this, _providerId_initializers, void 0));
        category = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        categoryId = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
        options = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _options_initializers, void 0));
        deliveryTime = (__runInitializers(this, _options_extraInitializers), __runInitializers(this, _deliveryTime_initializers, void 0)); // In days
        rating = (__runInitializers(this, _deliveryTime_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
        totalReviews = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _totalReviews_initializers, void 0));
        totalOrders = (__runInitializers(this, _totalReviews_extraInitializers), __runInitializers(this, _totalOrders_initializers, void 0));
        tags = (__runInitializers(this, _totalOrders_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
        images = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _images_initializers, void 0));
        isActive = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        status = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        views = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _views_initializers, void 0));
        likes = (__runInitializers(this, _views_extraInitializers), __runInitializers(this, _likes_initializers, void 0));
        likedBy = (__runInitializers(this, _likes_extraInitializers), __runInitializers(this, _likedBy_initializers, void 0));
        orders = (__runInitializers(this, _likedBy_extraInitializers), __runInitializers(this, _orders_initializers, void 0));
        reviews = (__runInitializers(this, _orders_extraInitializers), __runInitializers(this, _reviews_initializers, void 0));
        createdAt = (__runInitializers(this, _reviews_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor(partial) {
            __runInitializers(this, _updatedAt_extraInitializers);
            Object.assign(this, partial);
        }
    };
    return Service = _classThis;
})();
exports.Service = Service;
