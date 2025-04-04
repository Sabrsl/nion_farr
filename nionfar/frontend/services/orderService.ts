import { 
  Order, 
  OrderStatus, 
  Service, 
  User, 
  Deliverable, 
  RevisionRequest,
  Dispute,
  Payment,
  Notification
} from '../types';

// Simulate API service for orders
class OrderService {
  private apiUrl = '/api/orders'; // Fictif pour le moment
  
  /**
   * Vérifie si un service peut être commandé
   * @param serviceId ID du service à vérifier
   * @returns Promesse avec le résultat de la vérification
   */
  async checkServiceAvailability(serviceId: string): Promise<{
    available: boolean;
    message?: string;
    service?: Service;
  }> {
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les infos du service (simulé)
      const response = await fetch(`/api/services/${serviceId}`);
      const service = await response.json();
      
      // Vérifier que le service est actif
      if (!service.isActive) {
        return {
          available: false,
          message: 'Ce service n\'est pas disponible actuellement.'
        };
      }
      
      // Vérifier que le vendeur est actif (simulé)
      const sellerResponse = await fetch(`/api/users/${service.provider.id}`);
      const seller = await sellerResponse.json();
      
      if (!seller.isActive) {
        return {
          available: false,
          message: 'Le vendeur n\'est pas disponible actuellement.'
        };
      }
      
      return {
        available: true,
        service
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du service:', error);
      return {
        available: false,
        message: 'Une erreur est survenue lors de la vérification du service.'
      };
    }
  }
  
