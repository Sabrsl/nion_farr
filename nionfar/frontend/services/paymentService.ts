import { toast } from 'react-toastify';
import { User } from '../types';

class PaymentService {
  private apiUrl = '/api/payments'; // URL fictive
  private fee = 0.2; // 20% de commission par défaut

  /**
   * Valide un paiement et crédite le wallet virtuel
   * @param paymentId ID du paiement
   * @param amount Montant du paiement
   * @param userId ID de l'utilisateur
   * @param orderId ID de la commande associée
   */
  async onPaymentValidated(
    paymentId: string,
    amount: number,
    userId: string,
    orderId: string
  ): Promise<{
    success: boolean;
    message?: string;
    transactionId?: string;
  }> {
    try {
      // 1. Créditer le wallet virtuel sécurisé
      await this.creditSecuredWallet(orderId, amount);
      
      // 2. Calculer la commission de la plateforme
      const { platformFee, sellerAmount } = this.calculatePlatformFee(amount);
      
      // 3. Créer une transaction pour la plateforme
      await this.createPlatformTransaction(platformFee, orderId);
      
      // 4. Notifier l'administrateur pour vérification (si nécessaire)
      this.notifyAdminForVerification(paymentId, amount, userId);
      
      // 5. Mettre à jour le statut du paiement
      const transactionId = `TRX-${Date.now()}`;
      await fetch(`${this.apiUrl}/${paymentId}/validate`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'completed',
          transactionId,
          platformFee,
          sellerAmount
        })
      });
      
      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('Erreur lors de la validation du paiement:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la validation du paiement'
      };
    }
  }
  
  /**
   * Calcule la commission de la plateforme
   * @param amount Montant total
   * @returns Objet contenant la commission et le montant net pour le vendeur
   */
  calculatePlatformFee(amount: number): {
    platformFee: number;
    sellerAmount: number;
  } {
    const platformFee = Math.round(amount * this.fee);
    const sellerAmount = amount - platformFee;
    
    return {
      platformFee,
      sellerAmount
    };
  }
  
  /**
   * Gère l'échec d'un paiement
   * @param paymentId ID du paiement
   * @param orderId ID de la commande
   * @param reason Raison de l'échec
   */
  async onPaymentFailed(
    paymentId: string,
    orderId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Mettre à jour le statut du paiement
      await fetch(`${this.apiUrl}/${paymentId}/fail`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'failed',
          failureReason: reason
        })
      });
      
      // 2. Annuler la commande
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Échec du paiement: ' + reason
        })
      });
      
      // 3. Notifier l'utilisateur
      const order = await this.getOrderDetails(orderId);
      if (order && order.client) {
        await this.notifyUser(
          order.client.id,
          'Échec de paiement',
          `Le paiement pour la commande #${orderId} a échoué: ${reason}`,
          'error'
        );
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du traitement de l\'échec du paiement:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors du traitement de l\'échec du paiement'
      };
    }
  }
  
  /**
   * Crédite le wallet virtuel sécurisé
   * @private
   */
  private async creditSecuredWallet(orderId: string, amount: number): Promise<boolean> {
    try {
      // Simuler un appel API
      const response = await fetch('/api/wallet/secure-credit', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          amount,
          securityKey: process.env.WALLET_SECURITY_KEY // Clé de sécurité (fictive)
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erreur lors du crédit du wallet sécurisé:', error);
      return false;
    }
  }
  
  /**
   * Crée une transaction pour la commission de la plateforme
   */
  async createPlatformTransaction(amount: number, orderId: string): Promise<void> {
    try {
      await fetch('/api/transactions/platform', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          type: 'commission',
          orderId,
          description: `Commission pour la commande #${orderId}`
        })
      });
    } catch (error) {
      console.error('Erreur lors de la création de la transaction pour la plateforme:', error);
    }
  }
  
  /**
   * Notifie l'administrateur pour vérification
   * @private
   */
  private notifyAdminForVerification(paymentId: string, amount: number, userId: string): void {
    // En environnement de production, ceci pourrait envoyer une alerte 
    // ou ajouter l'entrée à une file d'attente pour vérification
    console.log(`Paiement à vérifier: ID=${paymentId}, Montant=${amount}, Utilisateur=${userId}`);
    
    // Si le montant dépasse un certain seuil, notifier l'admin
    if (amount > 100000) { // 100 000 FCFA
      fetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'payment_verification',
          paymentId,
          amount,
          userId,
          priority: 'high'
        })
      });
    }
  }
  
  /**
   * Obtient les détails d'une commande
   * @private
   */
  private async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      return null;
    }
  }
  
  /**
   * Notifie un utilisateur
   * @private
   */
  private async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          title,
          message,
          type
        })
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  }

  /**
   * Vérifie si un paiement est valide et complet
   * @param paymentId ID du paiement à vérifier
   * @returns Statut de la vérification du paiement
   */
  async verifyPaymentStatus(paymentId: string): Promise<{
    isValid: boolean;
    status: string;
    message?: string;
  }> {
    try {
      // Simuler un appel à l'API de paiement
      const response = await fetch(`${this.apiUrl}/${paymentId}/status`);
      
      if (!response.ok) {
        return {
          isValid: false,
          status: 'error',
          message: 'Erreur lors de la vérification du paiement'
        };
      }
      
      const paymentData = await response.json();
      
      // Vérifier le statut du paiement
      if (paymentData.status === 'validé' || paymentData.status === 'completed') {
        return {
          isValid: true,
          status: 'success',
          message: 'Paiement validé'
        };
      } else if (paymentData.status === 'en_attente' || paymentData.status === 'pending') {
        return {
          isValid: false,
          status: 'pending',
          message: 'Paiement en cours de traitement'
        };
      } else {
        return {
          isValid: false,
          status: 'failed',
          message: paymentData.failureReason || 'Échec du paiement'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du paiement:', error);
      return {
        isValid: false,
        status: 'error',
        message: 'Erreur technique lors de la vérification du paiement'
      };
    }
  }
}

export default new PaymentService(); 