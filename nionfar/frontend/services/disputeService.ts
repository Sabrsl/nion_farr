import { toast } from 'react-toastify';
import { Dispute, Order, User, OrderStatus, ResolutionType } from '../types';
import orderService from './orderService';
import securityService from './securityService';
import disputeLogService from './disputeLogService';
import disputePermissionService, { DisputeAction } from './disputePermissionService';

class DisputeService {
  private apiUrl = '/api/disputes'; // Fictif pour le moment
  private orderService;

  constructor() {
    this.orderService = orderService;
  }

  /**
   * Ouvre un litige sur une commande
   * @param orderId ID de la commande concernée
   * @param userId ID de l'utilisateur qui ouvre le litige
   * @param reason Raison du litige
   * @param details Détails supplémentaires
   */
  async onDisputeOpened(
    orderId: string,
    userId: string,
    reason: string,
    details: string,
    attachments?: File[]
  ): Promise<{
    success: boolean;
    message?: string;
    dispute?: Dispute;
  }> {
    try {
      // Récupérer l'utilisateur complet
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      // Vérifier les permissions
      if (!disputePermissionService.canPerformAction(DisputeAction.OPEN, user, undefined, orderId)) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à ouvrir un litige' };
      }

      // Vérification des paramètres
      if (!orderId || !userId || !reason) {
        return { success: false, message: 'Paramètres manquants' };
      }

      // Vérifier qu'il y a soit une description détaillée, soit des pièces jointes
      if ((!details || details.trim().length < 20) && (!attachments || attachments.length === 0)) {
        return {
          success: false,
          message: 'Veuillez fournir soit une description détaillée, soit des pièces jointes justificatives'
        };
      }

      // Trouver la commande
      const order = await this.orderService.getOrderById(orderId);
      
      if (!order) {
        return { success: false, message: 'Commande non trouvée' };
      }
      
      // Vérifier que l'utilisateur est impliqué dans la commande
      if (order.client.id !== userId && order.service.provider.id !== userId) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à ouvrir un litige pour cette commande' };
      }

      // Uploader les pièces jointes si présentes
      let attachmentUrls: string[] = [];
      if (attachments && attachments.length > 0) {
        attachmentUrls = await this.uploadAttachments(attachments, orderId);
        
        // Journalisation des pièces jointes
        for (const url of attachmentUrls) {
          await disputeLogService.createLogEntry(
            `${orderId}-temp`, // ID temporaire, sera mis à jour après création du litige
            userId,
            order.client.id === userId ? 'client' : 'vendeur',
            'pièce_jointe',
            `Pièce jointe ajoutée: ${url.split('/').pop()}`,
            { attachmentUrl: url }
          );
        }
      }

      // Créer le litige
      const dispute: Dispute = {
        id: `DSP-${Date.now()}`,
        orderId,
        initiatedBy: userId,
        reason,
        details,
        attachments: attachmentUrls,
        status: 'ouvert',
        createdAt: new Date().toISOString(),
        updates: [
          {
            userId,
            message: 'Litige ouvert',
            createdAt: new Date().toISOString(),
            type: 'status_change'
          }
        ],
        logs: [] // Initialiser les logs
      };
      
      // 10. Mettre à jour le statut de la commande
      await this.updateOrderStatus(orderId, 'litige');
      