  /**
   * Création d'une commande
   * @param serviceId ID du service à commander
   * @param clientId ID du client
   * @param requirements Brief du client
   * @returns Promesse avec la commande créée
   */
  async placeOrder(
    serviceId: string,
    clientId: string,
    requirements: string,
    paymentInfo: {
      method: 'carte' | 'mobile_money' | 'virement';
      details: any;
    }
  ): Promise<{
    success: boolean;
    order?: Order;
    message?: string;
    paymentUrl?: string;
  }> {
    try {
      // 1. Vérifier la disponibilité du service
      const serviceCheck = await this.checkServiceAvailability(serviceId);
      
      if (!serviceCheck.available) {
        return {
          success: false,
          message: serviceCheck.message
        };
      }
      
      // 2. Initialiser le paiement
      const paymentResponse = await this.initializePayment(
        serviceCheck.service!.price,
        clientId,
        serviceId,
        paymentInfo
      );
      
      if (!paymentResponse.success) {
        return {
          success: false,
          message: 'Échec de l\'initialisation du paiement.',
          paymentUrl: paymentResponse.paymentUrl
        };
      }
      
      // 3. Créer la commande avec statut "en_attente_paiement"
      const order: Partial<Order> = {
        title: serviceCheck.service!.title,
        service: serviceCheck.service!,
        client: { id: clientId } as any, // Sera complété par l'API
        status: 'en_attente' as OrderStatus,
        price: serviceCheck.service!.price,
        requirements,
        isPaid: false,
        // Estimez la date de livraison en fonction du délai de livraison du service
        deadline: this.calculateDeadline(serviceCheck.service!.deliveryTime)
      };
      
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const createdOrderResponse = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          ...order,
          paymentId: paymentResponse.paymentId
        })
      });
      
      const createdOrder = await createdOrderResponse.json();
      
      return {
        success: true,
        order: createdOrder,
        paymentUrl: paymentResponse.paymentUrl
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la création de la commande.'
      };
    }
  }
  
  /**
   * Initialise un paiement
   * @private
   */
  private async initializePayment(
    amount: number,
    clientId: string,
    serviceId: string,
    paymentInfo: any
  ): Promise<{
    success: boolean;
    paymentId?: string;
    paymentUrl?: string;
    message?: string;
  }> {
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simuler un retour d'API de paiement
      return {
        success: true,
        paymentId: `PAY-${Date.now()}`,
        paymentUrl: `/payment-gateway?amount=${amount}&method=${paymentInfo.method}`
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      return {
        success: false,
        message: 'Erreur de paiement'
      };
    }
  }
  
  /**
   * Webhook pour notification de paiement validé
   * @param paymentId ID du paiement
   * @param status Statut du paiement
   */
  async onPaymentCompleted(paymentId: string, status: 'success' | 'failed'): Promise<void> {
    try {
      // 1. Récupérer la commande liée au paiement
      const orderResponse = await fetch(`${this.apiUrl}/payment/${paymentId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        throw new Error('Commande non trouvée pour ce paiement');
      }
      
      // 2. Si le paiement a réussi
      if (status === 'success') {
        // Utiliser le service de paiement pour valider le paiement
        const paymentService = (await import('./paymentService')).default;
        const paymentResult = await paymentService.onPaymentValidated(
          paymentId,
          order.price,
          order.client.id,
          order.id
        );
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.message || 'Erreur lors de la validation du paiement');
        }
        
        // Mettre à jour la commande
        const updatedOrder = {
          ...order,
          status: 'en_attente_acceptation' as OrderStatus,
          isPaid: true,
          payment: {
            ...order.payment,
            status: 'validé',
            transactionId: paymentResult.transactionId
          }
        };
        
        // Appeler l'API pour mettre à jour la commande
        await fetch(`${this.apiUrl}/${order.id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedOrder)
        });
        
        // Créer une notification pour le vendeur
        await this.createNotification({
          userId: order.service.provider.id,
          title: 'Nouvelle commande',
          message: `Vous avez reçu une nouvelle commande : ${order.title}`,
          type: 'success',
          link: `/dashboard/orders/${order.id}`
        });
      } else {
        // Utiliser le service de paiement pour gérer l'échec du paiement
        const paymentService = (await import('./paymentService')).default;
        await paymentService.onPaymentFailed(
          paymentId,
          order.id,
          'Échec de traitement du paiement'
        );
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
    }
  }
  
  /**
   * Accepter une commande par le vendeur
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   */
  async acceptOrder(orderId: string, sellerId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au vendeur
      const orderResponse = await fetch(`${this.apiUrl}/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.service.provider.id !== sellerId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à accepter cette commande'
        };
      }
      
      if (order.status !== 'en_attente_acceptation') {
        return {
          success: false,
          message: `La commande ne peut pas être acceptée (statut actuel: ${order.status})`
        };
      }
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'en_cours' as OrderStatus,
        lastUpdatedAt: new Date().toISOString()
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.apiUrl}/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au client
      await this.createNotification({
        userId: order.client.id,
        title: 'Commande acceptée',
        message: `Votre commande ${order.title} a été acceptée par le vendeur.`,
        type: 'success',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Soumettre une livraison 
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   * @param deliverable Livrable (message + fichiers)
   */
  async submitDelivery(
    orderId: string,
    sellerId: string,
    deliverable: { message: string; fileUrls: string[] }
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au vendeur
      const orderResponse = await fetch(`${this.apiUrl}/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.service.provider.id !== sellerId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à livrer cette commande'
        };
      }
      
      if (order.status !== 'en_cours' && order.status !== 'en_modification' && order.status !== 'livraison_en_retard') {
        return {
          success: false,
          message: `La commande ne peut pas être livrée (statut actuel: ${order.status})`
        };
      }
      
      // Créer un nouveau livrable
      const newDeliverable: Deliverable = {
        id: `DEL-${Date.now()}`,
        orderId,
        message: deliverable.message,
        fileUrls: deliverable.fileUrls,
        createdAt: new Date().toISOString()
      };
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'livré' as OrderStatus,
        lastUpdatedAt: new Date().toISOString(),
        deliverables: [...(order.deliverables || []), newDeliverable],
        // Ajouter un délai de 72h pour validation automatique
        deliveryValidationDeadline: this.calculateDeadline(3, true)
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.apiUrl}/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au client
      await this.createNotification({
        userId: order.client.id,
        title: 'Commande livrée',
        message: `Votre commande ${order.title} a été livrée. Vous avez 3 jours pour l'approuver ou demander une révision.`,
        type: 'info',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la livraison:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Demander une révision
   * @param orderId ID de la commande
   * @param clientId ID du client
   * @param message Message de demande de révision
   */
  async requestRevision(
    orderId: string,
    clientId: string,
    message: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au client
      const orderResponse = await fetch(`${this.apiUrl}/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.client.id !== clientId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à demander une révision pour cette commande'
        };
      }
      
      if (order.status !== 'livré') {
        return {
          success: false,
          message: `Vous ne pouvez pas demander de révision (statut actuel: ${order.status})`
        };
      }
      
      // Créer une nouvelle demande de révision
      const revisionRequest: RevisionRequest = {
        id: `REV-${Date.now()}`,
        orderId,
        message,
        createdAt: new Date().toISOString()
      };
      
      // Calculer la nouvelle date limite (ajouter un délai bonus)
      const bonusTime = 2; // 2 jours supplémentaires
      const newDeadline = this.calculateDeadline(bonusTime);
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'en_modification' as OrderStatus,
        lastUpdatedAt: new Date().toISOString(),
        revisionRequests: [...(order.revisionRequests || []), revisionRequest],
        deadline: newDeadline,
        deliveryValidationDeadline: null // Annuler le compte à rebours de validation
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.apiUrl}/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au vendeur
      await this.createNotification({
        userId: order.service.provider.id,
        title: 'Demande de révision',
        message: `Le client a demandé une révision pour la commande ${order.title}.`,
        type: 'warning',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la demande de révision:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Approuver une commande (marquer comme terminée)
   * @param orderId ID de la commande
   * @param clientId ID du client
   */
  async completeOrder(
    orderId: string,
    clientId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au client
      const orderResponse = await fetch(`${this.apiUrl}/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.client.id !== clientId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à approuver cette commande'
        };
      }
      
      if (order.status !== 'livré') {
        return {
          success: false,
          message: `Vous ne pouvez pas approuver cette commande (statut actuel: ${order.status})`
        };
      }
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'terminée' as OrderStatus,
        lastUpdatedAt: new Date().toISOString(),
        deliveryValidationDeadline: null // Annuler le compte à rebours de validation
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.apiUrl}/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Transférer les fonds en attente au vendeur (avec période de grâce)
      await this.transferFundsToSeller(order.id, order.service.provider.id, order.price, true);
      
      // Notification au vendeur
      await this.createNotification({
        userId: order.service.provider.id,
        title: 'Commande terminée',
        message: `Le client a approuvé la commande ${order.title}. Les fonds seront disponibles après la période de grâce.`,
        type: 'success',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Transférer les fonds au vendeur
   * @private
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   * @param amount Montant à transférer
   * @param withGracePeriod Si true, les fonds ne seront disponibles qu'après la période de grâce
   */
  private async transferFundsToSeller(
    orderId: string,
    sellerId: string,
    amount: number,
    withGracePeriod: boolean = false
  ): Promise<void> {
    try {
      // Simuler un appel API pour transférer les fonds
      const transferData = {
        orderId,
        sellerId,
        amount,
        withGracePeriod,
        // Si période de grâce, ajouter 5 jours
        availableAt: withGracePeriod ? this.calculateDeadline(5) : new Date().toISOString()
      };
      
      await fetch('/api/earnings/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData)
      });
    } catch (error) {
      console.error('Erreur lors du transfert des fonds:', error);
    }
  }
  
  /**
   * Vérification des dates limites de livraison (pour cron job)
   * Cette méthode serait normalement exécutée par un cron job côté serveur
   */
  async checkDeliveryDeadlines(): Promise<void> {
    try {
      // Récupérer toutes les commandes en cours
      const ordersResponse = await fetch(`${this.apiUrl}/active`);
      const activeOrders = await ordersResponse.json();
      
      const now = new Date();
      
      // Parcourir les commandes pour vérifier les deadlines
      for (const order of activeOrders) {
        const deadline = new Date(order.deadline);
        
        // Si la date limite est dépassée et que la commande est toujours en cours
        if (deadline < now && order.status === 'en_cours') {
          // Mettre à jour le statut de la commande
          const updatedOrder = {
            ...order,
            status: 'livraison_en_retard' as OrderStatus,
            lastUpdatedAt: now.toISOString()
          };
          
          // Appeler l'API pour mettre à jour la commande
          await fetch(`${this.apiUrl}/${order.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedOrder)
          });
          
          // Notification au vendeur
          await this.createNotification({
            userId: order.service.provider.id,
            title: 'Livraison en retard',
            message: `La date limite de livraison pour la commande ${order.title} est dépassée.`,
            type: 'warning',
            link: `/dashboard/orders/${order.id}`
          });
          
          // Notification au client
          await this.createNotification({
            userId: order.client.id,
            title: 'Livraison en retard',
            message: `La date limite de livraison pour la commande ${order.title} est dépassée. Le vendeur a été notifié.`,
            type: 'warning',
            link: `/dashboard/orders/${order.id}`
          });
        }
        
        // Vérifier les deadlines de validation automatique
        if (order.status === 'livré' && order.deliveryValidationDeadline) {
          const validationDeadline = new Date(order.deliveryValidationDeadline);
          
          // Si la deadline de validation est dépassée
          if (validationDeadline < now) {
            // Validation automatique
            await this.completeOrder(order.id, order.client.id);
            
            // Notification au client
            await this.createNotification({
              userId: order.client.id,
              title: 'Validation automatique',
              message: `La commande ${order.title} a été automatiquement validée après 72h.`,
              type: 'info',
              link: `/dashboard/orders/${order.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des deadlines:', error);
    }
  }
  
  /**
   * Ouvrir un litige
   * @param orderId ID de la commande
   * @param userId ID de l'utilisateur (client ou vendeur)
   * @param reason Raison du litige
   * @param details Détails du litige
   */
  async openDispute(
    orderId: string,
    userId: string,
    reason: string,
    details: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe
      const orderResponse = await fetch(`${this.apiUrl}/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      // Vérifier que l'utilisateur est impliqué dans la commande
      if (order.client.id !== userId && order.service.provider.id !== userId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à ouvrir un litige pour cette commande'
        };
      }
      
      // Créer un nouveau litige
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
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'litige' as OrderStatus,
        lastUpdatedAt: new Date().toISOString(),
        dispute
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.apiUrl}/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Déterminer l'autre partie pour la notification
      const otherPartyId = userId === order.client.id 
        ? order.service.provider.id 
        : order.client.id;
      
      // Notification à l'autre partie
      await this.createNotification({
        userId: otherPartyId,
        title: 'Litige ouvert',
        message: `Un litige a été ouvert pour la commande ${order.title}.`,
        type: 'warning',
        link: `/dashboard/orders/${order.id}`
      });
      
      // Notification à l'équipe support (exemple)
      await fetch('/api/admin/disputes', {
        method: 'POST',
        body: JSON.stringify({
          dispute,
          order: {
            id: order.id,
            title: order.title
          }
        })
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du litige:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Crée une notification
   * @private
   */
  private async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<void> {
    try {
      const newNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(newNotification)
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  }
  
  /**
   * Calcule une date limite à partir d'aujourd'hui
   * @private
   * @param days Nombre de jours à ajouter
   * @param includeHours Si true, inclut les heures dans le calcul
   * @returns Date au format ISO
   */
  private calculateDeadline(days: number, includeHours: boolean = false): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    if (includeHours) {
      // Si on veut préciser l'heure exacte
      return deadline.toISOString();
    } else {
      // Sinon, on met l'heure à 23:59:59
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    }
  }
}

export const orderService = new OrderService();
export default orderService; 