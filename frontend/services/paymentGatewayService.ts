/**
 * Service d'intégration pour les passerelles de paiement
 * Ce service gère les intégrations avec Wave, Orange Money et autres systèmes de paiement
 */

interface PaymentResponse {
  success: boolean;
  referenceId?: string;
  message?: string;
  redirectUrl?: string;
  status?: 'pending' | 'success' | 'failed';
}

interface WavePaymentParams {
  phoneNumber: string;
  amount: number;
  description: string;
  orderId: string;
}

interface OrangeMoneyPaymentParams {
  phoneNumber: string;
  amount: number;
  description: string;
  orderId: string;
}

class PaymentGatewayService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  /**
   * Initialise un paiement Wave
   * @param params Paramètres nécessaires pour le paiement Wave
   * @returns Résultat de l'initialisation du paiement
   */
  async initiateWavePayment(params: WavePaymentParams): Promise<PaymentResponse> {
    try {
      // Vérifier que le numéro de téléphone est au format sénégalais
      if (!this.isValidSenegalPhone(params.phoneNumber)) {
        return {
          success: false,
          message: 'Numéro de téléphone invalide. Veuillez entrer un numéro Wave valide au Sénégal.'
        };
      }

      // Appel à l'API pour démarrer le paiement Wave
      const response = await fetch(`${this.apiBaseUrl}/api/payments/wave/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: params.phoneNumber,
          amount: params.amount,
          description: params.description,
          orderId: params.orderId,
          currency: 'XOF' // Devise par défaut pour le Sénégal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur lors de l\'initialisation du paiement Wave:', data);
        return {
          success: false,
          message: data.message || 'Une erreur est survenue lors de l\'initialisation du paiement Wave.'
        };
      }

      return {
        success: true,
        referenceId: data.referenceId,
        status: 'pending',
        message: 'Paiement Wave en cours. Veuillez vérifier votre téléphone pour confirmer le paiement.'
      };
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'API Wave:', error);
      return {
        success: false,
        message: 'Une erreur de communication est survenue. Veuillez réessayer.'
      };
    }
  }

  /**
   * Initialise un paiement Orange Money
   * @param params Paramètres nécessaires pour le paiement Orange Money
   * @returns Résultat de l'initialisation du paiement
   */
  async initiateOrangeMoneyPayment(params: OrangeMoneyPaymentParams): Promise<PaymentResponse> {
    try {
      // Vérifier que le numéro de téléphone est au format sénégalais
      if (!this.isValidSenegalPhone(params.phoneNumber)) {
        return {
          success: false,
          message: 'Numéro de téléphone invalide. Veuillez entrer un numéro Orange Money valide au Sénégal.'
        };
      }

      // Appel à l'API pour démarrer le paiement Orange Money
      const response = await fetch(`${this.apiBaseUrl}/api/payments/orange-money/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: params.phoneNumber,
          amount: params.amount,
          description: params.description,
          orderId: params.orderId,
          currency: 'XOF' // Devise par défaut pour le Sénégal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur lors de l\'initialisation du paiement Orange Money:', data);
        return {
          success: false,
          message: data.message || 'Une erreur est survenue lors de l\'initialisation du paiement Orange Money.'
        };
      }

      return {
        success: true,
        referenceId: data.referenceId,
        status: 'pending',
        message: 'Paiement Orange Money en cours. Veuillez vérifier votre téléphone pour confirmer le paiement.'
      };
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'API Orange Money:', error);
      return {
        success: false,
        message: 'Une erreur de communication est survenue. Veuillez réessayer.'
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement mobile
   * @param referenceId ID de référence du paiement
   * @param provider Fournisseur de paiement ('wave' ou 'orange')
   * @returns Le statut actuel du paiement
   */
  async checkPaymentStatus(referenceId: string, provider: 'wave' | 'orange'): Promise<PaymentResponse> {
    try {
      const endpoint = provider === 'wave' 
        ? '/api/payments/wave/status' 
        : '/api/payments/orange-money/status';
      
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceId })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Impossible de vérifier le statut du paiement ${provider}.`
        };
      }

      return {
        success: true,
        status: data.status,
        message: data.message
      };
    } catch (error) {
      console.error(`Erreur lors de la vérification du statut du paiement ${provider}:`, error);
      return {
        success: false,
        message: 'Une erreur de communication est survenue lors de la vérification du paiement.'
      };
    }
  }

  /**
   * Valide si un numéro de téléphone est au format sénégalais
   * @param phone Numéro de téléphone à valider
   * @returns true si le format est valide
   */
  private isValidSenegalPhone(phone: string): boolean {
    // Format sénégalais: +221 77/78/76/70 XXX XX XX ou 77/78/76/70XXXXXXX
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+221/, '');
    const regex = /^(77|78|76|70)\d{7}$/;
    return regex.test(cleanPhone);
  }
}

export const paymentGatewayService = new PaymentGatewayService(); 