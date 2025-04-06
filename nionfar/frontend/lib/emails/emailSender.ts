import { emailService } from './emailService';
import { EmailEventType } from './emailConfig';

/**
 * Utilitaire pour faciliter l'envoi d'emails depuis différentes parties de l'application
 */
export const emailSender = {
  /**
   * Envoie un email de confirmation de commande
   * @param orderData Données de la commande
   */
  async sendOrderCreatedEmail(orderData: {
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    servicePrice: number;
    serviceFee: number;
    totalAmount: number;
    paymentMethod: string;
    sellerId: string;
    sellerName: string;
    estimatedDelivery: string;
  }): Promise<boolean> {
    try {
      const orderLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn'}/dashboard/client/orders/${orderData.orderId}`;
      
      const result = await emailService.sendEventEmail(EmailEventType.ORDER_CREATED, {
        recipient: {
          email: orderData.clientEmail,
          name: orderData.clientName,
        },
        templateData: {
          clientName: orderData.clientName,
          clientEmail: orderData.clientEmail,
          orderNumber: orderData.orderNumber,
          serviceName: orderData.serviceName,
          servicePrice: orderData.servicePrice,
          serviceFee: orderData.serviceFee,
          totalAmount: orderData.totalAmount,
          paymentMethod: orderData.paymentMethod,
          sellerName: orderData.sellerName,
          estimatedDelivery: orderData.estimatedDelivery,
          orderLink,
        },
      });
      
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation de commande', error);
      return false;
    }
  },

  /**
   * Envoie un email de confirmation de paiement
   * @param paymentData Données du paiement
   */
  async sendPaymentReceivedEmail(paymentData: {
    transactionId: string;
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
  }): Promise<boolean> {
    try {
      const orderLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn'}/dashboard/client/orders/${paymentData.orderId}`;
      
      const result = await emailService.sendEventEmail(EmailEventType.PAYMENT_RECEIVED, {
        recipient: {
          email: paymentData.clientEmail,
          name: paymentData.clientName,
        },
        templateData: {
          clientName: paymentData.clientName,
          clientEmail: paymentData.clientEmail,
          orderNumber: paymentData.orderNumber,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentData.paymentDate,
          serviceName: paymentData.serviceName,
          orderLink,
        },
      });
      
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation de paiement', error);
      return false;
    }
  },

  /**
   * Envoie un email de notification de livraison
   * @param deliveryData Données de la livraison
   */
  async sendOrderDeliveredEmail(deliveryData: {
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    sellerId: string;
    sellerName: string;
    deliveryDate: Date;
    deliveryMessage?: string;
  }): Promise<boolean> {
    try {
      const orderLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn'}/dashboard/client/orders/${deliveryData.orderId}`;
      
      const result = await emailService.sendEventEmail(EmailEventType.ORDER_DELIVERED, {
        recipient: {
          email: deliveryData.clientEmail,
          name: deliveryData.clientName,
        },
        templateData: {
          clientName: deliveryData.clientName,
          clientEmail: deliveryData.clientEmail,
          orderNumber: deliveryData.orderNumber,
          serviceName: deliveryData.serviceName,
          sellerName: deliveryData.sellerName,
          deliveryDate: deliveryData.deliveryDate,
          deliveryMessage: deliveryData.deliveryMessage,
          orderLink,
        },
      });
      
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de notification de livraison', error);
      return false;
    }
  },

  /**
   * Envoie un email générique en fonction du type d'événement
   * @param eventType Type d'événement
   * @param recipient Destinataire de l'email
   * @param templateData Données pour le template
   * @param customSubject Sujet personnalisé (optionnel)
   */
  async sendGenericEmail(
    eventType: EmailEventType,
    recipient: { email: string; name?: string },
    templateData: Record<string, any>,
    customSubject?: string
  ): Promise<boolean> {
    try {
      const result = await emailService.sendEventEmail(eventType, {
        recipient,
        templateData,
        customSubject,
      });
      
      return result.success;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de type ${eventType}`, error);
      return false;
    }
  },

  /**
   * Envoie un email de test à l'adresse spécifiée
   * @param email Adresse email du destinataire
   */
  async sendTestEmail(email: string): Promise<boolean> {
    try {
      const result = await emailService.sendEventEmail(EmailEventType.ACCOUNT_VERIFICATION, {
        recipient: {
          email,
          name: 'Utilisateur de test'
        },
        templateData: {
          userName: 'Utilisateur de test',
          verificationCode: '123456',
          expirationHours: 24,
          loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn'}/auth/login`
        },
        customSubject: 'Email de test Nionfar'
      });
      
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de test', error);
      return false;
    }
  }
}; 