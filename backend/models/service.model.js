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
exports.ServiceSchema = exports.Service = exports.ServiceCategory = exports.ServiceStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["ACTIVE"] = "active";
    ServiceStatus["INACTIVE"] = "inactive";
    ServiceStatus["PENDING"] = "pending";
    ServiceStatus["REJECTED"] = "rejected";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["GRAPHIC_DESIGN"] = "graphic_design";
    ServiceCategory["WEB_DEVELOPMENT"] = "web_development";
    ServiceCategory["MOBILE_DEVELOPMENT"] = "mobile_development";
    ServiceCategory["CONTENT_WRITING"] = "content_writing";
    ServiceCategory["TRANSLATION"] = "translation";
    ServiceCategory["MARKETING"] = "marketing";
    ServiceCategory["VIDEO_EDITING"] = "video_editing";
    ServiceCategory["VOICE_OVER"] = "voice_over";
    ServiceCategory["SOCIAL_MEDIA"] = "social_media";
    ServiceCategory["OTHER"] = "other";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
let Service = (() => {
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
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _shortDescription_decorators;
    let _shortDescription_initializers = [];
    let _shortDescription_extraInitializers = [];
    let _provider_decorators;
    let _provider_initializers = [];
    let _provider_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _tags_decorators;
    let _tags_initializers = [];
    let _tags_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _deliveryTime_decorators;
    let _deliveryTime_initializers = [];
    let _deliveryTime_extraInitializers = [];
    let _revisions_decorators;
    let _revisions_initializers = [];
    let _revisions_extraInitializers = [];
    let _images_decorators;
    let _images_initializers = [];
    let _images_extraInitializers = [];
    let _thumbnail_decorators;
    let _thumbnail_initializers = [];
    let _thumbnail_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _isFeatured_decorators;
    let _isFeatured_initializers = [];
    let _isFeatured_extraInitializers = [];
    let _packages_decorators;
    let _packages_initializers = [];
    let _packages_extraInitializers = [];
    let _hasOfferPackages_decorators;
    let _hasOfferPackages_initializers = [];
    let _hasOfferPackages_extraInitializers = [];
    let _faqs_decorators;
    let _faqs_initializers = [];
    let _faqs_extraInitializers = [];
    let _requirements_decorators;
    let _requirements_initializers = [];
    let _requirements_extraInitializers = [];
    let _views_decorators;
    let _views_initializers = [];
    let _views_extraInitializers = [];
    let _sales_decorators;
    let _sales_initializers = [];
    let _sales_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _totalReviews_decorators;
    let _totalReviews_initializers = [];
    let _totalReviews_extraInitializers = [];
    let _rejectionReason_decorators;
    let _rejectionReason_initializers = [];
    let _rejectionReason_extraInitializers = [];
    let _reviewedAt_decorators;
    let _reviewedAt_initializers = [];
    let _reviewedAt_extraInitializers = [];
    let _reviewedBy_decorators;
    let _reviewedBy_initializers = [];
    let _reviewedBy_extraInitializers = [];
    var Service = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _title_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _description_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _shortDescription_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _provider_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true })];
            _category_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(ServiceCategory), required: true })];
            _tags_decorators = [(0, mongoose_1.Prop)([String])];
            _price_decorators = [(0, mongoose_1.Prop)({ required: true, min: 0 })];
            _deliveryTime_decorators = [(0, mongoose_1.Prop)({ required: true, min: 1 })];
            _revisions_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _images_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
            _thumbnail_decorators = [(0, mongoose_1.Prop)()];
            _status_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(ServiceStatus), default: ServiceStatus.PENDING })];
            _isFeatured_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _packages_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: [] })];
            _hasOfferPackages_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _faqs_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: [] })];
            _requirements_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: [] })];
            _views_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _sales_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _rating_decorators = [(0, mongoose_1.Prop)({ default: 0, min: 0, max: 5 })];
            _totalReviews_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _rejectionReason_decorators = [(0, mongoose_1.Prop)({ type: String })];
            _reviewedAt_decorators = [(0, mongoose_1.Prop)()];
            _reviewedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' })];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _shortDescription_decorators, { kind: "field", name: "shortDescription", static: false, private: false, access: { has: obj => "shortDescription" in obj, get: obj => obj.shortDescription, set: (obj, value) => { obj.shortDescription = value; } }, metadata: _metadata }, _shortDescription_initializers, _shortDescription_extraInitializers);
            __esDecorate(null, null, _provider_decorators, { kind: "field", name: "provider", static: false, private: false, access: { has: obj => "provider" in obj, get: obj => obj.provider, set: (obj, value) => { obj.provider = value; } }, metadata: _metadata }, _provider_initializers, _provider_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: obj => "tags" in obj, get: obj => obj.tags, set: (obj, value) => { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _deliveryTime_decorators, { kind: "field", name: "deliveryTime", static: false, private: false, access: { has: obj => "deliveryTime" in obj, get: obj => obj.deliveryTime, set: (obj, value) => { obj.deliveryTime = value; } }, metadata: _metadata }, _deliveryTime_initializers, _deliveryTime_extraInitializers);
            __esDecorate(null, null, _revisions_decorators, { kind: "field", name: "revisions", static: false, private: false, access: { has: obj => "revisions" in obj, get: obj => obj.revisions, set: (obj, value) => { obj.revisions = value; } }, metadata: _metadata }, _revisions_initializers, _revisions_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: obj => "images" in obj, get: obj => obj.images, set: (obj, value) => { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, null, _thumbnail_decorators, { kind: "field", name: "thumbnail", static: false, private: false, access: { has: obj => "thumbnail" in obj, get: obj => obj.thumbnail, set: (obj, value) => { obj.thumbnail = value; } }, metadata: _metadata }, _thumbnail_initializers, _thumbnail_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _isFeatured_decorators, { kind: "field", name: "isFeatured", static: false, private: false, access: { has: obj => "isFeatured" in obj, get: obj => obj.isFeatured, set: (obj, value) => { obj.isFeatured = value; } }, metadata: _metadata }, _isFeatured_initializers, _isFeatured_extraInitializers);
            __esDecorate(null, null, _packages_decorators, { kind: "field", name: "packages", static: false, private: false, access: { has: obj => "packages" in obj, get: obj => obj.packages, set: (obj, value) => { obj.packages = value; } }, metadata: _metadata }, _packages_initializers, _packages_extraInitializers);
            __esDecorate(null, null, _hasOfferPackages_decorators, { kind: "field", name: "hasOfferPackages", static: false, private: false, access: { has: obj => "hasOfferPackages" in obj, get: obj => obj.hasOfferPackages, set: (obj, value) => { obj.hasOfferPackages = value; } }, metadata: _metadata }, _hasOfferPackages_initializers, _hasOfferPackages_extraInitializers);
            __esDecorate(null, null, _faqs_decorators, { kind: "field", name: "faqs", static: false, private: false, access: { has: obj => "faqs" in obj, get: obj => obj.faqs, set: (obj, value) => { obj.faqs = value; } }, metadata: _metadata }, _faqs_initializers, _faqs_extraInitializers);
            __esDecorate(null, null, _requirements_decorators, { kind: "field", name: "requirements", static: false, private: false, access: { has: obj => "requirements" in obj, get: obj => obj.requirements, set: (obj, value) => { obj.requirements = value; } }, metadata: _metadata }, _requirements_initializers, _requirements_extraInitializers);
            __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: obj => "views" in obj, get: obj => obj.views, set: (obj, value) => { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
            __esDecorate(null, null, _sales_decorators, { kind: "field", name: "sales", static: false, private: false, access: { has: obj => "sales" in obj, get: obj => obj.sales, set: (obj, value) => { obj.sales = value; } }, metadata: _metadata }, _sales_initializers, _sales_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _totalReviews_decorators, { kind: "field", name: "totalReviews", static: false, private: false, access: { has: obj => "totalReviews" in obj, get: obj => obj.totalReviews, set: (obj, value) => { obj.totalReviews = value; } }, metadata: _metadata }, _totalReviews_initializers, _totalReviews_extraInitializers);
            __esDecorate(null, null, _rejectionReason_decorators, { kind: "field", name: "rejectionReason", static: false, private: false, access: { has: obj => "rejectionReason" in obj, get: obj => obj.rejectionReason, set: (obj, value) => { obj.rejectionReason = value; } }, metadata: _metadata }, _rejectionReason_initializers, _rejectionReason_extraInitializers);
            __esDecorate(null, null, _reviewedAt_decorators, { kind: "field", name: "reviewedAt", static: false, private: false, access: { has: obj => "reviewedAt" in obj, get: obj => obj.reviewedAt, set: (obj, value) => { obj.reviewedAt = value; } }, metadata: _metadata }, _reviewedAt_initializers, _reviewedAt_extraInitializers);
            __esDecorate(null, null, _reviewedBy_decorators, { kind: "field", name: "reviewedBy", static: false, private: false, access: { has: obj => "reviewedBy" in obj, get: obj => obj.reviewedBy, set: (obj, value) => { obj.reviewedBy = value; } }, metadata: _metadata }, _reviewedBy_initializers, _reviewedBy_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Service = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        title = __runInitializers(this, _title_initializers, void 0);
        description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        shortDescription = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _shortDescription_initializers, void 0));
        provider = (__runInitializers(this, _shortDescription_extraInitializers), __runInitializers(this, _provider_initializers, void 0));
        category = (__runInitializers(this, _provider_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        tags = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
        price = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        deliveryTime = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _deliveryTime_initializers, void 0));
        revisions = (__runInitializers(this, _deliveryTime_extraInitializers), __runInitializers(this, _revisions_initializers, void 0));
        images = (__runInitializers(this, _revisions_extraInitializers), __runInitializers(this, _images_initializers, void 0));
        thumbnail = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _thumbnail_initializers, void 0));
        status = (__runInitializers(this, _thumbnail_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        isFeatured = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _isFeatured_initializers, void 0));
        packages = (__runInitializers(this, _isFeatured_extraInitializers), __runInitializers(this, _packages_initializers, void 0));
        hasOfferPackages = (__runInitializers(this, _packages_extraInitializers), __runInitializers(this, _hasOfferPackages_initializers, void 0));
        faqs = (__runInitializers(this, _hasOfferPackages_extraInitializers), __runInitializers(this, _faqs_initializers, void 0));
        requirements = (__runInitializers(this, _faqs_extraInitializers), __runInitializers(this, _requirements_initializers, void 0));
        views = (__runInitializers(this, _requirements_extraInitializers), __runInitializers(this, _views_initializers, void 0));
        sales = (__runInitializers(this, _views_extraInitializers), __runInitializers(this, _sales_initializers, void 0));
        rating = (__runInitializers(this, _sales_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
        totalReviews = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _totalReviews_initializers, void 0));
        rejectionReason = (__runInitializers(this, _totalReviews_extraInitializers), __runInitializers(this, _rejectionReason_initializers, void 0));
        reviewedAt = (__runInitializers(this, _rejectionReason_extraInitializers), __runInitializers(this, _reviewedAt_initializers, void 0));
        reviewedBy = (__runInitializers(this, _reviewedAt_extraInitializers), __runInitializers(this, _reviewedBy_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _reviewedBy_extraInitializers);
        }
    };
    return Service = _classThis;
})();
exports.Service = Service;
exports.ServiceSchema = mongoose_1.SchemaFactory.createForClass(Service);
