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
exports.ConversationSchema = exports.Conversation = exports.MessageSchema = exports.Message = exports.MessageType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
let Message = (() => {
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
    let _sender_decorators;
    let _sender_initializers = [];
    let _sender_extraInitializers = [];
    let _recipient_decorators;
    let _recipient_initializers = [];
    let _recipient_extraInitializers = [];
    let _conversation_decorators;
    let _conversation_initializers = [];
    let _conversation_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _attachment_decorators;
    let _attachment_initializers = [];
    let _attachment_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _isRead_decorators;
    let _isRead_initializers = [];
    let _isRead_extraInitializers = [];
    let _readAt_decorators;
    let _readAt_initializers = [];
    let _readAt_extraInitializers = [];
    let _isDeleted_decorators;
    let _isDeleted_initializers = [];
    let _isDeleted_extraInitializers = [];
    let _isEdited_decorators;
    let _isEdited_initializers = [];
    let _isEdited_extraInitializers = [];
    let _editedAt_decorators;
    let _editedAt_initializers = [];
    let _editedAt_extraInitializers = [];
    var Message = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _sender_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true })];
            _recipient_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true })];
            _conversation_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Conversation', required: true })];
            _order_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order' })];
            _content_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _type_decorators = [(0, mongoose_1.Prop)({ enum: Object.values(MessageType), default: MessageType.TEXT })];
            _attachment_decorators = [(0, mongoose_1.Prop)()];
            _metadata_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _isRead_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _readAt_decorators = [(0, mongoose_1.Prop)()];
            _isDeleted_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _isEdited_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _editedAt_decorators = [(0, mongoose_1.Prop)()];
            __esDecorate(null, null, _sender_decorators, { kind: "field", name: "sender", static: false, private: false, access: { has: obj => "sender" in obj, get: obj => obj.sender, set: (obj, value) => { obj.sender = value; } }, metadata: _metadata }, _sender_initializers, _sender_extraInitializers);
            __esDecorate(null, null, _recipient_decorators, { kind: "field", name: "recipient", static: false, private: false, access: { has: obj => "recipient" in obj, get: obj => obj.recipient, set: (obj, value) => { obj.recipient = value; } }, metadata: _metadata }, _recipient_initializers, _recipient_extraInitializers);
            __esDecorate(null, null, _conversation_decorators, { kind: "field", name: "conversation", static: false, private: false, access: { has: obj => "conversation" in obj, get: obj => obj.conversation, set: (obj, value) => { obj.conversation = value; } }, metadata: _metadata }, _conversation_initializers, _conversation_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _attachment_decorators, { kind: "field", name: "attachment", static: false, private: false, access: { has: obj => "attachment" in obj, get: obj => obj.attachment, set: (obj, value) => { obj.attachment = value; } }, metadata: _metadata }, _attachment_initializers, _attachment_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            __esDecorate(null, null, _isRead_decorators, { kind: "field", name: "isRead", static: false, private: false, access: { has: obj => "isRead" in obj, get: obj => obj.isRead, set: (obj, value) => { obj.isRead = value; } }, metadata: _metadata }, _isRead_initializers, _isRead_extraInitializers);
            __esDecorate(null, null, _readAt_decorators, { kind: "field", name: "readAt", static: false, private: false, access: { has: obj => "readAt" in obj, get: obj => obj.readAt, set: (obj, value) => { obj.readAt = value; } }, metadata: _metadata }, _readAt_initializers, _readAt_extraInitializers);
            __esDecorate(null, null, _isDeleted_decorators, { kind: "field", name: "isDeleted", static: false, private: false, access: { has: obj => "isDeleted" in obj, get: obj => obj.isDeleted, set: (obj, value) => { obj.isDeleted = value; } }, metadata: _metadata }, _isDeleted_initializers, _isDeleted_extraInitializers);
            __esDecorate(null, null, _isEdited_decorators, { kind: "field", name: "isEdited", static: false, private: false, access: { has: obj => "isEdited" in obj, get: obj => obj.isEdited, set: (obj, value) => { obj.isEdited = value; } }, metadata: _metadata }, _isEdited_initializers, _isEdited_extraInitializers);
            __esDecorate(null, null, _editedAt_decorators, { kind: "field", name: "editedAt", static: false, private: false, access: { has: obj => "editedAt" in obj, get: obj => obj.editedAt, set: (obj, value) => { obj.editedAt = value; } }, metadata: _metadata }, _editedAt_initializers, _editedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Message = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        sender = __runInitializers(this, _sender_initializers, void 0);
        recipient = (__runInitializers(this, _sender_extraInitializers), __runInitializers(this, _recipient_initializers, void 0));
        conversation = (__runInitializers(this, _recipient_extraInitializers), __runInitializers(this, _conversation_initializers, void 0));
        order = (__runInitializers(this, _conversation_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        content = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        type = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        attachment = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _attachment_initializers, void 0));
        metadata = (__runInitializers(this, _attachment_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
        isRead = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _isRead_initializers, void 0));
        readAt = (__runInitializers(this, _isRead_extraInitializers), __runInitializers(this, _readAt_initializers, void 0));
        isDeleted = (__runInitializers(this, _readAt_extraInitializers), __runInitializers(this, _isDeleted_initializers, void 0));
        isEdited = (__runInitializers(this, _isDeleted_extraInitializers), __runInitializers(this, _isEdited_initializers, void 0));
        editedAt = (__runInitializers(this, _isEdited_extraInitializers), __runInitializers(this, _editedAt_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _editedAt_extraInitializers);
        }
    };
    return Message = _classThis;
})();
exports.Message = Message;
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
let Conversation = (() => {
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
    let _participants_decorators;
    let _participants_initializers = [];
    let _participants_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _lastMessage_decorators;
    let _lastMessage_initializers = [];
    let _lastMessage_extraInitializers = [];
    let _unreadCount_decorators;
    let _unreadCount_initializers = [];
    let _unreadCount_extraInitializers = [];
    let _isOrderRelated_decorators;
    let _isOrderRelated_initializers = [];
    let _isOrderRelated_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    var Conversation = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _participants_decorators = [(0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }], required: true })];
            _order_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order' })];
            _isActive_decorators = [(0, mongoose_1.Prop)({ default: true })];
            _lastMessage_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _unreadCount_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} })];
            _isOrderRelated_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _title_decorators = [(0, mongoose_1.Prop)()];
            __esDecorate(null, null, _participants_decorators, { kind: "field", name: "participants", static: false, private: false, access: { has: obj => "participants" in obj, get: obj => obj.participants, set: (obj, value) => { obj.participants = value; } }, metadata: _metadata }, _participants_initializers, _participants_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _lastMessage_decorators, { kind: "field", name: "lastMessage", static: false, private: false, access: { has: obj => "lastMessage" in obj, get: obj => obj.lastMessage, set: (obj, value) => { obj.lastMessage = value; } }, metadata: _metadata }, _lastMessage_initializers, _lastMessage_extraInitializers);
            __esDecorate(null, null, _unreadCount_decorators, { kind: "field", name: "unreadCount", static: false, private: false, access: { has: obj => "unreadCount" in obj, get: obj => obj.unreadCount, set: (obj, value) => { obj.unreadCount = value; } }, metadata: _metadata }, _unreadCount_initializers, _unreadCount_extraInitializers);
            __esDecorate(null, null, _isOrderRelated_decorators, { kind: "field", name: "isOrderRelated", static: false, private: false, access: { has: obj => "isOrderRelated" in obj, get: obj => obj.isOrderRelated, set: (obj, value) => { obj.isOrderRelated = value; } }, metadata: _metadata }, _isOrderRelated_initializers, _isOrderRelated_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Conversation = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        participants = __runInitializers(this, _participants_initializers, void 0);
        order = (__runInitializers(this, _participants_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        isActive = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        lastMessage = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _lastMessage_initializers, void 0));
        unreadCount = (__runInitializers(this, _lastMessage_extraInitializers), __runInitializers(this, _unreadCount_initializers, void 0));
        isOrderRelated = (__runInitializers(this, _unreadCount_extraInitializers), __runInitializers(this, _isOrderRelated_initializers, void 0));
        title = (__runInitializers(this, _isOrderRelated_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _title_extraInitializers);
        }
    };
    return Conversation = _classThis;
})();
exports.Conversation = Conversation;
exports.ConversationSchema = mongoose_1.SchemaFactory.createForClass(Conversation);
