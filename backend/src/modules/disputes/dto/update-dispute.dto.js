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
exports.UpdateDisputeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const dispute_schema_1 = require("../schemas/dispute.schema");
let UpdateDisputeDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _comments_decorators;
    let _comments_initializers = [];
    let _comments_extraInitializers = [];
    let _resolution_decorators;
    let _resolution_initializers = [];
    let _resolution_extraInitializers = [];
    let _refundAmount_decorators;
    let _refundAmount_initializers = [];
    let _refundAmount_extraInitializers = [];
    let _additionalEvidence_decorators;
    let _additionalEvidence_initializers = [];
    let _additionalEvidence_extraInitializers = [];
    return class UpdateDisputeDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Statut du litige',
                    enum: dispute_schema_1.DisputeStatus,
                    example: dispute_schema_1.DisputeStatus.UNDER_REVIEW
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(dispute_schema_1.DisputeStatus)];
            _comments_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Commentaires sur la mise à jour du statut',
                    example: 'Mise à jour après examen des pièces fournies'
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _resolution_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Résolution détaillée du litige',
                    example: 'Après examen des pièces fournies, nous avons déterminé que le travail livré ne correspond pas aux exigences. Un remboursement partiel sera effectué.'
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _refundAmount_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Montant du remboursement (en cas de résolution)',
                    example: 25000
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _additionalEvidence_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Pièces jointes supplémentaires',
                    example: ['/uploads/resolution-proof.jpg'],
                    type: [String]
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _comments_decorators, { kind: "field", name: "comments", static: false, private: false, access: { has: obj => "comments" in obj, get: obj => obj.comments, set: (obj, value) => { obj.comments = value; } }, metadata: _metadata }, _comments_initializers, _comments_extraInitializers);
            __esDecorate(null, null, _resolution_decorators, { kind: "field", name: "resolution", static: false, private: false, access: { has: obj => "resolution" in obj, get: obj => obj.resolution, set: (obj, value) => { obj.resolution = value; } }, metadata: _metadata }, _resolution_initializers, _resolution_extraInitializers);
            __esDecorate(null, null, _refundAmount_decorators, { kind: "field", name: "refundAmount", static: false, private: false, access: { has: obj => "refundAmount" in obj, get: obj => obj.refundAmount, set: (obj, value) => { obj.refundAmount = value; } }, metadata: _metadata }, _refundAmount_initializers, _refundAmount_extraInitializers);
            __esDecorate(null, null, _additionalEvidence_decorators, { kind: "field", name: "additionalEvidence", static: false, private: false, access: { has: obj => "additionalEvidence" in obj, get: obj => obj.additionalEvidence, set: (obj, value) => { obj.additionalEvidence = value; } }, metadata: _metadata }, _additionalEvidence_initializers, _additionalEvidence_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        comments = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _comments_initializers, void 0));
        resolution = (__runInitializers(this, _comments_extraInitializers), __runInitializers(this, _resolution_initializers, void 0));
        refundAmount = (__runInitializers(this, _resolution_extraInitializers), __runInitializers(this, _refundAmount_initializers, void 0));
        additionalEvidence = (__runInitializers(this, _refundAmount_extraInitializers), __runInitializers(this, _additionalEvidence_initializers, void 0));
        constructor() {
            __runInitializers(this, _additionalEvidence_extraInitializers);
        }
    };
})();
exports.UpdateDisputeDto = UpdateDisputeDto;
