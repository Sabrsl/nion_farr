"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeSchema = exports.Dispute = exports.DisputeReason = exports.DisputeStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = __importStar(require("mongoose"));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["PENDING"] = "pending";
    DisputeStatus["UNDER_REVIEW"] = "under_review";
    DisputeStatus["RESOLVED_CLIENT"] = "resolved_client";
    DisputeStatus["RESOLVED_PROVIDER"] = "resolved_provider";
    DisputeStatus["RESOLVED_PARTIAL"] = "resolved_partial";
    DisputeStatus["REJECTED"] = "rejected";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputeReason;
(function (DisputeReason) {
    DisputeReason["QUALITY_NOT_AS_EXPECTED"] = "quality_not_as_expected";
    DisputeReason["ORDER_NOT_DELIVERED"] = "order_not_delivered";
    DisputeReason["REQUIREMENTS_NOT_MET"] = "requirements_not_met";
    DisputeReason["INCORRECT_ORDER"] = "incorrect_order";
    DisputeReason["COMMUNICATION_ISSUES"] = "communication_issues";
    DisputeReason["OTHER"] = "other";
})(DisputeReason || (exports.DisputeReason = DisputeReason = {}));
let Dispute = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({
            timestamps: true,
            toJSON: {
                virtuals: true,
                transform: (doc, ret) => {
                    ret.id = ret._id;
                    delete ret._id;
                    delete ret.__v;
                    return ret;
                }
            }
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mongoose_2.Document;
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _openedBy_decorators;
    let _openedBy_initializers = [];
    let _openedBy_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _evidence_decorators;
    let _evidence_initializers = [];
    let _evidence_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _timeline_decorators;
    let _timeline_initializers = [];
    let _timeline_extraInitializers = [];
    let _messages_decorators;
    let _messages_initializers = [];
    let _messages_extraInitializers = [];
    let _resolvedBy_decorators;
    let _resolvedBy_initializers = [];
    let _resolvedBy_extraInitializers = [];
    let _resolvedAt_decorators;
    let _resolvedAt_initializers = [];
    let _resolvedAt_extraInitializers = [];
    let _resolution_decorators;
    let _resolution_initializers = [];
    let _resolution_extraInitializers = [];
    let _refundAmount_decorators;
    let _refundAmount_initializers = [];
    let _refundAmount_extraInitializers = [];
    var Dispute = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _order_decorators = [(0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true })];
            _openedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })];
            _reason_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(DisputeReason), required: true })];
            _description_decorators = [(0, mongoose_1.Prop)({ type: String, required: true })];
            _evidence_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
            _status_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(DisputeStatus), default: DisputeStatus.PENDING })];
            _timeline_decorators = [(0, mongoose_1.Prop)({ type: [
                        {
                            status: { type: String, enum: Object.values(DisputeStatus), required: true },
                            date: { type: Date, default: Date.now },
                            comments: { type: String },
                            actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
                        }
                    ], default: [] })];
            _messages_decorators = [(0, mongoose_1.Prop)({ type: [
                        {
                            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                            content: { type: String, required: true },
                            createdAt: { type: Date, default: Date.now },
                            isAdmin: { type: Boolean, default: false },
                            attachments: { type: [String], default: [] }
                        }
                    ], default: [] })];
            _resolvedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })];
            _resolvedAt_decorators = [(0, mongoose_1.Prop)({ type: Date })];
            _resolution_decorators = [(0, mongoose_1.Prop)({ type: String })];
            _refundAmount_decorators = [(0, mongoose_1.Prop)({ type: Number })];
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _openedBy_decorators, { kind: "field", name: "openedBy", static: false, private: false, access: { has: obj => "openedBy" in obj, get: obj => obj.openedBy, set: (obj, value) => { obj.openedBy = value; } }, metadata: _metadata }, _openedBy_initializers, _openedBy_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _evidence_decorators, { kind: "field", name: "evidence", static: false, private: false, access: { has: obj => "evidence" in obj, get: obj => obj.evidence, set: (obj, value) => { obj.evidence = value; } }, metadata: _metadata }, _evidence_initializers, _evidence_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _timeline_decorators, { kind: "field", name: "timeline", static: false, private: false, access: { has: obj => "timeline" in obj, get: obj => obj.timeline, set: (obj, value) => { obj.timeline = value; } }, metadata: _metadata }, _timeline_initializers, _timeline_extraInitializers);
            __esDecorate(null, null, _messages_decorators, { kind: "field", name: "messages", static: false, private: false, access: { has: obj => "messages" in obj, get: obj => obj.messages, set: (obj, value) => { obj.messages = value; } }, metadata: _metadata }, _messages_initializers, _messages_extraInitializers);
            __esDecorate(null, null, _resolvedBy_decorators, { kind: "field", name: "resolvedBy", static: false, private: false, access: { has: obj => "resolvedBy" in obj, get: obj => obj.resolvedBy, set: (obj, value) => { obj.resolvedBy = value; } }, metadata: _metadata }, _resolvedBy_initializers, _resolvedBy_extraInitializers);
            __esDecorate(null, null, _resolvedAt_decorators, { kind: "field", name: "resolvedAt", static: false, private: false, access: { has: obj => "resolvedAt" in obj, get: obj => obj.resolvedAt, set: (obj, value) => { obj.resolvedAt = value; } }, metadata: _metadata }, _resolvedAt_initializers, _resolvedAt_extraInitializers);
            __esDecorate(null, null, _resolution_decorators, { kind: "field", name: "resolution", static: false, private: false, access: { has: obj => "resolution" in obj, get: obj => obj.resolution, set: (obj, value) => { obj.resolution = value; } }, metadata: _metadata }, _resolution_initializers, _resolution_extraInitializers);
            __esDecorate(null, null, _refundAmount_decorators, { kind: "field", name: "refundAmount", static: false, private: false, access: { has: obj => "refundAmount" in obj, get: obj => obj.refundAmount, set: (obj, value) => { obj.refundAmount = value; } }, metadata: _metadata }, _refundAmount_initializers, _refundAmount_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Dispute = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        order = __runInitializers(this, _order_initializers, void 0);
        openedBy = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _openedBy_initializers, void 0));
        reason = (__runInitializers(this, _openedBy_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        description = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        evidence = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _evidence_initializers, void 0));
        status = (__runInitializers(this, _evidence_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        timeline = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _timeline_initializers, void 0));
        messages = (__runInitializers(this, _timeline_extraInitializers), __runInitializers(this, _messages_initializers, void 0));
        resolvedBy = (__runInitializers(this, _messages_extraInitializers), __runInitializers(this, _resolvedBy_initializers, void 0));
        resolvedAt = (__runInitializers(this, _resolvedBy_extraInitializers), __runInitializers(this, _resolvedAt_initializers, void 0));
        resolution = (__runInitializers(this, _resolvedAt_extraInitializers), __runInitializers(this, _resolution_initializers, void 0));
        refundAmount = (__runInitializers(this, _resolution_extraInitializers), __runInitializers(this, _refundAmount_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _refundAmount_extraInitializers);
        }
    };
    return Dispute = _classThis;
})();
exports.Dispute = Dispute;
exports.DisputeSchema = mongoose_1.SchemaFactory.createForClass(Dispute);
