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
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const dispute_schema_1 = require("./schemas/dispute.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let DisputesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DisputesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DisputesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        disputeModel;
        usersService;
        notificationsService;
        constructor(disputeModel, 
        // private readonly ordersService: OrdersService, // Commenté temporairement
        usersService, notificationsService) {
            this.disputeModel = disputeModel;
            this.usersService = usersService;
            this.notificationsService = notificationsService;
        }
        async create(createDisputeDto, userId) {
            // Vérifier que la commande existe
            // const order = await this.ordersService.findOne(createDisputeDto.orderId);
            // if (!order) {
            //   throw new NotFoundException('Commande non trouvée');
            // }
            // Vérifier que l'utilisateur est associé à la commande
            // if (order.client?.toString() !== userId && order.provider?.toString() !== userId) {
            //   throw new ForbiddenException('Vous n\'êtes pas autorisé à ouvrir un litige pour cette commande');
            // }
            // Vérifier qu'il n'y a pas déjà un litige en cours pour cette commande
            const existingDispute = await this.disputeModel.findOne({ order: new mongoose_1.Types.ObjectId(createDisputeDto.orderId) });
            if (existingDispute) {
                throw new common_1.BadRequestException('Un litige existe déjà pour cette commande');
            }
            // Créer le litige
            const newDispute = new this.disputeModel({
                order: new mongoose_1.Types.ObjectId(createDisputeDto.orderId),
                openedBy: new mongoose_1.Types.ObjectId(userId),
                reason: createDisputeDto.reason,
                description: createDisputeDto.description,
                evidence: createDisputeDto.evidence || [],
                status: dispute_schema_1.DisputeStatus.PENDING,
                timeline: [
                    {
                        status: dispute_schema_1.DisputeStatus.PENDING,
                        date: new Date(),
                        comments: 'Litige ouvert',
                        actor: new mongoose_1.Types.ObjectId(userId)
                    }
                ],
                messages: [
                    {
                        sender: new mongoose_1.Types.ObjectId(userId),
                        content: createDisputeDto.description,
                        createdAt: new Date(),
                        isAdmin: false,
                        attachments: createDisputeDto.evidence || []
                    }
                ]
            });
            // Mettre à jour le statut de la commande
            // await this.ordersService.updateOrderStatus(createDisputeDto.orderId, 'LITIGE');
            // Notifier les parties concernées
            // this.notifyDisputeCreated(newDispute, order);
            return newDispute.save();
        }
        async findAll(userId, role) {
            let query = {};
            // Si l'utilisateur n'est pas admin, filtrer les litiges par utilisateur
            if (role !== 'admin' && userId) {
                query = {
                    $or: [
                        { 'order.client': new mongoose_1.Types.ObjectId(userId) },
                        { 'order.provider': new mongoose_1.Types.ObjectId(userId) }
                    ]
                };
            }
            return this.disputeModel.find(query)
                .populate('order')
                .populate('openedBy', '-password')
                .populate({
                path: 'timeline.actor',
                select: 'firstName lastName username avatar'
            })
                .populate({
                path: 'messages.sender',
                select: 'firstName lastName username avatar'
            })
                .sort({ createdAt: -1 })
                .exec();
        }
        async findOne(id) {
            const dispute = await this.disputeModel.findById(id)
                .populate('order')
                .populate('openedBy', '-password')
                .populate('resolvedBy', '-password')
                .populate({
                path: 'timeline.actor',
                select: 'firstName lastName username avatar'
            })
                .populate({
                path: 'messages.sender',
                select: 'firstName lastName username avatar'
            })
                .exec();
            if (!dispute) {
                throw new common_1.NotFoundException(`Litige #${id} non trouvé`);
            }
            return dispute;
        }
        async findByOrder(orderId) {
            const dispute = await this.disputeModel.findOne({ order: new mongoose_1.Types.ObjectId(orderId) })
                .populate('order')
                .populate('openedBy', '-password')
                .populate({
                path: 'timeline.actor',
                select: 'firstName lastName username avatar'
            })
                .populate({
                path: 'messages.sender',
                select: 'firstName lastName username avatar'
            })
                .exec();
            if (!dispute) {
                throw new common_1.NotFoundException(`Aucun litige trouvé pour la commande #${orderId}`);
            }
            return dispute;
        }
        async update(id, updateDisputeDto, userId, isAdmin) {
            const dispute = await this.findOne(id);
            // Vérifier les permissions
            if (!isAdmin && dispute.openedBy.toString() !== userId) {
                throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à modifier ce litige');
            }
            // Mettre à jour le statut si spécifié
            if (updateDisputeDto.status) {
                dispute.status = updateDisputeDto.status;
                // Ajouter à la timeline
                dispute.timeline.push({
                    status: updateDisputeDto.status,
                    date: new Date(),
                    comments: updateDisputeDto.comments || `Statut du litige mis à jour à ${updateDisputeDto.status}`,
                    actor: new mongoose_1.Types.ObjectId(userId)
                });
                // Si le litige est résolu, mettre à jour les informations de résolution
                if ([
                    dispute_schema_1.DisputeStatus.RESOLVED_CLIENT,
                    dispute_schema_1.DisputeStatus.RESOLVED_PROVIDER,
                    dispute_schema_1.DisputeStatus.RESOLVED_PARTIAL
                ].includes(updateDisputeDto.status)) {
                    dispute.resolvedBy = new mongoose_1.Types.ObjectId(userId);
                    dispute.resolvedAt = new Date();
                    dispute.resolution = updateDisputeDto.resolution;
                    dispute.refundAmount = updateDisputeDto.refundAmount;
                    // Mettre à jour le statut de la commande en fonction de la résolution
                    if (updateDisputeDto.status === dispute_schema_1.DisputeStatus.RESOLVED_CLIENT) {
                        // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'ANNULE');
                    }
                    else if (updateDisputeDto.status === dispute_schema_1.DisputeStatus.RESOLVED_PROVIDER ||
                        updateDisputeDto.status === dispute_schema_1.DisputeStatus.RESOLVED_PARTIAL) {
                        // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'EN_COURS');
                    }
                }
            }
            // Notifier les parties concernées
            // this.notifyDisputeUpdated(dispute);
            return dispute.save();
        }
        async addMessage(disputeId, addDisputeMessageDto, userId) {
            const dispute = await this.findOne(disputeId);
            if (!dispute) {
                throw new common_1.NotFoundException('Litige non trouvé');
            }
            // Récupérer l'utilisateur
            const user = await this.usersService.findOne(userId);
            if (!user) {
                throw new common_1.NotFoundException('Utilisateur non trouvé');
            }
            /*
            // Commenté temporairement pour éviter les erreurs de type
            // Vérifier les permissions
            // const order = await this.ordersService.findOne(dispute.order.toString());
            const isAdmin = user.role === 'admin';
            
            const isInvolved = dispute.order.client?.toString() === userId || dispute.order.provider?.toString() === userId;
            
            if (!isAdmin && !isInvolved) {
              throw new ForbiddenException('Vous n\'êtes pas autorisé à ajouter un message à ce litige');
            }
            
            // Ajouter le message
            const newMessage = {
              sender: user.id,
              content: addDisputeMessageDto.content,
              createdAt: new Date(),
              isAdmin: isAdmin,
              attachments: addDisputeMessageDto.attachments || []
            };
            
            dispute.messages.push(newMessage);
            
            // Notifier les parties concernées
            // this.notifyNewDisputeMessage(dispute, newMessage, order);
            */
            // Version simplifiée pour le seed
            console.log('Ajout de message au litige simulé');
            return dispute.save();
        }
        async remove(id, isAdmin) {
            // Seul un admin peut supprimer un litige
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Seul un administrateur peut supprimer un litige');
            }
            const dispute = await this.findOne(id);
            await this.disputeModel.findByIdAndDelete(id);
            // Mettre à jour le statut de la commande
            // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'EN_COURS');
        }
        // Méthodes pour notifier les utilisateurs
        async notifyDisputeCreated(dispute, order) {
            try {
                // Notifier l'admin
                this.notificationsService.sendAdminNotification({
                    title: 'Nouveau litige',
                    message: `Un nouveau litige a été ouvert pour la commande #${order.orderNumber}`,
                    type: notification_schema_1.NotificationType.DISPUTE_CREATED,
                    metadata: {
                        disputeId: dispute._id.toString(),
                        orderId: order._id?.toString() || order.id
                    }
                });
                // Notifier l'autre partie impliquée dans la commande
                const recipientId = dispute.openedBy.toString() === order.client?.toString()
                    ? order.provider?.toString()
                    : order.client?.toString();
                if (recipientId) {
                    this.notificationsService.sendUserNotification(recipientId, {
                        title: 'Nouveau litige',
                        message: `Un litige a été ouvert pour votre commande #${order.orderNumber}`,
                        type: notification_schema_1.NotificationType.DISPUTE_CREATED,
                        metadata: {
                            disputeId: dispute._id.toString(),
                            orderId: order._id?.toString() || order.id
                        }
                    });
                }
            }
            catch (error) {
                console.error('Erreur lors de l\'envoi des notifications de litige:', error);
            }
        }
        async notifyDisputeUpdated(dispute) {
            try {
                /*
                // Fonction temporairement commentée
                // const order = await this.ordersService.findOne(dispute.order.toString());
                
                // Notifier les deux parties
                const statusText = this.getDisputeStatusText(dispute.status);
                
                // Notifier le client
                if (dispute.order.client) {
                  this.notificationsService.sendUserNotification(dispute.order.client.toString(), {
                    title: 'Mise à jour de litige',
                    message: `Le statut du litige pour la commande #${dispute.order.orderNumber || dispute.order.id} a été mis à jour: ${statusText}`,
                    type: NotificationType.DISPUTE_UPDATED,
                    metadata: {
                      disputeId: dispute._id.toString(),
                      orderId: dispute.order._id?.toString() || dispute.order.id,
                      status: dispute.status
                    }
                  });
                }
                
                // Notifier le prestataire
                if (dispute.order.provider) {
                  this.notificationsService.sendUserNotification(dispute.order.provider.toString(), {
                    title: 'Mise à jour de litige',
                    message: `Le statut du litige pour la commande #${dispute.order.orderNumber || dispute.order.id} a été mis à jour: ${statusText}`,
                    type: NotificationType.DISPUTE_UPDATED,
                    metadata: {
                      disputeId: dispute._id.toString(),
                      orderId: dispute.order._id?.toString() || dispute.order.id,
                      status: dispute.status
                    }
                  });
                }
                */
            }
            catch (error) {
                console.error('Erreur lors de l\'envoi des notifications:', error);
            }
        }
        async notifyNewDisputeMessage(dispute, message, order) {
            try {
                // Déterminer le destinataire (l'autre partie)
                const sender = message.sender.toString();
                const recipientId = sender === order.client?.toString()
                    ? order.provider?.toString()
                    : sender === order.provider?.toString()
                        ? order.client?.toString()
                        : null;
                // Si le message est de l'admin, notifier les deux parties
                if (message.isAdmin) {
                    if (order.client) {
                        this.notificationsService.sendUserNotification(order.client.toString(), {
                            title: 'Nouveau message de l\'administrateur',
                            message: `L'administrateur a répondu à votre litige pour la commande #${order.orderNumber || order.id}`,
                            type: notification_schema_1.NotificationType.DISPUTE_MESSAGE,
                            metadata: {
                                disputeId: dispute._id.toString(),
                                orderId: order._id?.toString() || order.id
                            }
                        });
                    }
                    if (order.provider) {
                        this.notificationsService.sendUserNotification(order.provider.toString(), {
                            title: 'Nouveau message de l\'administrateur',
                            message: `L'administrateur a répondu au litige pour la commande #${order.orderNumber || order.id}`,
                            type: notification_schema_1.NotificationType.DISPUTE_MESSAGE,
                            metadata: {
                                disputeId: dispute._id.toString(),
                                orderId: order._id?.toString() || order.id
                            }
                        });
                    }
                }
                // Sinon, notifier uniquement le destinataire et l'admin
                else if (recipientId) {
                    const sender = await this.usersService.findOne(message.sender.toString());
                    this.notificationsService.sendUserNotification(recipientId, {
                        title: 'Nouveau message dans le litige',
                        message: `${sender.firstName} a envoyé un message dans le litige pour la commande #${order.orderNumber || order.id}`,
                        type: notification_schema_1.NotificationType.DISPUTE_MESSAGE,
                        metadata: {
                            disputeId: dispute._id.toString(),
                            orderId: order._id?.toString() || order.id
                        }
                    });
                    // Notifier également l'admin
                    this.notificationsService.sendAdminNotification({
                        title: 'Nouveau message dans un litige',
                        message: `${sender.firstName} a envoyé un message dans le litige pour la commande #${order.orderNumber || order.id}`,
                        type: notification_schema_1.NotificationType.DISPUTE_MESSAGE,
                        metadata: {
                            disputeId: dispute._id.toString(),
                            orderId: order._id?.toString() || order.id
                        }
                    });
                }
            }
            catch (error) {
                console.error('Erreur lors de l\'envoi des notifications de nouveau message:', error);
            }
        }
        getDisputeStatusText(status) {
            const statusMap = {
                [dispute_schema_1.DisputeStatus.PENDING]: 'En attente',
                [dispute_schema_1.DisputeStatus.UNDER_REVIEW]: 'En cours d\'examen',
                [dispute_schema_1.DisputeStatus.RESOLVED_CLIENT]: 'Résolu en faveur du client',
                [dispute_schema_1.DisputeStatus.RESOLVED_PROVIDER]: 'Résolu en faveur du prestataire',
                [dispute_schema_1.DisputeStatus.RESOLVED_PARTIAL]: 'Résolu partiellement',
                [dispute_schema_1.DisputeStatus.REJECTED]: 'Rejeté'
            };
            return statusMap[status] || status;
        }
        // Ajout de la méthode getOrder
        async getOrder(orderId) {
            // return this.ordersService.findOne(orderId);
            return null; // Retourner null temporairement
        }
    };
    return DisputesService = _classThis;
})();
exports.DisputesService = DisputesService;
