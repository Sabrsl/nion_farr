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
   * @param clientId ID du client
   * @returns Promesse avec le résultat de la vérification
   */
  async checkServiceAvailability(serviceId: string, clientId: string): Promise<{
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
      
      // Vérifier que le client n'a pas déjà une commande en cours pour ce service
      const activeOrdersResponse = await fetch(`${this.apiUrl}/client/${clientId}/active`);
      const activeOrders = await activeOrdersResponse.json();
      
      const hasActiveOrderForService = activeOrders.some((order: Order) => 
        order.service.id === serviceId && 
        ['en_attente', 'en_attente_acceptation', 'en_cours', 'en_modification', 'livré', 'livraison_en_retard'].includes(order.status)
      );
      
      if (hasActiveOrderForService) {
        return {
          available: false,
          message: 'Vous avez déjà une commande en cours pour ce service. Veuillez terminer votre commande existante avant d\'en passer une nouvelle.'
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
   * @param paymentInfo Informations de paiement
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
    paymentId?: string;
  }> {
    try {
      // 1. Vérifier la disponibilité du service
      const serviceCheck = await this.checkServiceAvailability(serviceId, clientId);
      
      if (!serviceCheck.available) {
        return {
          success: false,
          message: serviceCheck.message
        };
      }
      
      // 2. Initialiser le paiement - obligatoire avant de créer la commande
      const paymentResponse = await this.initializePayment(
        serviceCheck.service!.price,
        clientId,
        serviceId,
        paymentInfo
      );
      
      if (!paymentResponse.success) {
        return {
          success: false,
          message: 'Le paiement est obligatoire pour créer une commande. ' + (paymentResponse.message || 'Échec de l\'initialisation du paiement.'),
          paymentUrl: paymentResponse.paymentUrl
        };
      }
      
      // 3. Vérifier que le paiement est bien effectué (ou initié pour le cas de l'intégration simulée)
      const paymentService = (await import('./paymentService')).default;
      if (paymentResponse.paymentId) {
        const paymentStatus = await paymentService.verifyPaymentStatus(paymentResponse.paymentId);
        
        // Si le paiement n'est pas validé, on retourne l'URL de paiement pour redirection
        if (!paymentStatus.isValid && paymentStatus.status !== 'pending') {
          return {
            success: false,
            message: 'Le paiement doit être complété avant de créer la commande. ' + (paymentStatus.message || ''),
            paymentUrl: paymentResponse.paymentUrl,
            paymentId: paymentResponse.paymentId
          };
        }
      }
      
      // 4. Créer la commande avec statut "en_attente"
      const order: Partial<Order> = {
        title: serviceCheck.service!.title,
        service: serviceCheck.service!,
        client: { id: clientId } as any, // Sera complété par l'API
        status: 'en_attente' as OrderStatus, // La commande est d'abord en attente de paiement
        price: serviceCheck.service!.price,
        requirements,
        isPaid: false,
        // Calculer la date d'échéance en fonction du délai de livraison du service
        // Le délai ne commence qu'une fois la commande acceptée par le vendeur
        deadline: this.calculateDeadline(serviceCheck.service!.deliveryTime),
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        // Pas de délai de validation tant que la commande n'est pas livrée
        deliveryValidationDeadline: null
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
        paymentUrl: paymentResponse.paymentUrl,
        paymentId: paymentResponse.paymentId,
        message: 'Commande créée avec succès. Veuillez compléter le paiement pour finaliser votre commande.'
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
      
      // Vérifier le statut de la commande
      if (order.status !== 'en_cours' && order.status !== 'en_modification' && order.status !== 'livraison_en_retard') {
        return {
          success: false,
          message: `La commande ne peut pas être livrée dans son état actuel (statut: ${order.status})`
        };
      }
      
      // Vérifier si c'est une première livraison ou une livraison après modification
      const isFirstDelivery = !order.deliverables || order.deliverables.length === 0;
      const isAfterRevision = order.status === 'en_modification';
      
      // Créer un nouveau livrable
      const newDeliverable: Deliverable = {
        id: `DEL-${Date.now()}`,
        orderId,
        message: deliverable.message,
        fileUrls: deliverable.fileUrls,
        createdAt: new Date().toISOString(),
        isRevision: isAfterRevision
      };
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'livré' as OrderStatus,
        lastUpdatedAt: new Date().toISOString(),
        deliverables: [...(order.deliverables || []), newDeliverable],
        // Ajouter un délai de 3 jours pour validation automatique
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
        title: isAfterRevision ? 'Révision livrée' : 'Commande livrée',
        message: isAfterRevision 
          ? `Le vendeur a livré la révision demandée pour la commande ${order.title}.` 
          : `Votre commande ${order.title} a été livrée.`,
        type: 'success',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true,
        message: isAfterRevision 
          ? 'La révision a été livrée avec succès. Le client a 3 jours pour valider ou demander une autre révision.'
          : 'La commande a été livrée avec succès. Le client a 3 jours pour valider ou demander une révision.'
      };
    } catch (error) {
      console.error('Erreur lors de la livraison:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la livraison.'
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
      
      // Transférer les fonds au vendeur après déduction de la commission
      const paymentService = (await import('./paymentService')).default;
      const { platformFee, sellerAmount } = paymentService.calculatePlatformFee(order.price);
      
      // Transférer le montant net (après commission) au vendeur avec période de grâce
      await this.transferFundsToSeller(order.id, order.service.provider.id, sellerAmount, true);
      
      // Enregistrer la commission dans le wallet de la plateforme
      await paymentService.createPlatformTransaction(platformFee, order.id);
      
      // Notification au vendeur
      await this.createNotification({
        userId: order.service.provider.id,
        title: 'Commande terminée',
        message: `Le client a approuvé la commande ${order.title}. Les fonds (${sellerAmount} FCFA, après déduction de la commission de ${platformFee} FCFA) seront disponibles après la période de grâce.`,
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
      // Récupérer toutes les commandes actives
      const ordersResponse = await fetch(`${this.apiUrl}/active`);
      const activeOrders = await ordersResponse.json();
      
      const now = new Date();
      
      // Parcourir les commandes pour vérifier les deadlines
      for (const order of activeOrders) {
        // 1. Vérifier les commandes en cours dont la date limite est dépassée
        if (order.status === 'en_cours') {
          const deadline = new Date(order.deadline);
          
          // Si la date limite est dépassée
          if (deadline < now) {
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
        }
        
        // 2. Vérifier les commandes livrées pour validation automatique après 3 jours
        if (order.status === 'livré' && order.deliveryValidationDeadline) {
          const validationDeadline = new Date(order.deliveryValidationDeadline);
          
          // Si la deadline de validation (3 jours) est dépassée
          if (validationDeadline < now) {
            // Validation automatique de la commande
            const updatedOrder = {
              ...order,
              status: 'terminée' as OrderStatus,
              lastUpdatedAt: now.toISOString(),
              deliveryValidationDeadline: null
            };
            
            // Appeler l'API pour mettre à jour la commande
            await fetch(`${this.apiUrl}/${order.id}`, {
              method: 'PUT',
              body: JSON.stringify(updatedOrder)
            });
            
            // Calculer et traiter la commission
            const paymentService = (await import('./paymentService')).default;
            const { platformFee, sellerAmount } = paymentService.calculatePlatformFee(order.price);
            
            // Transférer le montant net au vendeur
            await this.transferFundsToSeller(order.id, order.service.provider.id, sellerAmount, true);
            
            // Enregistrer la commission dans le wallet de la plateforme
            await paymentService.createPlatformTransaction(platformFee, order.id);
            
            // Notification au client
            await this.createNotification({
              userId: order.client.id,
              title: 'Validation automatique',
              message: `La commande ${order.title} a été automatiquement validée après 3 jours sans action de votre part.`,
              type: 'info',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification au vendeur
            await this.createNotification({
              userId: order.service.provider.id,
              title: 'Commande validée automatiquement',
              message: `La commande ${order.title} a été automatiquement validée car le client n'a pas pris d'action dans les 3 jours suivant la livraison. Les fonds (${sellerAmount} FCFA, après déduction de la commission de ${platformFee} FCFA) seront disponibles après la période de grâce.`,
              type: 'success',
              link: `/dashboard/orders/${order.id}`
            });
          } else {
            // Si la deadline approche (moins de 24h), envoyer un rappel au client
            const hoursRemaining = (validationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursRemaining <= 24 && !order.reminderSent) {
              // Marquer le rappel comme envoyé
              const updatedOrder = {
                ...order,
                reminderSent: true,
                lastUpdatedAt: now.toISOString()
              };
              
              // Mettre à jour la commande
              await fetch(`${this.apiUrl}/${order.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedOrder)
              });
              
              // Envoyer un rappel au client
              await this.createNotification({
                userId: order.client.id,
                title: 'Action requise - Validation de livraison',
                message: `Votre commande ${order.title} sera automatiquement validée dans moins de 24h si vous ne prenez aucune action. Veuillez valider la livraison ou demander une révision.`,
                type: 'warning',
                link: `/dashboard/orders/${order.id}`
              });
            }
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
   * @param reason Raison du litige
   * @param details Détails du litige
   * @param attachments Pièces jointes
   */
  async openDispute(
    orderId: string,
    reason: string,
    details: string,
    attachments?: File[]
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Vérifications
      if (!this.isUserLoggedIn()) {
        return { success: false, message: 'Vous devez être connecté pour ouvrir un litige' };
      }

      // Vérifier que la commande existe
      const order = await this.getOrderById(orderId);
      if (!order) {
        return { success: false, message: 'Commande introuvable' };
      }

      // Vérifier que l'utilisateur est le client de la commande
      const user = this.getCurrentUser();
      if (order.client.id !== user.id) {
        return { success: false, message: 'Seul le client peut ouvrir un litige' };
      }
      
      // Vérifier que la commande est en statut adéquat
      if (!this.canOpenDispute(order.status)) {
        return { success: false, message: 'Impossible d\'ouvrir un litige avec ce statut de commande' };
      }
      
      // Vérifier que le client fournit soit une description détaillée, soit des pièces jointes
      if ((!details || details.trim().length < 20) && (!attachments || attachments.length === 0)) {
        return { 
          success: false, 
          message: 'Veuillez fournir soit une description détaillée du problème, soit des pièces jointes justificatives'
        };
      }

      // Appeler le service de litiges
      const disputeService = await import('./disputeService').then(m => m.default);
      const result = await disputeService.onDisputeOpened(
        orderId,
        user.id,
        reason,
        details,
        attachments
      );
      
      if (result.success) {
        // Mettre à jour le statut de la commande localement
        this.updateLocalOrderStatus(orderId, 'DISPUTED');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du litige:', error);
      return { success: false, message: 'Une erreur est survenue lors de l\'ouverture du litige' };
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

  /**
   * Vérifie si l'utilisateur est connecté
   * @private
   */
  private isUserLoggedIn(): boolean {
    // Simuler une vérification d'authentification
    const user = this.getCurrentUser();
    return !!user;
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @private
   */
  private getCurrentUser(): User {
    // Simuler la récupération de l'utilisateur connecté depuis le localStorage ou un contexte
    // Dans une vraie implémentation, cela viendrait d'un contexte d'authentification
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    // Utilisateur fictif pour les tests
    return {
      id: 'USR-1234',
      name: 'Utilisateur de test',
      email: 'test@example.com',
      role: 'client'
    } as User;
  }

  /**
   * Récupère une commande par son ID
   * @param orderId ID de la commande
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch(`${this.apiUrl}/${orderId}`);
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return null;
    }
  }

  /**
   * Vérifie si une commande peut recevoir un litige
   * @private
   */
  private canOpenDispute(orderStatus: OrderStatus): boolean {
    // Une commande peut recevoir un litige si elle est livrée, en cours, ou terminée
    return ['livré', 'en_cours', 'terminé'].includes(orderStatus);
  }

  /**
   * Met à jour le statut d'une commande localement (sans appel API)
   * Utile pour des mises à jour UI immédiates
   * @private
   */
  private updateLocalOrderStatus(orderId: string, newStatus: string): void {
    // Dans une vraie implémentation, cela pourrait mettre à jour un store local
    console.log(`Mise à jour locale du statut de la commande ${orderId} : ${newStatus}`);
    
    // Émettre un événement pour les composants qui écoutent les changements
    const event = new CustomEvent('order_status_update', {
      detail: { orderId, status: newStatus }
    });
    window.dispatchEvent(event);
  }

  /**
   * Récupère les statistiques de commande d'un freelancer
   * @param freelancerId ID du freelancer
   * @returns Statistiques des commandes du freelancer
   */
  async getFreelancerOrderStats(freelancerId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    inProgressOrders: number;
    disputedOrders: number;
    orderCompletionRate: number;
    averageCompletionTime: number; // en jours
    revenueStats: {
      total: number;
      lastMonth: number;
      lastWeek: number;
    };
  }> {
    try {
      // Simuler un délai d'appel à l'API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Dans une implémentation réelle, nous ferions un appel API
      // pour récupérer ces données depuis la base de données
      
      // Générer des données simulées pour la démonstration
      const totalOrders = 10 + Math.floor(Math.random() * 40); // Entre 10 et 50 commandes
      const completedOrders = Math.floor(totalOrders * (0.7 + Math.random() * 0.25)); // Entre 70% et 95%
      const cancelledOrders = Math.floor(totalOrders * (0.02 + Math.random() * 0.08)); // Entre 2% et 10%
      const disputedOrders = Math.floor(totalOrders * (0.01 + Math.random() * 0.07)); // Entre 1% et 8%
      const inProgressOrders = totalOrders - completedOrders - cancelledOrders;
      
      const orderCompletionRate = completedOrders / totalOrders;
      const averageCompletionTime = 1 + Math.random() * 4; // Entre 1 et 5 jours
      
      // Statistiques de revenus
      const avgOrderValue = 15000 + Math.random() * 35000; // Entre 15000 et 50000 FCFA
      const totalRevenue = Math.round(completedOrders * avgOrderValue);
      const lastMonthOrders = Math.floor(completedOrders * (0.1 + Math.random() * 0.2)); // Entre 10% et 30% du total
      const lastWeekOrders = Math.floor(lastMonthOrders * (0.1 + Math.random() * 0.3)); // Entre 10% et 40% du mois
      
      return {
        totalOrders,
        completedOrders,
        cancelledOrders,
        inProgressOrders,
        disputedOrders,
        orderCompletionRate,
        averageCompletionTime,
        revenueStats: {
          total: totalRevenue,
          lastMonth: Math.round(lastMonthOrders * avgOrderValue),
          lastWeek: Math.round(lastWeekOrders * avgOrderValue)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de commandes:', error);
      return {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        inProgressOrders: 0,
        disputedOrders: 0,
        orderCompletionRate: 0,
        averageCompletionTime: 0,
        revenueStats: {
          total: 0,
          lastMonth: 0,
          lastWeek: 0
        }
      };
    }
  }

  /**
   * Vérifie les commandes dont le vendeur n'a pas répondu sous 24h
   * Cette méthode serait idéalement exécutée par un cron job toutes les heures
   */
  async checkSellerResponseTime(): Promise<void> {
    try {
      // Récupérer les commandes en attente d'acceptation
      const pendingOrdersResponse = await fetch(`${this.apiUrl}/pending-acceptance`);
      const pendingOrders = await pendingOrdersResponse.json();
      
      const now = new Date();
      
      // Parcourir les commandes en attente d'acceptation
      for (const order of pendingOrders) {
        if (order.status !== 'en_attente_acceptation') continue;
        
        // Vérifier si la commande a été créée il y a plus de 24h
        const orderCreatedAt = new Date(order.isPaid ? order.lastUpdatedAt : order.createdAt);
        const timeDiffHours = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);
        
        // Si cela fait plus de 24h sans réponse du vendeur
        if (timeDiffHours >= 24) {
          // Marquer que le vendeur a été averti (si ce n'est pas déjà fait)
          if (!order.sellerAlerted) {
            // Mettre à jour la commande pour indiquer que le vendeur a été averti
            const updatedOrder = {
              ...order,
              sellerAlerted: true,
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
              title: 'Action requise - Commande en attente',
              message: `La commande ${order.title} est en attente de votre acceptation depuis plus de 24h. Veuillez accepter ou refuser rapidement.`,
              type: 'warning',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification au client
            await this.createNotification({
              userId: order.client.id,
              title: 'Vendeur notifié',
              message: `Le vendeur a été notifié de votre commande ${order.title} qui est en attente depuis plus de 24h.`,
              type: 'info',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification à l'administration (pour suivi)
            await this.createNotification({
              userId: 'admin', // ID de l'admin général ou système
              title: 'Vendeur non-réactif',
              message: `Le vendeur ${order.service.provider.name} n'a pas répondu à la commande ${order.id} (${order.title}) depuis plus de 24h.`,
              type: 'warning',
              link: `/admin/orders/${order.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des temps de réponse des vendeurs:', error);
    }
  }
}

// Création d'une instance singleton du service
const orderService = new OrderService();
export default orderService; 