      // 11. Enregistrer le litige
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify(dispute)
      });
      
      const createdDispute = await response.json();
      
      // 12. Journaliser la création du litige
      const userType = order.client.id === userId ? 'client' : 'vendeur';
      const logEntry = await disputeLogService.createLogEntry(
        createdDispute.id,
        userId,
        userType,
        'création',
        `Litige ouvert par ${userType} pour la commande ${orderId}`,
        { reason, detailsLength: details.length, attachmentsCount: attachmentUrls.length }
      );
      
      // 13. Mettre à jour les IDs des logs de pièces jointes
      if (attachments && attachments.length > 0) {
        const tempId = `${orderId}-temp`;
        // Cette opération serait normalement gérée côté backend
        console.log(`Les logs temporaires avec l'ID ${tempId} devraient être mis à jour avec l'ID ${createdDispute.id}`);
      }
      
      // 14. Générer un résumé initial
      createdDispute.summary = await disputeLogService.generateDisputeSummary(createdDispute, order);
      
      // 15. Notifier les parties impliquées
      await this.notifyParties(order, userId, 'litige_ouvert');
      
      // 16. Journaliser les notifications
      await disputeLogService.createLogEntry(
        createdDispute.id,
        'system',
        'system',
        'notification_envoyée',
        `Notifications envoyées aux parties concernées`,
        { recipientIds: [order.client.id, order.service.provider.id].filter(id => id !== userId) }
      );
      
      return {
        success: true,
        dispute: createdDispute
      };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'ouverture du litige'
      };
    }
  }
  
  /**
   * Résout un litige
   * @param disputeId ID du litige
   * @param adminId ID de l'administrateur qui résout le litige
   * @param resolution Type de résolution
   * @param comment Commentaire sur la résolution
   */
  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolution: ResolutionType,
    comment: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (!dispute) {
        return {
          success: false,
          message: 'Litige introuvable'
        };
      }
      
      // 2. Récupérer l'utilisateur complet
      const admin = await this.getUserById(adminId);
      if (!admin) {
        return { success: false, message: 'Administrateur non trouvé' };
      }
      
      // 3. Vérifier les permissions
      if (!disputePermissionService.canPerformAction(DisputeAction.DECIDE, admin, dispute)) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à résoudre ce litige' };
      }
      
      // 4. Vérifier que le litige est toujours ouvert ou en traitement
      if (dispute.status !== 'ouvert' && dispute.status !== 'en_traitement' && dispute.status !== 'en_attente_de_reponse') {
        return {
          success: false,
          message: `Ce litige ne peut pas être résolu dans son statut actuel`
        };
      }
      
      // 5. Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 6. Déterminer le bénéficiaire de la résolution
      let statusFinal = '';
      if (resolution === 'remboursement_total' || resolution === 'remboursement_partiel') {
        statusFinal = 'résolu_en_faveur_client';
      } else if (resolution === 'refus_du_litige') {
        statusFinal = 'résolu_en_faveur_vendeur';
      } else if (resolution === 'livraison_corrigée' || resolution === 'prolongation_délai' || resolution === 'arrangement_amiable') {
        statusFinal = 'résolu_en_faveur_client';
      }
      
      // 7. Mettre à jour le statut du litige
      const updatedDispute = {
        ...dispute,
        status: statusFinal,
        resolvedBy: adminId,
        resolvedAt: new Date().toISOString(),
        resolution,
        resolutionReason: comment,
        updates: [
          ...dispute.updates,
          {
            userId: adminId,
            message: `Litige résolu avec la décision: ${this.getResolutionLabel(resolution)}. Commentaire: ${comment}`,
            createdAt: new Date().toISOString(),
            type: 'resolution'
          }
        ]
      };
      
      // 8. Enregistrer les modifications du litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // 9. Mettre à jour le statut de la commande selon la résolution
      let newOrderStatus: OrderStatus; 
      switch(resolution) {
        case 'remboursement_total':
          newOrderStatus = 'annulée';
          break;
        case 'remboursement_partiel':
          newOrderStatus = 'terminée_manuellement';
          break;
        case 'livraison_corrigée':
          newOrderStatus = 'en_cours';
          break;
        case 'prolongation_délai':
          newOrderStatus = 'en_cours';
          break;
        case 'refus_du_litige':
          newOrderStatus = 'terminée';
          break;
        case 'arrangement_amiable':
          newOrderStatus = 'terminée_manuellement';
          break;
        default:
          newOrderStatus = 'terminée_manuellement';
      }
      
      await this.updateOrderStatus(dispute.orderId, newOrderStatus);
      
      // 10. Gérer le transfert ou le remboursement des fonds
      if (resolution === 'refus_du_litige') {
        // Transférer les fonds au vendeur
        await this.transferFundsToSeller(order);
        
        // Notifier le vendeur
        await this.notifyUser(
          order.service.provider.id,
          'Litige résolu en votre faveur',
          `Le litige concernant la commande "${order.title}" a été résolu en votre faveur. Les fonds ont été transférés sur votre compte.`
        );
        
        // Notifier le client
        await this.notifyUser(
          order.client.id,
          'Litige résolu',
          `Le litige concernant la commande "${order.title}" a été résolu en faveur du vendeur. ${comment}`
        );
      } else if (resolution === 'remboursement_total') {
        // Rembourser le client
        await this.refundClient(order, 100);
        
        // Notifier le client
        await this.notifyUser(
          order.client.id,
          'Litige résolu en votre faveur',
          `Le litige concernant la commande "${order.title}" a été résolu en votre faveur. Un remboursement total a été effectué.`
        );
        
        // Notifier le vendeur
        await this.notifyUser(
          order.service.provider.id,
          'Litige résolu',
          `Le litige concernant la commande "${order.title}" a été résolu en faveur du client avec un remboursement total. ${comment}`
        );
      } else if (resolution === 'remboursement_partiel') {
        // Déterminer le pourcentage de remboursement (exemple: 50%)
        const remboursementPourcentage = this.determinerPourcentageRemboursement(comment);
        
        // Rembourser le client
        await this.refundClient(order, remboursementPourcentage);
        
        // Transférer le reste au vendeur
        await this.transferFundsToSeller(order, 100 - remboursementPourcentage);
        
        // Notifier le client
        await this.notifyUser(
          order.client.id,
          'Litige résolu avec remboursement partiel',
          `Le litige concernant la commande "${order.title}" a été résolu avec un remboursement partiel de ${remboursementPourcentage}%.`
        );
        
        // Notifier le vendeur
        await this.notifyUser(
          order.service.provider.id,
          'Litige résolu avec remboursement partiel',
          `Le litige concernant la commande "${order.title}" a été résolu avec un remboursement partiel de ${remboursementPourcentage}% au client.`
        );
      } else {
        // Pour les autres types de résolution
        await this.notifyParties(order, adminId, 'litige_résolu', comment);
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la résolution du litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la résolution du litige'
      };
    }
  }
  
  /**
   * Clôture un litige sans décision (sans résoudre en faveur d'une partie)
   * @param disputeId ID du litige
   * @param adminId ID de l'administrateur qui clôture le litige
   * @param reason Raison de la clôture
   */
  async closeDisputeWithoutDecision(
    disputeId: string,
    adminId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (!dispute) {
        return {
          success: false,
          message: 'Litige introuvable'
        };
      }
      
      // 2. Récupérer l'utilisateur complet
      const admin = await this.getUserById(adminId);
      if (!admin) {
        return { success: false, message: 'Administrateur non trouvé' };
      }
      
      // 3. Vérifier les permissions
      if (!disputePermissionService.canPerformAction(DisputeAction.CLOSE_WITHOUT_DECISION, admin, dispute)) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à clôturer ce litige' };
      }
      
      // 4. Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 5. Mettre à jour le statut du litige
      const updatedDispute = {
        ...dispute,
        status: 'clos_automatiquement',
        resolvedBy: adminId,
        resolvedAt: new Date().toISOString(),
        resolutionReason: reason,
        updates: [
          ...dispute.updates,
          {
            userId: adminId,
            message: `Litige clôturé sans décision. Raison: ${reason}`,
            createdAt: new Date().toISOString(),
            type: 'resolution'
          }
        ]
      };
      
      // 6. Enregistrer les modifications du litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // 7. Journaliser la clôture
      await disputeLogService.createLogEntry(
        disputeId,
        adminId,
        'admin',
        'résolution',
        `Litige clôturé sans décision par administrateur`,
        { reason }
      );
      
      // 8. Notifier les parties concernées
      await this.notifyParties(order, adminId, 'litige_résolu', reason);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la clôture du litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la clôture du litige'
      };
    }
  }

  /**
   * Retourne le libellé d'une résolution
   * @private
   */
  private getResolutionLabel(resolution: ResolutionType): string {
    const labels = {
      'remboursement_partiel': 'Remboursement partiel',
      'remboursement_total': 'Remboursement total',
      'livraison_corrigée': 'Livraison corrigée',
      'refus_du_litige': 'Refus du litige (paiement libéré au vendeur)',
      'prolongation_délai': 'Prolongation de délai',
      'arrangement_amiable': 'Arrangement amiable'
    };
    
    return labels[resolution] || resolution;
  }

  /**
   * Détermine le pourcentage de remboursement à partir du commentaire
   * @private
   */
  private determinerPourcentageRemboursement(comment: string): number {
    // Par défaut, 50% si aucun pourcentage n'est spécifié
    const defaultPercentage = 50;
    
    // Recherche un motif comme "remboursement de X%" ou "X% de remboursement"
    const regex = /(\d+)%/;
    const match = comment.match(regex);
    
    if (match && match[1]) {
      const percentage = parseInt(match[1], 10);
      if (percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
    
    return defaultPercentage;
  }

  /**
   * Rembourse le client
   * @private
   */
  private async refundClient(order: Order, pourcentage: number = 100): Promise<void> {
    try {
      const montant = order.price * (pourcentage / 100);
      
      // Simuler un appel API pour rembourser le client
      await fetch('/api/payments/refund', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          clientId: order.client.id,
          amount: montant,
          reason: 'Résolution de litige'
        })
      });
      
      // Enregistrer la transaction
      await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'refund',
          orderId: order.id,
          userId: order.client.id,
          amount: montant,
          details: `Remboursement suite à litige - ${pourcentage}%`
        })
      });
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      throw error;
    }
  }

  /**
   * Transfère les fonds au vendeur
   * @private
   */
  private async transferFundsToSeller(order: Order, pourcentage: number = 100): Promise<void> {
    try {
      const montant = order.price * (pourcentage / 100);
      
      // Simuler un appel API pour transférer les fonds au vendeur
      await fetch('/api/payments/transfer', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          sellerId: order.service.provider.id,
          amount: montant
        })
      });
      
      // Enregistrer la transaction
      await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'transfer',
          orderId: order.id,
          userId: order.service.provider.id,
          amount: montant,
          details: `Paiement suite à résolution de litige - ${pourcentage}%`
        })
      });
    } catch (error) {
      console.error('Erreur lors du transfert des fonds:', error);
      throw error;
    }
  }
  
  /**
   * Ajoute un commentaire à un litige ouvert
   * @param disputeId ID du litige
   * @param userId ID de l'utilisateur qui ajoute le commentaire
   * @param message Contenu du commentaire
   */
  async addDisputeComment(
    disputeId: string,
    userId: string,
    message: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (!dispute) {
        return {
          success: false,
          message: 'Litige introuvable'
        };
      }
      
      // 2. Récupérer les détails de la commande pour vérifier que l'utilisateur est impliqué
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 3. Récupérer l'utilisateur complet
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      // 4. Vérifier les permissions
      if (!disputePermissionService.canPerformAction(DisputeAction.RESPOND, user, dispute)) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à répondre à ce litige' };
      }
      
      // 5. Déterminer le type d'utilisateur
      let userType: 'client' | 'vendeur' | 'admin';
      if (user.role === 'admin') {
        userType = 'admin';
      } else if (userId === order.client.id) {
        userType = 'client';
      } else {
        userType = 'vendeur';
      }
      
      // 6. Mettre à jour le statut du litige si nécessaire
      let oldStatus = dispute.status;
      let newStatus = oldStatus;
      
      if (oldStatus === 'ouvert' && userType === 'vendeur') {
        // Si c'est la première réponse du vendeur, changer le statut
        newStatus = 'en_attente_de_reponse';
      } else if (oldStatus === 'en_attente_de_reponse' && userType === 'client') {
        // Si le client répond après le vendeur, changer le statut
        newStatus = 'en_traitement';
      }
      
      // 7. Ajouter le commentaire
      const updatedDispute = {
        ...dispute,
        updates: [
          ...dispute.updates,
          {
            userId,
            message,
            createdAt: new Date().toISOString(),
            type: 'comment'
          }
        ]
      };
      
      // 8. Enregistrer les modifications du litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // 9. Notifier les autres parties impliquées
      if (userId === order.client.id) {
        await this.notifyUser(
          order.service.provider.id,
          'Nouveau commentaire sur un litige',
          `Le client a ajouté un nouveau commentaire au litige concernant la commande "${order.title}".`
        );
      } else if (userId === order.service.provider.id) {
        await this.notifyUser(
          order.client.id,
          'Nouveau commentaire sur un litige',
          `Le vendeur a ajouté un nouveau commentaire au litige concernant la commande "${order.title}".`
        );
      } else if (userType === 'admin') {
        // Notifier à la fois le client et le vendeur
        await this.notifyParties(order, userId, 'nouveau_commentaire_admin');
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un commentaire au litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'ajout du commentaire'
      };
    }
  }
  
  /**
   * Vérifie si un utilisateur est impliqué dans une commande
   * @private
   */
  private isUserInvolved(userId: string, order: Order): boolean {
    return order.client.id === userId || order.service.provider?.id === userId;
  }
  
  /**
   * Vérifie s'il existe déjà un litige actif pour une commande
   * @private
   */
  private async hasActiveDispute(orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/order/${orderId}/active`);
      const disputes = await response.json();
      return disputes.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des litiges actifs:', error);
      return false;
    }
  }
  
  /**
   * Met à jour le statut d'une commande
   * @private
   */
  private async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la commande:', error);
      throw error;
    }
  }
  
  /**
   * Notifie les parties impliquées dans une commande
   * @private
   * @param order Commande concernée
   * @param senderId ID de l'utilisateur qui a déclenché la notification
   * @param type Type de notification
   * @param comment Commentaire optionnel
   */
  private async notifyParties(
    order: Order,
    senderId: string,
    type: 'litige_ouvert' | 'litige_résolu' | 'nouveau_commentaire_admin',
    comment?: string
  ): Promise<void> {
    try {
      const client = order.client;
      const seller = order.service.provider;
      
      let clientTitle = '';
      let clientMessage = '';
      let sellerTitle = '';
      let sellerMessage = '';
      
      switch (type) {
        case 'litige_ouvert':
          clientTitle = 'Litige ouvert';
          clientMessage = `Vous avez ouvert un litige pour la commande "${order.title}".`;
          sellerTitle = 'Nouveau litige';
          sellerMessage = `Un litige a été ouvert pour la commande "${order.title}".`;
          break;
        case 'litige_résolu':
          clientTitle = 'Litige résolu';
          clientMessage = `Le litige concernant la commande "${order.title}" a été résolu. ${comment || ''}`;
          sellerTitle = 'Litige résolu';
          sellerMessage = `Le litige concernant la commande "${order.title}" a été résolu. ${comment || ''}`;
          break;
        case 'nouveau_commentaire_admin':
          clientTitle = 'Nouveau message de l\'équipe support';
          clientMessage = `L'équipe support a ajouté un commentaire au litige concernant la commande "${order.title}".`;
          sellerTitle = 'Nouveau message de l\'équipe support';
          sellerMessage = `L'équipe support a ajouté un commentaire au litige concernant la commande "${order.title}".`;
          break;
      }
      
      // Notifier le client (sauf si c'est lui qui a déclenché la notification)
      if (client.id !== senderId) {
        await this.notifyUser(client.id, clientTitle, clientMessage);
      }
      
      // Notifier le vendeur (sauf si c'est lui qui a déclenché la notification)
      if (seller.id !== senderId) {
        await this.notifyUser(seller.id, sellerTitle, sellerMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la notification des parties:', error);
    }
  }
  
  /**
   * Envoie une notification à un utilisateur
   * @private
   */
  private async notifyUser(
    userId: string, 
    title: string, 
    message: string, 
    link?: string
  ): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          title,
          message,
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
          link: link || `/dashboard/disputes/${userId}`
        })
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  }
  
  /**
   * Vérifie si un utilisateur est un administrateur
   * @private
   */
  private async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      return user.role === 'admin' || user.role === 'super_admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle administrateur:', error);
      return false;
    }
  }

  /**
   * Permet à un utilisateur de suivre un litige
   * @param disputeId ID du litige à suivre
   * @param userId ID de l'utilisateur qui souhaite suivre le litige
   */
  async followDispute(
    disputeId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Vérifier que le litige existe
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (!dispute) {
        return {
          success: false,
          message: 'Litige introuvable'
        };
      }
      
      // 2. Vérifier si l'utilisateur est autorisé à suivre ce litige
      const isInvolved = await this.isUserInvolved(userId, dispute.orderId);
      const isAdmin = await this.isUserAdmin(userId);
      
      if (!isInvolved && !isAdmin) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à suivre ce litige'
        };
      }
      
      // 3. Ajouter l'utilisateur aux abonnés du litige
      const updatedDispute = {
        ...dispute,
        followers: [...(dispute.followers || []), userId]
      };
      
      // 4. Enregistrer les modifications
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      return {
        success: true,
        message: 'Vous suivez maintenant ce litige'
      };
    } catch (error) {
      console.error('Erreur lors du suivi du litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors du suivi du litige'
      };
    }
  }

  /**
   * Vérifie tous les litiges pour appliquer les règles d'automatisation
   * Cette méthode est destinée à être exécutée par un cron job
   */
  async checkDisputeDeadlines(): Promise<void> {
    try {
      // Récupérer tous les litiges ouverts
      const disputesResponse = await fetch(`${this.apiUrl}/all?status=ouvert`);
      const disputes = await disputesResponse.json();
      
      const now = new Date();
      
      // Parcourir les litiges pour vérifier les délais
      for (const dispute of disputes) {
        const creationDate = new Date(dispute.createdAt);
        const daysSinceCreation = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // 1. Litige non résolu sous 3 jours → transmis automatiquement à l'admin
        if (daysSinceCreation >= 3) {
          // Vérifier si le litige a déjà été escaladé à l'admin
          const hasAdminInvolved = dispute.updates.some(update => {
            const isAdmin = update.userId.startsWith('admin-');
            const isEscalationComment = update.message.includes('escaladé automatiquement');
            return isAdmin && isEscalationComment;
          });
          
          if (!hasAdminInvolved) {
            // Escalader le litige à l'admin
            await this.escalateToAdmin(dispute.id);
          }
        }
        
        // 2. Après 14 jours sans réponse des deux parties → litige clos automatiquement
        if (daysSinceCreation >= 14) {
          // Vérifier si le litige est inactif (pas de mise à jour récente des parties concernées)
          const lastUpdate = new Date(
            dispute.updates
              .filter(update => !update.userId.startsWith('admin-') || update.type !== 'system')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt || dispute.createdAt
          );
          
          const daysSinceLastUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastUpdate >= 14) {
            // Fermer automatiquement le litige
            await this.autoCloseDispute(dispute.id, 'inactivité');
          }
        }
        
        // 3. Vérifier le temps de réponse maximum par participant
        await this.checkParticipantResponseTime(dispute);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des délais des litiges:', error);
    }
  }
  
  /**
   * Escalade un litige à l'admin après 3 jours sans résolution
   * @private
   */
  private async escalateToAdmin(disputeId: string): Promise<void> {
    try {
      // Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (dispute.status !== 'ouvert') {
        return; // Ne pas escalader si le litige est déjà résolu
      }
      
      // Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      // Ajouter une mise à jour système pour indiquer l'escalade
      const updatedDispute = {
        ...dispute,
        updates: [
          ...dispute.updates,
          {
            userId: 'system',
            message: 'Ce litige a été escaladé automatiquement à l\'équipe d\'administration en raison de l\'absence de résolution dans le délai de 3 jours.',
            createdAt: new Date().toISOString(),
            type: 'system'
          }
        ]
      };
      
      // Mettre à jour le litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // Notifier les administrateurs
      await fetch('/api/admin/disputes/escalation', {
        method: 'POST',
        body: JSON.stringify({
          disputeId,
          reason: 'auto_escalation_3days',
          dispute: {
            id: dispute.id,
            createdAt: dispute.createdAt,
            reason: dispute.reason
          },
          order: {
            id: order.id,
            title: order.title
          }
        })
      });
      
      // Notifier les parties concernées
      await this.notifyUser(order.client.id, 'Litige escaladé', `Le litige concernant la commande "${order.title}" a été transmis à l'équipe d'administration.`);
      await this.notifyUser(order.service.provider.id, 'Litige escaladé', `Le litige concernant la commande "${order.title}" a été transmis à l'équipe d'administration.`);
      
    } catch (error) {
      console.error('Erreur lors de l\'escalade du litige:', error);
    }
  }
  
  /**
   * Ferme automatiquement un litige après 14 jours d'inactivité
   * @private
   */
  private async autoCloseDispute(disputeId: string, reason: 'inactivité' | 'temps_réponse'): Promise<void> {
    try {
      // Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (dispute.status !== 'ouvert') {
        return; // Ne pas fermer si le litige est déjà résolu
      }
      
      // Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      // Déterminer le message de fermeture en fonction de la raison
      let message = '';
      if (reason === 'inactivité') {
        message = 'Ce litige a été clôturé automatiquement en raison d\'une inactivité de plus de 14 jours.';
      } else {
        message = 'Ce litige a été clôturé automatiquement car le temps de réponse maximum a été dépassé.';
      }
      
      // Mettre à jour le litige
      const updatedDispute = {
        ...dispute,
        status: 'fermé',
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'system',
        updates: [
          ...dispute.updates,
          {
            userId: 'system',
            message,
            createdAt: new Date().toISOString(),
            type: 'resolution'
          }
        ]
      };
      
      // Mettre à jour le litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // Restaurer le statut précédent de la commande
      await this.updateOrderStatus(dispute.orderId, 'livré');
      
      // Notifier les parties concernées
      await this.notifyUser(order.client.id, 'Litige clôturé', `Le litige concernant la commande "${order.title}" a été clôturé automatiquement : ${message}`);
      await this.notifyUser(order.service.provider.id, 'Litige clôturé', `Le litige concernant la commande "${order.title}" a été clôturé automatiquement : ${message}`);
      
    } catch (error) {
      console.error('Erreur lors de la fermeture automatique du litige:', error);
    }
  }
  
  /**
   * Vérifie le temps de réponse maximum des participants
   * @private
   */
  private async checkParticipantResponseTime(dispute: Dispute): Promise<void> {
    try {
      // Définir le temps de réponse maximum (en heures)
      const maxResponseTime = 72; // 72 heures = 3 jours
      
      // Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      const now = new Date();
      
      // Filtrer les mises à jour par utilisateur
      const clientId = order.client.id;
      const sellerId = order.service.provider.id;
      
      // Obtenir la dernière action de chaque partie
      const clientUpdates = dispute.updates.filter(u => u.userId === clientId);
      const sellerUpdates = dispute.updates.filter(u => u.userId === sellerId);
      
      // Déterminer qui doit répondre en fonction de la dernière action
      const latestClientUpdate = clientUpdates.length > 0
        ? clientUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;
        
      const latestSellerUpdate = sellerUpdates.length > 0
        ? sellerUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;
      
      // Déterminer qui est le dernier à avoir répondu
      let lastRespondent = null;
      let timeElapsedForResponse = 0;
      
      if (latestClientUpdate && latestSellerUpdate) {
        const clientUpdateTime = new Date(latestClientUpdate.createdAt).getTime();
        const sellerUpdateTime = new Date(latestSellerUpdate.createdAt).getTime();
        
        if (clientUpdateTime > sellerUpdateTime) {
          // Le client a répondu en dernier, c'est au vendeur de répondre
          lastRespondent = 'client';
          timeElapsedForResponse = Math.floor((now.getTime() - clientUpdateTime) / (1000 * 60 * 60));
          
          // Si le temps écoulé dépasse le maximum et qu'aucun rappel n'a été envoyé
          if (timeElapsedForResponse >= maxResponseTime / 2 && timeElapsedForResponse < maxResponseTime) {
            // Envoyer un rappel au vendeur
            await this.sendResponseReminder(sellerId, order.title, dispute.id);
          } else if (timeElapsedForResponse >= maxResponseTime) {
            // Règle: Si le vendeur ne répond pas sous 72h, le client gagne par défaut
            await this.autoResolveInFavorOfClient(dispute.id, 'non_réponse_vendeur');
          }
        } else {
          // Le vendeur a répondu en dernier, c'est au client de répondre
          lastRespondent = 'seller';
          timeElapsedForResponse = Math.floor((now.getTime() - sellerUpdateTime) / (1000 * 60 * 60));
          
          // Si le temps écoulé dépasse le maximum et qu'aucun rappel n'a été envoyé
          if (timeElapsedForResponse >= maxResponseTime / 2 && timeElapsedForResponse < maxResponseTime) {
            // Envoyer un rappel au client
            await this.sendResponseReminder(clientId, order.title, dispute.id);
          } else if (timeElapsedForResponse >= maxResponseTime) {
            // Fermer le litige pour non-réponse du client
            await this.autoCloseDispute(dispute.id, 'temps_réponse');
          }
        }
      } else if (latestClientUpdate) {
        // Seul le client a répondu, c'est au vendeur de répondre
        lastRespondent = 'client';
        timeElapsedForResponse = Math.floor((now.getTime() - new Date(latestClientUpdate.createdAt).getTime()) / (1000 * 60 * 60));
        
        // Vérifier le temps écoulé
        if (timeElapsedForResponse >= maxResponseTime / 2 && timeElapsedForResponse < maxResponseTime) {
          await this.sendResponseReminder(sellerId, order.title, dispute.id);
        } else if (timeElapsedForResponse >= maxResponseTime) {
          // Règle: Si le vendeur ne répond pas sous 72h, le client gagne par défaut
          await this.autoResolveInFavorOfClient(dispute.id, 'non_réponse_vendeur');
        }
      } else if (latestSellerUpdate) {
        // Seul le vendeur a répondu, c'est au client de répondre
        lastRespondent = 'seller';
        timeElapsedForResponse = Math.floor((now.getTime() - new Date(latestSellerUpdate.createdAt).getTime()) / (1000 * 60 * 60));
        
        // Vérifier le temps écoulé
        if (timeElapsedForResponse >= maxResponseTime / 2 && timeElapsedForResponse < maxResponseTime) {
          await this.sendResponseReminder(clientId, order.title, dispute.id);
        } else if (timeElapsedForResponse >= maxResponseTime) {
          await this.autoCloseDispute(dispute.id, 'temps_réponse');
        }
      } else {
        // Aucun des deux n'a répondu depuis l'ouverture du litige
        const disputeCreationTime = new Date(dispute.createdAt).getTime();
        timeElapsedForResponse = Math.floor((now.getTime() - disputeCreationTime) / (1000 * 60 * 60));
        
        // Le litige a été ouvert par le client, donc c'est au vendeur de répondre en premier
        if (dispute.initiatedBy === clientId) {
          if (timeElapsedForResponse >= maxResponseTime / 2 && timeElapsedForResponse < maxResponseTime) {
            await this.sendResponseReminder(sellerId, order.title, dispute.id);
          } else if (timeElapsedForResponse >= maxResponseTime) {
            // Règle: Si le vendeur ne répond pas sous 72h, le client gagne par défaut
            await this.autoResolveInFavorOfClient(dispute.id, 'non_réponse_vendeur');
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la vérification du temps de réponse:', error);
    }
  }
  
  /**
   * Envoie un rappel de réponse à un utilisateur
   * @private
   */
  private async sendResponseReminder(userId: string, orderTitle: string, disputeId: string): Promise<void> {
    try {
      await this.notifyUser(
        userId,
        'Rappel : Action requise sur un litige',
        `Une réponse de votre part est attendue concernant le litige de la commande "${orderTitle}". Si vous ne répondez pas dans les prochaines 36 heures, le litige pourrait être clôturé automatiquement.`,
        `/dashboard/disputes/${disputeId}`
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
    }
  }

  /**
   * Résout automatiquement un litige en faveur du client
   * @private
   */
  private async autoResolveInFavorOfClient(disputeId: string, reason: 'non_réponse_vendeur'): Promise<void> {
    try {
      // Récupérer les détails du litige
      const disputeResponse = await fetch(`${this.apiUrl}/${disputeId}`);
      const dispute = await disputeResponse.json();
      
      if (dispute.status !== 'ouvert') {
        return; // Ne pas résoudre si le litige est déjà résolu
      }
      
      // Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      // Déterminer le message de résolution en fonction de la raison
      let message = '';
      if (reason === 'non_réponse_vendeur') {
        message = 'Ce litige a été automatiquement résolu en faveur du client car le vendeur n\'a pas répondu dans le délai de 72 heures.';
      }
      
      // Mettre à jour le litige
      const updatedDispute = {
        ...dispute,
        status: 'résolu',
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'system',
        resolution: 'client',
        resolutionReason: message,
        updates: [
          ...dispute.updates,
          {
            userId: 'system',
            message,
            createdAt: new Date().toISOString(),
            type: 'resolution'
          }
        ]
      };
      
      // Mettre à jour le litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // Mettre à jour le statut de la commande
      await this.updateOrderStatus(dispute.orderId, 'terminée_manuellement');
      
      // Rembourser le client
      await this.refundClient(order);
      
      // Notifier les parties concernées
      await this.notifyUser(
        order.client.id, 
        'Litige résolu en votre faveur', 
        `Le litige concernant la commande "${order.title}" a été automatiquement résolu en votre faveur : ${message}`
      );
      
      await this.notifyUser(
        order.service.provider.id, 
        'Litige résolu en faveur du client', 
        `Le litige concernant la commande "${order.title}" a été automatiquement résolu en faveur du client : ${message}`
      );
      
    } catch (error) {
      console.error('Erreur lors de la résolution automatique du litige:', error);
    }
  }

  /**
   * Télécharge les pièces jointes du litige
   */
  private async uploadAttachments(files: File[], orderId: string): Promise<string[]> {
    try {
      const urls: string[] = [];
      
      for (const file of files) {
        // Simuler l'upload de fichier (dans une vraie application, cela serait un appel à un service de stockage)
        const url = await this.simulateFileUpload(file, orderId);
        urls.push(url);
      }
      
      return urls;
    } catch (error) {
      console.error('Erreur lors de l\'upload des pièces jointes:', error);
      throw error;
    }
  }

  /**
   * Simule l'upload d'un fichier (à remplacer par une vraie implémentation)
   */
  private async simulateFileUpload(file: File, orderId: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Dans une vraie implémentation, ce serait l'URL de la pièce jointe uploadée
        const fakeUrl = `https://storage.nionfar.sn/disputes/${orderId}/${file.name}`;
        resolve(fakeUrl);
      }, 500);
    });
  }

  /**
   * Récupère un utilisateur par son ID
   * @private
   */
  private async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupère l'historique des litiges d'un freelancer
   * @param freelancerId ID du freelancer
   * @returns Statistiques liées aux litiges du freelancer
   */
  async getFreelancerDisputeHistory(freelancerId: string): Promise<{
    totalDisputes: number;
    resolvedInFavor: number;
    resolvedAgainst: number;
    openDisputes: number;
    disputeSummary: Array<{
      disputeId: string;
      orderId: string;
      status: string;
      createdAt: string;
      resolvedAt?: string;
      isResolvedInFavor: boolean;
    }>;
  }> {
    try {
      // Simuler un délai d'appel à l'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dans une implémentation réelle, nous ferions un appel API
      // pour récupérer ces données depuis la base de données
      
      // Générer des données simulées pour la démonstration
      const totalDisputes = Math.floor(Math.random() * 6); // Entre 0 et 5 litiges
      
      // Si aucun litige, retourner un objet vide
      if (totalDisputes === 0) {
        return {
          totalDisputes: 0,
          resolvedInFavor: 0,
          resolvedAgainst: 0,
          openDisputes: 0,
          disputeSummary: []
        };
      }
      
      // Générer des litiges simulés
      const disputeSummary = [];
      let resolvedInFavor = 0;
      let resolvedAgainst = 0;
      let openDisputes = 0;
      
      for (let i = 0; i < totalDisputes; i++) {
        const isResolved = Math.random() > 0.3; // 70% des litiges sont résolus
        const isResolvedInFavor = isResolved ? Math.random() > 0.4 : false; // 60% résolus en faveur du freelancer
        
        if (isResolved) {
          if (isResolvedInFavor) {
            resolvedInFavor++;
          } else {
            resolvedAgainst++;
          }
        } else {
          openDisputes++;
        }
        
        const createdAt = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Jusqu'à 180 jours dans le passé
        
        disputeSummary.push({
          disputeId: `DSP-${Date.now()}-${i}`,
          orderId: `ORD-${Date.now()}-${i}`,
          status: isResolved 
            ? (isResolvedInFavor ? 'résolu_en_faveur_vendeur' : 'résolu_en_faveur_client') 
            : 'ouvert',
          createdAt: createdAt.toISOString(),
          resolvedAt: isResolved ? new Date(createdAt.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          isResolvedInFavor
        });
      }
      
      return {
        totalDisputes,
        resolvedInFavor,
        resolvedAgainst,
        openDisputes,
        disputeSummary
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des litiges:', error);
      return {
        totalDisputes: 0,
        resolvedInFavor: 0,
        resolvedAgainst: 0,
        openDisputes: 0,
        disputeSummary: []
      };
    }
  }
}

export const disputeService = new DisputeService();
export default disputeService; 