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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const message_entity_1 = require("./message.entity");
let Conversation = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('conversations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _participants_decorators;
    let _participants_initializers = [];
    let _participants_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _isOrderRelated_decorators;
    let _isOrderRelated_initializers = [];
    let _isOrderRelated_extraInitializers = [];
    let _messages_decorators;
    let _messages_initializers = [];
    let _messages_extraInitializers = [];
    let _lastMessage_decorators;
    let _lastMessage_initializers = [];
    let _lastMessage_extraInitializers = [];
    let _lastMessageId_decorators;
    let _lastMessageId_initializers = [];
    let _lastMessageId_extraInitializers = [];
    let _lastMessageAt_decorators;
    let _lastMessageAt_initializers = [];
    let _lastMessageAt_extraInitializers = [];
    let _unreadCount_decorators;
    let _unreadCount_initializers = [];
    let _unreadCount_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Conversation = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _title_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _participants_decorators = [(0, typeorm_1.ManyToMany)(() => user_entity_1.User), (0, typeorm_1.JoinTable)({
                    name: 'conversation_participants',
                    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
                    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
                })];
            _orderId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
            _isOrderRelated_decorators = [(0, typeorm_1.Column)({ default: false })];
            _messages_decorators = [(0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.conversation)];
            _lastMessage_decorators = [(0, typeorm_1.OneToOne)(() => message_entity_1.Message, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'lastMessageId' })];
            _lastMessageId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _lastMessageAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
            _unreadCount_decorators = [(0, typeorm_1.Column)({ type: 'json', default: '{}' })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _participants_decorators, { kind: "field", name: "participants", static: false, private: false, access: { has: obj => "participants" in obj, get: obj => obj.participants, set: (obj, value) => { obj.participants = value; } }, metadata: _metadata }, _participants_initializers, _participants_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _isOrderRelated_decorators, { kind: "field", name: "isOrderRelated", static: false, private: false, access: { has: obj => "isOrderRelated" in obj, get: obj => obj.isOrderRelated, set: (obj, value) => { obj.isOrderRelated = value; } }, metadata: _metadata }, _isOrderRelated_initializers, _isOrderRelated_extraInitializers);
            __esDecorate(null, null, _messages_decorators, { kind: "field", name: "messages", static: false, private: false, access: { has: obj => "messages" in obj, get: obj => obj.messages, set: (obj, value) => { obj.messages = value; } }, metadata: _metadata }, _messages_initializers, _messages_extraInitializers);
            __esDecorate(null, null, _lastMessage_decorators, { kind: "field", name: "lastMessage", static: false, private: false, access: { has: obj => "lastMessage" in obj, get: obj => obj.lastMessage, set: (obj, value) => { obj.lastMessage = value; } }, metadata: _metadata }, _lastMessage_initializers, _lastMessage_extraInitializers);
            __esDecorate(null, null, _lastMessageId_decorators, { kind: "field", name: "lastMessageId", static: false, private: false, access: { has: obj => "lastMessageId" in obj, get: obj => obj.lastMessageId, set: (obj, value) => { obj.lastMessageId = value; } }, metadata: _metadata }, _lastMessageId_initializers, _lastMessageId_extraInitializers);
            __esDecorate(null, null, _lastMessageAt_decorators, { kind: "field", name: "lastMessageAt", static: false, private: false, access: { has: obj => "lastMessageAt" in obj, get: obj => obj.lastMessageAt, set: (obj, value) => { obj.lastMessageAt = value; } }, metadata: _metadata }, _lastMessageAt_initializers, _lastMessageAt_extraInitializers);
            __esDecorate(null, null, _unreadCount_decorators, { kind: "field", name: "unreadCount", static: false, private: false, access: { has: obj => "unreadCount" in obj, get: obj => obj.unreadCount, set: (obj, value) => { obj.unreadCount = value; } }, metadata: _metadata }, _unreadCount_initializers, _unreadCount_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Conversation = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        title = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        participants = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _participants_initializers, void 0));
        orderId = (__runInitializers(this, _participants_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
        isActive = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        isOrderRelated = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _isOrderRelated_initializers, void 0));
        messages = (__runInitializers(this, _isOrderRelated_extraInitializers), __runInitializers(this, _messages_initializers, void 0));
        lastMessage = (__runInitializers(this, _messages_extraInitializers), __runInitializers(this, _lastMessage_initializers, void 0));
        lastMessageId = (__runInitializers(this, _lastMessage_extraInitializers), __runInitializers(this, _lastMessageId_initializers, void 0));
        lastMessageAt = (__runInitializers(this, _lastMessageId_extraInitializers), __runInitializers(this, _lastMessageAt_initializers, void 0));
        unreadCount = (__runInitializers(this, _lastMessageAt_extraInitializers), __runInitializers(this, _unreadCount_initializers, void 0));
        createdAt = (__runInitializers(this, _unreadCount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        constructor(partial) {
            __runInitializers(this, _updatedAt_extraInitializers);
            Object.assign(this, partial);
        }
    };
    return Conversation = _classThis;
})();
exports.Conversation = Conversation;
