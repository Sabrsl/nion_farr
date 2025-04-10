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
exports.PaymentGateway = void 0;
const typeorm_1 = require("typeorm");
const payment_gateway_type_enum_1 = require("../enums/payment-gateway-type.enum");
let PaymentGateway = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('payment_gateways')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _isSandbox_decorators;
    let _isSandbox_initializers = [];
    let _isSandbox_extraInitializers = [];
    let _config_decorators;
    let _config_initializers = [];
    let _config_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _supportedMethods_decorators;
    let _supportedMethods_initializers = [];
    let _supportedMethods_extraInitializers = [];
    let _fee_decorators;
    let _fee_initializers = [];
    let _fee_extraInitializers = [];
    let _feePercent_decorators;
    let _feePercent_initializers = [];
    let _feePercent_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var PaymentGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _name_decorators = [(0, typeorm_1.Column)({ unique: true })];
            _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: payment_gateway_type_enum_1.PaymentGatewayType })];
            _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
            _isSandbox_decorators = [(0, typeorm_1.Column)({ default: false })];
            _config_decorators = [(0, typeorm_1.Column)({ type: 'json', nullable: true })];
            _description_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _supportedMethods_decorators = [(0, typeorm_1.Column)({ type: 'json', default: '[]' })];
            _fee_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 })];
            _feePercent_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _isSandbox_decorators, { kind: "field", name: "isSandbox", static: false, private: false, access: { has: obj => "isSandbox" in obj, get: obj => obj.isSandbox, set: (obj, value) => { obj.isSandbox = value; } }, metadata: _metadata }, _isSandbox_initializers, _isSandbox_extraInitializers);
            __esDecorate(null, null, _config_decorators, { kind: "field", name: "config", static: false, private: false, access: { has: obj => "config" in obj, get: obj => obj.config, set: (obj, value) => { obj.config = value; } }, metadata: _metadata }, _config_initializers, _config_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _supportedMethods_decorators, { kind: "field", name: "supportedMethods", static: false, private: false, access: { has: obj => "supportedMethods" in obj, get: obj => obj.supportedMethods, set: (obj, value) => { obj.supportedMethods = value; } }, metadata: _metadata }, _supportedMethods_initializers, _supportedMethods_extraInitializers);
            __esDecorate(null, null, _fee_decorators, { kind: "field", name: "fee", static: false, private: false, access: { has: obj => "fee" in obj, get: obj => obj.fee, set: (obj, value) => { obj.fee = value; } }, metadata: _metadata }, _fee_initializers, _fee_extraInitializers);
            __esDecorate(null, null, _feePercent_decorators, { kind: "field", name: "feePercent", static: false, private: false, access: { has: obj => "feePercent" in obj, get: obj => obj.feePercent, set: (obj, value) => { obj.feePercent = value; } }, metadata: _metadata }, _feePercent_initializers, _feePercent_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        isActive = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        isSandbox = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _isSandbox_initializers, void 0));
        config = (__runInitializers(this, _isSandbox_extraInitializers), __runInitializers(this, _config_initializers, void 0));
        description = (__runInitializers(this, _config_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        supportedMethods = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _supportedMethods_initializers, void 0));
        fee = (__runInitializers(this, _supportedMethods_extraInitializers), __runInitializers(this, _fee_initializers, void 0));
        feePercent = (__runInitializers(this, _fee_extraInitializers), __runInitializers(this, _feePercent_initializers, void 0));
        createdAt = (__runInitializers(this, _feePercent_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    return PaymentGateway = _classThis;
})();
exports.PaymentGateway = PaymentGateway;
