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
exports.Message = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const conversation_entity_1 = require("./conversation.entity");
const message_type_enum_1 = require("../enums/message-type.enum");
let Message = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('messages')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _conversation_decorators;
    let _conversation_initializers = [];
    let _conversation_extraInitializers = [];
    let _conversationId_decorators;
    let _conversationId_initializers = [];
    let _conversationId_extraInitializers = [];
    let _sender_decorators;
    let _sender_initializers = [];
    let _sender_extraInitializers = [];
    let _senderId_decorators;
    let _senderId_initializers = [];
    let _senderId_extraInitializers = [];
    let _receiver_decorators;
    let _receiver_initializers = [];
    let _receiver_extraInitializers = [];
    let _receiverId_decorators;
    let _receiverId_initializers = [];
    let _receiverId_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _attachments_decorators;
    let _attachments_initializers = [];
    let _attachments_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _isRead_decorators;
    let _isRead_initializers = [];
    let _isRead_extraInitializers = [];
    let _isDeleted_decorators;
    let _isDeleted_initializers = [];
    let _isDeleted_extraInitializers = [];
    let _readAt_decorators;
    let _readAt_initializers = [];
    let _readAt_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Message = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _conversation_decorators = [(0, typeorm_1.ManyToOne)(() => conversation_entity_1.Conversation, (conversation) => conversation.messages), (0, typeorm_1.JoinColumn)({ name: 'conversationId' })];
            _conversationId_decorators = [(0, typeorm_1.Column)()];
            _sender_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentMessages), (0, typeorm_1.JoinColumn)({ name: 'senderId' })];
            _senderId_decorators = [(0, typeorm_1.Column)()];
            _receiver_decorators = [(0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedMessages), (0, typeorm_1.JoinColumn)({ name: 'receiverId' })];
            _receiverId_decorators = [(0, typeorm_1.Column)()];
            _content_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
            _attachments_decorators = [(0, typeorm_1.Column)({ type: 'simple-array', nullable: true })];
            _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: message_type_enum_1.MessageType, default: message_type_enum_1.MessageType.TEXT })];
            _isRead_decorators = [(0, typeorm_1.Column)({ default: false })];
            _isDeleted_decorators = [(0, typeorm_1.Column)({ default: false })];
            _readAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _conversation_decorators, { kind: "field", name: "conversation", static: false, private: false, access: { has: obj => "conversation" in obj, get: obj => obj.conversation, set: (obj, value) => { obj.conversation = value; } }, metadata: _metadata }, _conversation_initializers, _conversation_extraInitializers);
            __esDecorate(null, null, _conversationId_decorators, { kind: "field", name: "conversationId", static: false, private: false, access: { has: obj => "conversationId" in obj, get: obj => obj.conversationId, set: (obj, value) => { obj.conversationId = value; } }, metadata: _metadata }, _conversationId_initializers, _conversationId_extraInitializers);
            __esDecorate(null, null, _sender_decorators, { kind: "field", name: "sender", static: false, private: false, access: { has: obj => "sender" in obj, get: obj => obj.sender, set: (obj, value) => { obj.sender = value; } }, metadata: _metadata }, _sender_initializers, _sender_extraInitializers);
            __esDecorate(null, null, _senderId_decorators, { kind: "field", name: "senderId", static: false, private: false, access: { has: obj => "senderId" in obj, get: obj => obj.senderId, set: (obj, value) => { obj.senderId = value; } }, metadata: _metadata }, _senderId_initializers, _senderId_extraInitializers);
            __esDecorate(null, null, _receiver_decorators, { kind: "field", name: "receiver", static: false, private: false, access: { has: obj => "receiver" in obj, get: obj => obj.receiver, set: (obj, value) => { obj.receiver = value; } }, metadata: _metadata }, _receiver_initializers, _receiver_extraInitializers);
            __esDecorate(null, null, _receiverId_decorators, { kind: "field", name: "receiverId", static: false, private: false, access: { has: obj => "receiverId" in obj, get: obj => obj.receiverId, set: (obj, value) => { obj.receiverId = value; } }, metadata: _metadata }, _receiverId_initializers, _receiverId_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _attachments_decorators, { kind: "field", name: "attachments", static: false, private: false, access: { has: obj => "attachments" in obj, get: obj => obj.attachments, set: (obj, value) => { obj.attachments = value; } }, metadata: _metadata }, _attachments_initializers, _attachments_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _isRead_decorators, { kind: "field", name: "isRead", static: false, private: false, access: { has: obj => "isRead" in obj, get: obj => obj.isRead, set: (obj, value) => { obj.isRead = value; } }, metadata: _metadata }, _isRead_initializers, _isRead_extraInitializers);
            __esDecorate(null, null, _isDeleted_decorators, { kind: "field", name: "isDeleted", static: false, private: false, access: { has: obj => "isDeleted" in obj, get: obj => obj.isDeleted, set: (obj, value) => { obj.isDeleted = value; } }, metadata: _metadata }, _isDeleted_initializers, _isDeleted_extraInitializers);
            __esDecorate(null, null, _readAt_decorators, { kind: "field", name: "readAt", static: false, private: false, access: { has: obj => "readAt" in obj, get: obj => obj.readAt, set: (obj, value) => { obj.readAt = value; } }, metadata: _metadata }, _readAt_initializers, _readAt_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Message = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        conversation = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _conversation_initializers, void 0));
        conversationId = (__runInitializers(this, _conversation_extraInitializers), __runInitializers(this, _conversationId_initializers, void 0));
        sender = (__runInitializers(this, _conversationId_extraInitializers), __runInitializers(this, _sender_initializers, void 0));
        senderId = (__runInitializers(this, _sender_extraInitializers), __runInitializers(this, _senderId_initializers, void 0));
        receiver = (__runInitializers(this, _senderId_extraInitializers), __runInitializers(this, _receiver_initializers, void 0));
        receiverId = (__runInitializers(this, _receiver_extraInitializers), __runInitializers(this, _receiverId_initializers, void 0));
        content = (__runInitializers(this, _receiverId_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        attachments = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _attachments_initializers, void 0));
        type = (__runInitializers(this, _attachments_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        isRead = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _isRead_initializers, void 0));
        isDeleted = (__runInitializers(this, _isRead_extraInitializers), __runInitializers(this, _isDeleted_initializers, void 0));
        readAt = (__runInitializers(this, _isDeleted_extraInitializers), __runInitializers(this, _readAt_initializers, void 0));
        createdAt = (__runInitializers(this, _readAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor(partial) {
            __runInitializers(this, _updatedAt_extraInitializers);
            Object.assign(this, partial);
        }
    };
    return Message = _classThis;
})();
exports.Message = Message;
