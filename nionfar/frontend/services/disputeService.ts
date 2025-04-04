import { toast } from 'react-toastify';
import { Dispute, Order, User, OrderStatus } from '../types';
import { orderService } from './orderService';

class DisputeService {
  private apiUrl = '/api/disputes'; // Fictif pour le moment

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
    details: string
  ): Promise<{
    success: boolean;
    message?: string;
    dispute?: Dispute;
  }> {
    try {
      // 1. Vérifier que la commande existe
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 2. Vérifier que l'utilisateur est impliqué dans la commande
      if (!this.isUserInvolved(userId, order)) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à ouvrir un litige pour cette commande'
        };
      }
      
      // 3. Vérifier qu'il n'existe pas déjà un litige actif
      if (await this.hasActiveDispute(orderId)) {
        return {
          success: false,
          message: 'Un litige est déjà en cours pour cette commande'
        };
      }
      
      // 4. Créer le litige
      const dispute: Dispute = {
        id: `DSP-${Date.now()}`,
        orderId,
        initiatedBy: userId,
        reason,
        details,
        attachments: [],
        status: 'ouvert',
        createdAt: new Date().toISOString(),
        updates: [
          {
            userId,
            message: 'Litige ouvert',
            createdAt: new Date().toISOString(),
            type: 'status_change'
          }
        ]
      };
      
      // 5. Mettre à jour le statut de la commande
      await this.updateOrderStatus(orderId, 'litige');
      
      // 6. Enregistrer le litige
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify(dispute)
      });
      
      const createdDispute = await response.json();
      
      // 7. Notifier les parties impliquées
      await this.notifyParties(order, userId, 'litige_ouvert');
      
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
   * @param resolution Résolution ('client' ou 'vendeur')
   * @param comment Commentaire sur la résolution
   */
  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolution: 'client' | 'vendeur',
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
      
      // 2. Vérifier que le litige est toujours ouvert
      if (dispute.status !== 'ouvert') {
        return {
          success: false,
          message: `Ce litige a déjà été ${dispute.status === 'résolu' ? 'résolu' : 'fermé'}`
        };
      }
      
      // 3. Récupérer les détails de la commande
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 4. Mettre à jour le statut du litige
      const updatedDispute = {
        ...dispute,
        status: 'résolu',
        resolvedBy: adminId,
        resolvedAt: new Date().toISOString(),
        resolution,
        updates: [
          ...dispute.updates,
          {
            userId: adminId,
            message: `Litige résolu en faveur du ${resolution === 'vendeur' ? 'vendeur' : 'client'}: ${comment}`,
            createdAt: new Date().toISOString(),
            type: 'resolution'
          }
        ]
      };
      
      // 5. Enregistrer les modifications du litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // 6. Mettre à jour le statut de la commande
      await this.updateOrderStatus(dispute.orderId, 'terminée_manuellement');
      
      // 7. Gérer le transfert ou le remboursement des fonds
      if (resolution === 'vendeur') {
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
          `Le litige concernant la commande "${order.title}" a été résolu en faveur du vendeur. N'hésitez pas à nous contacter pour plus d'informations.`
        );
      } else {
        // Rembourser le client
        await this.refundClient(order);
        
        // Notifier le client
        await this.notifyUser(
          order.client.id,
          'Litige résolu en votre faveur',
          `Le litige concernant la commande "${order.title}" a été résolu en votre faveur. Vous avez été remboursé.`
        );
        
        // Notifier le vendeur
        await this.notifyUser(
          order.service.provider.id,
          'Litige résolu',
          `Le litige concernant la commande "${order.title}" a été résolu en faveur du client. N'hésitez pas à nous contacter pour plus d'informations.`
        );
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
      
      // 2. Vérifier que le litige est toujours ouvert
      if (dispute.status !== 'ouvert') {
        return {
          success: false,
          message: 'Ce litige n\'est plus ouvert et ne peut pas recevoir de nouveaux commentaires'
        };
      }
      
      // 3. Récupérer les détails de la commande pour vérifier que l'utilisateur est impliqué
      const orderResponse = await fetch(`/api/orders/${dispute.orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande introuvable'
        };
      }
      
      // 4. Vérifier que l'utilisateur est impliqué dans la commande ou est un admin
      const isAdmin = await this.isUserAdmin(userId);
      if (!isAdmin && !this.isUserInvolved(userId, order)) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à commenter ce litige'
        };
      }
      
      // 5. Ajouter le commentaire
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
      
      // 6. Enregistrer les modifications du litige
      await fetch(`${this.apiUrl}/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDispute)
      });
      
      // 7. Notifier les autres parties impliquées
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
      } else if (isAdmin) {
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
   * Notifie les parties impliquées dans un litige
   * @private
   */
  private async notifyParties(order: Order, initiatorId: string, type: 'litige_ouvert' | 'litige_résolu' | 'nouveau_commentaire_admin'): Promise<void> {
    const otherPartyId = initiatorId === order.client.id ? order.service.provider?.id : order.client.id;
    
    if (!otherPartyId) return;
    
    let title = '';
    let message = '';
    
    switch (type) {
      case 'litige_ouvert':
        title = 'Un litige a été ouvert';
        message = `Un litige a été ouvert pour la commande "${order.title}".`;
        break;
      case 'litige_résolu':
        title = 'Litige résolu';
        message = `Le litige concernant la commande "${order.title}" a été résolu.`;
        break;
      case 'nouveau_commentaire_admin':
        title = 'Nouveau commentaire administratif';
        message = `Un administrateur a ajouté un commentaire au litige concernant la commande "${order.title}".`;
        break;
    }
    
    await this.notifyUser(otherPartyId, title, message);
    
    // Si c'est un admin qui a initié l'action, notifier également l'autre partie
    if (await this.isUserAdmin(initiatorId)) {
      await this.notifyUser(
        initiatorId === order.client.id ? order.client.id : order.service.provider!.id,
        title,
        message
      );
    }
  }
  
  /**
   * Envoie une notification à un utilisateur
   * @private
   */
  private async notifyUser(userId: string, title: string, message: string): Promise<void> {
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
          link: `/dashboard/disputes/${userId}`
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
   * Transfère les fonds au vendeur
   * @private
   */
  private async transferFundsToSeller(order: Order): Promise<void> {
    try {
      await fetch('/api/payments/transfer', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          sellerId: order.service.provider?.id,
          amount: order.price,
          reason: 'resolution_litige'
        })
      });
    } catch (error) {
      console.error('Erreur lors du transfert des fonds au vendeur:', error);
      throw error;
    }
  }
  
  /**
   * Rembourse le client
   * @private
   */
  private async refundClient(order: Order): Promise<void> {
    try {
      // Simulation d'un appel API pour rembourser le client
      console.log(`Remboursement du client ${order.client.id} pour la commande ${order.id}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Erreur lors du remboursement du client:', error);
      throw error;
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
}

export const disputeService = new DisputeService();
export default disputeService; 