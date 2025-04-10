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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const user_role_enum_1 = require("../users/enums/user-role.enum");
let NotificationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationModel;
        usersService;
        emailService;
        smsService;
        logger = new common_1.Logger(NotificationsService.name);
        constructor(notificationModel, usersService, emailService, smsService) {
            this.notificationModel = notificationModel;
            this.usersService = usersService;
            this.emailService = emailService;
            this.smsService = smsService;
        }
        /**
         * Créer une notification pour un utilisateur
         */
        async create(userId, payload) {
            this.logger.debug(`Création d'une notification pour l'utilisateur ${userId}: ${payload.title}`);
            const newNotification = new this.notificationModel({
                user: new mongoose_1.Types.ObjectId(userId),
                title: payload.title,
                message: payload.message,
                type: payload.type,
                metadata: payload.metadata || {},
                isRead: false,
                isActive: true,
            });
            const savedNotification = await newNotification.save();
            this.logger.debug(`Notification créée avec succès: ${savedNotification.id}`);
            return savedNotification;
        }
        /**
         * Récupérer toutes les notifications d'un utilisateur
         */
        async findAllForUser(userId, isRead) {
            const query = { user: new mongoose_1.Types.ObjectId(userId), isActive: true };
            if (isRead !== undefined) {
                query.isRead = isRead;
            }
            this.logger.debug(`Récupération des notifications pour l'utilisateur ${userId} - Filtre isRead: ${isRead}`);
            return this.notificationModel.find(query)
                .sort({ createdAt: -1 })
                .exec();
        }
        /**
         * Marquer une notification comme lue
         */
        async markAsRead(notificationId, userId) {
            this.logger.debug(`Marquage de la notification ${notificationId} comme lue pour l'utilisateur ${userId}`);
            const notification = await this.notificationModel.findOne({
                _id: notificationId,
                user: new mongoose_1.Types.ObjectId(userId)
            });
            if (!notification) {
                this.logger.warn(`Notification ${notificationId} non trouvée pour l'utilisateur ${userId}`);
                throw new Error('Notification non trouvée');
            }
            notification.isRead = true;
            return notification.save();
        }
        /**
         * Marquer toutes les notifications d'un utilisateur comme lues
         */
        async markAllAsRead(userId) {
            this.logger.debug(`Marquage de toutes les notifications comme lues pour l'utilisateur ${userId}`);
            await this.notificationModel.updateMany({ user: new mongoose_1.Types.ObjectId(userId), isRead: false }, { $set: { isRead: true } });
        }
        /**
         * Supprimer une notification (soft delete)
         */
        async remove(notificationId, userId) {
            this.logger.debug(`Suppression de la notification ${notificationId} pour l'utilisateur ${userId}`);
            await this.notificationModel.updateOne({ _id: notificationId, user: new mongoose_1.Types.ObjectId(userId) }, { $set: { isActive: false } });
        }
        /**
         * Nombre de notifications non lues d'un utilisateur
         */
        async countUnread(userId) {
            this.logger.debug(`Comptage des notifications non lues pour l'utilisateur ${userId}`);
            return this.notificationModel.countDocuments({
                user: new mongoose_1.Types.ObjectId(userId),
                isRead: false,
                isActive: true
            });
        }
        /**
         * Envoyer une notification à un utilisateur (avec email/SMS si configuré)
         */
        async sendUserNotification(userId, payload) {
            try {
                this.logger.debug(`Envoi de notification à l'utilisateur ${userId}: ${payload.title}`);
                // Créer la notification dans la base de données
                const notification = await this.create(userId, payload);
                // Récupérer les préférences de notification de l'utilisateur
                const user = await this.usersService.findOne(userId);
                // Envoyer un email si l'utilisateur a activé les notifications par email
                if (user.notificationPreferences?.email) {
                    // Déterminer le template en fonction du type de notification
                    const emailTemplateMap = {
                        [notification_schema_1.NotificationType.ORDER_CREATED]: 'order-created',
                        [notification_schema_1.NotificationType.ORDER_ACCEPTED]: 'order-accepted',
                        [notification_schema_1.NotificationType.ORDER_REJECTED]: 'order-rejected',
                        [notification_schema_1.NotificationType.ORDER_DELIVERED]: 'order-delivered',
                        [notification_schema_1.NotificationType.DISPUTE_CREATED]: 'dispute-created',
                        [notification_schema_1.NotificationType.DISPUTE_UPDATED]: 'dispute-updated',
                        [notification_schema_1.NotificationType.NEW_MESSAGE]: 'new-message',
                        // ... autres types
                    };
                    const template = emailTemplateMap[payload.type] || 'notification';
                    try {
                        // Envoyer l'email directement
                        await this.emailService.sendEmail({
                            to: user.email,
                            subject: payload.title,
                            template,
                            context: {
                                firstName: user.firstName,
                                message: payload.message,
                                ...payload.metadata
                            }
                        });
                        this.logger.debug(`Email de notification envoyé à ${user.email}`);
                    }
                    catch (emailError) {
                        this.logger.error(`Erreur lors de l'envoi de l'email de notification:`, emailError);
                        // Ne pas échouer complètement si l'envoi d'email échoue
                    }
                }
                // Envoyer un SMS si l'utilisateur a activé les notifications par SMS
                if (user.notificationPreferences?.sms && user.phone) {
                    try {
                        await this.smsService.sendSms({
                            to: user.phone,
                            message: `${payload.title} - ${payload.message}`
                        });
                        this.logger.debug(`SMS de notification envoyé à ${user.phone}`);
                    }
                    catch (smsError) {
                        this.logger.error(`Erreur lors de l'envoi du SMS de notification:`, smsError);
                        // Ne pas échouer complètement si l'envoi de SMS échoue
                    }
                }
                return notification;
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'envoi de la notification:`, error);
                throw error;
            }
        }
        /**
         * Envoyer une notification à tous les administrateurs
         */
        async sendAdminNotification(payload) {
            try {
                this.logger.debug(`Envoi de notification à tous les administrateurs: ${payload.title}`);
                // Récupérer tous les administrateurs
                const admins = await this.usersService.findByRole(user_role_enum_1.UserRole.ADMIN);
                // Envoyer une notification à chaque admin
                for (const admin of admins) {
                    try {
                        await this.sendUserNotification(admin.id, payload);
                    }
                    catch (error) {
                        this.logger.error(`Erreur lors de l'envoi de la notification à l'admin ${admin.id}:`, error);
                        // Continuer avec les autres admins même si un envoi échoue
                    }
                }
                this.logger.debug(`Notifications envoyées à ${admins.length} administrateurs`);
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'envoi de la notification aux administrateurs:`, error);
                throw error;
            }
        }
    };
    return NotificationsService = _classThis;
})();
exports.NotificationsService = NotificationsService;
