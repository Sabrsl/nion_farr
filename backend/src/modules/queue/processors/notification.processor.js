"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let NotificationQueueProcessor = (() => {
    let _classDecorators = [(0, bull_1.Processor)('notification')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _handleSendNotification_decorators;
    var NotificationQueueProcessor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _handleSendNotification_decorators = [(0, bull_1.Process)('send-notification')];
            __esDecorate(this, null, _handleSendNotification_decorators, { kind: "method", name: "handleSendNotification", static: false, private: false, access: { has: obj => "handleSendNotification" in obj, get: obj => obj.handleSendNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationQueueProcessor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationsService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(NotificationQueueProcessor.name);
        constructor(notificationsService) {
            this.notificationsService = notificationsService;
        }
        async handleSendNotification(job) {
            try {
                this.logger.debug(`Traitement du job de notification #${job.id} - [${job.data.title}]`);
                // Mettre à jour la progression du job
                await job.progress(10);
                const { userId, title, message, type, metadata, sendEmail, sendSms } = job.data;
                // Créer la notification en base de données
                const notification = await this.notificationsService.create(userId, {
                    title,
                    message,
                    type: type, // Conversion de type si nécessaire
                    metadata: metadata || {},
                });
                // Mettre à jour la progression
                await job.progress(50);
                // Si demandé, envoyer également par email et/ou SMS
                if (sendEmail || sendSms) {
                    await this.notificationsService.sendUserNotification(userId, {
                        title,
                        message,
                        type: type,
                        metadata: metadata || {},
                    });
                }
                // Mise à jour finale de la progression
                await job.progress(100);
                this.logger.debug(`Notification envoyée avec succès: ${title} à l'utilisateur ${userId}`);
                return { success: true, notificationId: notification.id, userId };
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'envoi de la notification [Job #${job.id}]:`, error);
                throw error;
            }
        }
    };
    return NotificationQueueProcessor = _classThis;
})();
exports.NotificationQueueProcessor = NotificationQueueProcessor;
