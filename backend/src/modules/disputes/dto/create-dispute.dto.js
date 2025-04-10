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
exports.CreateDisputeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const dispute_schema_1 = require("../schemas/dispute.schema");
let CreateDisputeDto = (() => {
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _evidence_decorators;
    let _evidence_initializers = [];
    let _evidence_extraInitializers = [];
    return class CreateDisputeDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _orderId_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'ID de la commande concernée par le litige',
                    example: '5f9d4a3b9d1d2b001c8e0d9a'
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _reason_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Raison du litige',
                    enum: dispute_schema_1.DisputeReason,
                    example: dispute_schema_1.DisputeReason.QUALITY_NOT_AS_EXPECTED
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeReason)];
            _description_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Description détaillée du problème',
                    example: 'Le travail livré ne correspond pas du tout à mes attentes. Les couleurs sont différentes de celles demandées et le design ne respecte pas mes consignes.'
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _evidence_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Liens vers des pièces jointes justificatives',
                    example: ['/uploads/evidence1.jpg', '/uploads/evidence2.jpg'],
                    type: [String]
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _evidence_decorators, { kind: "field", name: "evidence", static: false, private: false, access: { has: obj => "evidence" in obj, get: obj => obj.evidence, set: (obj, value) => { obj.evidence = value; } }, metadata: _metadata }, _evidence_initializers, _evidence_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        orderId = __runInitializers(this, _orderId_initializers, void 0);
        reason = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        description = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        evidence = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _evidence_initializers, void 0));
        constructor() {
            __runInitializers(this, _evidence_extraInitializers);
        }
    };
})();
exports.CreateDisputeDto = CreateDisputeDto;
