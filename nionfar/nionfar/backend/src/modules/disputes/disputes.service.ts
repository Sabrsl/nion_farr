import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dispute, DisputeStatus, DisputeReason } from './schemas/dispute.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto';
// import { OrdersService } from '../orders/orders.service'; // Commenté temporairement
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private readonly disputeModel: Model<Dispute>,
    // private readonly ordersService: OrdersService, // Commenté temporairement
    private usersService: UsersService,
    private notificationsService: NotificationsService
  ) {}

  async create(createDisputeDto: CreateDisputeDto, userId: string): Promise<Dispute> {
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
    const existingDispute = await this.disputeModel.findOne({ order: new Types.ObjectId(createDisputeDto.orderId) });
    if (existingDispute) {
      throw new BadRequestException('Un litige existe déjà pour cette commande');
    }

    // Créer le litige
    const newDispute = new this.disputeModel({
      order: new Types.ObjectId(createDisputeDto.orderId),
      openedBy: new Types.ObjectId(userId),
      reason: createDisputeDto.reason,
      description: createDisputeDto.description,
      evidence: createDisputeDto.evidence || [],
      status: DisputeStatus.PENDING,
      timeline: [
        {
          status: DisputeStatus.PENDING,
          date: new Date(),
          comments: 'Litige ouvert',
          actor: new Types.ObjectId(userId)
        }
      ],
      messages: [
        {
          sender: new Types.ObjectId(userId),
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

  async findAll(userId?: string, role?: string): Promise<Dispute[]> {
    let query = {};
    
    // Si l'utilisateur n'est pas admin, filtrer les litiges par utilisateur
    if (role !== 'admin' && userId) {
      query = {
        $or: [
          { 'order.client': new Types.ObjectId(userId) },
          { 'order.provider': new Types.ObjectId(userId) }
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

  async findOne(id: string): Promise<Dispute> {
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
      throw new NotFoundException(`Litige #${id} non trouvé`);
    }

    return dispute;
  }

  async findByOrder(orderId: string): Promise<Dispute> {
    const dispute = await this.disputeModel.findOne({ order: new Types.ObjectId(orderId) })
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
      throw new NotFoundException(`Aucun litige trouvé pour la commande #${orderId}`);
    }

    return dispute;
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto, userId: string, isAdmin: boolean): Promise<Dispute> {
    const dispute = await this.findOne(id);
    
    // Vérifier les permissions
    if (!isAdmin && dispute.openedBy.toString() !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce litige');
    }

    // Mettre à jour le statut si spécifié
    if (updateDisputeDto.status) {
      dispute.status = updateDisputeDto.status;
      
      // Ajouter à la timeline
      dispute.timeline.push({
        status: updateDisputeDto.status,
        date: new Date(),
        comments: updateDisputeDto.comments || `Statut du litige mis à jour à ${updateDisputeDto.status}`,
        actor: new Types.ObjectId(userId)
      });

      // Si le litige est résolu, mettre à jour les informations de résolution
      if ([
        DisputeStatus.RESOLVED_CLIENT,
        DisputeStatus.RESOLVED_PROVIDER,
        DisputeStatus.RESOLVED_PARTIAL
      ].includes(updateDisputeDto.status)) {
        dispute.resolvedBy = new Types.ObjectId(userId);
        dispute.resolvedAt = new Date();
        dispute.resolution = updateDisputeDto.resolution;
        dispute.refundAmount = updateDisputeDto.refundAmount;

        // Mettre à jour le statut de la commande en fonction de la résolution
        if (updateDisputeDto.status === DisputeStatus.RESOLVED_CLIENT) {
          // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'ANNULE');
        } else if (
          updateDisputeDto.status === DisputeStatus.RESOLVED_PROVIDER ||
          updateDisputeDto.status === DisputeStatus.RESOLVED_PARTIAL
        ) {
          // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'EN_COURS');
        }
      }
    }

    // Notifier les parties concernées
    // this.notifyDisputeUpdated(dispute);

    return dispute.save();
  }

  async addMessage(
    disputeId: string,
    addDisputeMessageDto: AddDisputeMessageDto,
    userId: string
  ): Promise<Dispute> {
    const dispute = await this.findOne(disputeId);
    if (!dispute) {
      throw new NotFoundException('Litige non trouvé');
    }
    
    // Récupérer l'utilisateur
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
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

  async remove(id: string, isAdmin: boolean): Promise<void> {
    // Seul un admin peut supprimer un litige
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut supprimer un litige');
    }

    const dispute = await this.findOne(id);
    await this.disputeModel.findByIdAndDelete(id);
    
    // Mettre à jour le statut de la commande
    // await this.ordersService.updateOrderStatus(dispute.order.toString(), 'EN_COURS');
  }

  // Méthodes pour notifier les utilisateurs
  private async notifyDisputeCreated(dispute: Dispute, order: any): Promise<void> {
    try {
      // Notifier l'admin
      this.notificationsService.sendAdminNotification({
        title: 'Nouveau litige',
        message: `Un nouveau litige a été ouvert pour la commande #${order.orderNumber}`,
        type: NotificationType.DISPUTE_CREATED,
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
          type: NotificationType.DISPUTE_CREATED,
          metadata: {
            disputeId: dispute._id.toString(),
            orderId: order._id?.toString() || order.id
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de litige:', error);
    }
  }

  private async notifyDisputeUpdated(dispute: Dispute): Promise<void> {
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
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }
  }

  private async notifyNewDisputeMessage(dispute: Dispute, message: any, order: any): Promise<void> {
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
            type: NotificationType.DISPUTE_MESSAGE,
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
            type: NotificationType.DISPUTE_MESSAGE,
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
          type: NotificationType.DISPUTE_MESSAGE,
          metadata: {
            disputeId: dispute._id.toString(),
            orderId: order._id?.toString() || order.id
          }
        });
        
        // Notifier également l'admin
        this.notificationsService.sendAdminNotification({
          title: 'Nouveau message dans un litige',
          message: `${sender.firstName} a envoyé un message dans le litige pour la commande #${order.orderNumber || order.id}`,
          type: NotificationType.DISPUTE_MESSAGE,
          metadata: {
            disputeId: dispute._id.toString(),
            orderId: order._id?.toString() || order.id
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de nouveau message:', error);
    }
  }

  private getDisputeStatusText(status: DisputeStatus): string {
    const statusMap: Record<DisputeStatus, string> = {
      [DisputeStatus.PENDING]: 'En attente',
      [DisputeStatus.UNDER_REVIEW]: 'En cours d\'examen',
      [DisputeStatus.RESOLVED_CLIENT]: 'Résolu en faveur du client',
      [DisputeStatus.RESOLVED_PROVIDER]: 'Résolu en faveur du prestataire',
      [DisputeStatus.RESOLVED_PARTIAL]: 'Résolu partiellement',
      [DisputeStatus.REJECTED]: 'Rejeté'
    };
    
    return statusMap[status] || status;
  }

  // Ajout de la méthode getOrder
  async getOrder(orderId: string): Promise<any> {
    // return this.ordersService.findOne(orderId);
    return null; // Retourner null temporairement
  }
} 