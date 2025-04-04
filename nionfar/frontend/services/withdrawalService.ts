import { toast } from 'react-toastify';
import { User, Withdrawal } from '../types';

class WithdrawalService {
  private apiUrl = '/api/withdrawals'; // URL fictive
  private minWithdrawalAmount = 2000; // Montant minimum de retrait en FCFA
  
  /**
   * Demande de retrait
   * @param userId ID de l'utilisateur
   * @param amount Montant à retirer
   * @param method Méthode de paiement
   * @param accountDetails Détails du compte pour le virement
   */
  async onWithdrawalRequested(
    userId: string,
    amount: number,
    method: 'bank_transfer' | 'mobile_money',
    accountDetails: {
      type: string;
      number: string;
      name: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    withdrawal?: Withdrawal;
  }> {
    try {
      // 1. Vérifier le solde disponible
      const balance = await this.getUserAvailableBalance(userId);
      if (balance < amount) {
        return {
          success: false,
          message: `Solde insuffisant. Disponible: ${balance} FCFA`
        };
      }
      
      // 2. Vérifier le montant minimum
      if (amount < this.minWithdrawalAmount) {
        return {
          success: false,
          message: `Le montant minimum de retrait est de ${this.minWithdrawalAmount} FCFA`
        };
      }
      
      // 3. Vérifier l'éligibilité au retrait
      const eligibilityCheck = await this.checkWithdrawalEligibility(userId);
      if (!eligibilityCheck.eligible) {
        return {
          success: false,
          message: eligibilityCheck.reason
        };
      }
      
      // 4. Créer la demande de retrait
      const withdrawalData = {
        userId,
        amount,
        method,
        accountDetails,
        status: 'en_attente',
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify(withdrawalData)
      });
      
      const withdrawal = await response.json();
      
      // 5. Notifier l'administrateur
      await this.notifyAdminAboutWithdrawal(withdrawal.id, userId, amount);
      
      return {
        success: true,
        withdrawal
      };
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la demande de retrait'
      };
    }
  }
  
  /**
   * Vérifie si le compte de l'utilisateur est vérifié
   * @private
   */
  private async isAccountVerified(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}/verification-status`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.status === 'verified';
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du compte:', error);
      return false;
    }
  }
  
  /**
   * Vérifie l'éligibilité au retrait
   * @param userId ID de l'utilisateur
   */
  async checkWithdrawalEligibility(userId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      // 0. Vérifier que le compte est vérifié
      const isVerified = await this.isAccountVerified(userId);
      if (!isVerified) {
        return {
          eligible: false,
          reason: 'Votre compte doit être vérifié pour effectuer des retraits. Veuillez compléter le processus de vérification dans les paramètres de votre compte.'
        };
      }
      
      // 1. Vérifier qu'il n'y a pas eu de retrait dans les dernières 24h
      const lastWithdrawal = await this.getLastWithdrawal(userId);
      if (lastWithdrawal) {
        const lastWithdrawalDate = new Date(lastWithdrawal.createdAt);
        const now = new Date();
        const hoursDifference = (now.getTime() - lastWithdrawalDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDifference < 24) {
          return {
            eligible: false,
            reason: `Vous ne pouvez effectuer qu'un seul retrait par 24h. Prochain retrait possible dans ${Math.ceil(24 - hoursDifference)}h.`
          };
        }
      }
      
      // 2. Vérifier que le compte est actif
      const userStatus = await this.getUserStatus(userId);
      if (userStatus !== 'active') {
        return {
          eligible: false,
          reason: 'Votre compte est actuellement inactif. Veuillez contacter le support.'
        };
      }
      
      // 3. Vérifier qu'il n'y a pas de litige actif
      const hasActiveDispute = await this.hasActiveDispute(userId);
      if (hasActiveDispute) {
        return {
          eligible: false,
          reason: 'Vous avez un litige actif. Les retraits sont temporairement bloqués jusqu\'à résolution.'
        };
      }
      
      return {
        eligible: true
      };
    } catch (error) {
      console.error('Erreur lors de la vérification d\'éligibilité:', error);
      return {
        eligible: false,
        reason: 'Une erreur est survenue lors de la vérification d\'éligibilité'
      };
    }
  }
  
  /**
   * Validation d'une demande de retrait par l'admin
   * @param withdrawalId ID du retrait
   * @param adminId ID de l'admin
   * @param transactionDetails Détails de la transaction (preuve de virement, etc.)
   */
  async onWithdrawalValidated(
    withdrawalId: string,
    adminId: string,
    transactionDetails: {
      reference: string;
      processedAt: string;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Récupérer les informations du retrait
      const withdrawal = await this.getWithdrawalDetails(withdrawalId);
      if (!withdrawal) {
        return {
          success: false,
          message: 'Retrait non trouvé'
        };
      }
      
      if (withdrawal.status !== 'en_attente') {
        return {
          success: false,
          message: `Ce retrait ne peut pas être validé (statut actuel: ${withdrawal.status})`
        };
      }
      
      // 2. Mettre à jour le statut du retrait
      const updatedWithdrawal = {
        ...withdrawal,
        status: 'validé',
        processedAt: new Date().toISOString(),
        processedBy: adminId,
        transactionDetails
      };
      
      await fetch(`${this.apiUrl}/${withdrawalId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedWithdrawal)
      });
      
      // 3. Notifier le vendeur
      await this.notifyUser(
        withdrawal.userId,
        'Retrait validé',
        `Votre demande de retrait de ${withdrawal.amount} FCFA a été traitée. Les fonds ont été envoyés vers votre compte.`,
        'success'
      );
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la validation du retrait:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la validation du retrait'
      };
    }
  }
  
  /**
   * Rejet d'une demande de retrait
   * @param withdrawalId ID du retrait
   * @param adminId ID de l'admin
   * @param reason Motif du rejet
   */
  async onWithdrawalRejected(
    withdrawalId: string,
    adminId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 1. Récupérer les informations du retrait
      const withdrawal = await this.getWithdrawalDetails(withdrawalId);
      if (!withdrawal) {
        return {
          success: false,
          message: 'Retrait non trouvé'
        };
      }
      
      if (withdrawal.status !== 'en_attente') {
        return {
          success: false,
          message: `Ce retrait ne peut pas être rejeté (statut actuel: ${withdrawal.status})`
        };
      }
      
      if (!reason) {
        return {
          success: false,
          message: 'Un motif de rejet est obligatoire'
        };
      }
      
      // 2. Mettre à jour le statut du retrait
      const updatedWithdrawal = {
        ...withdrawal,
        status: 'rejeté',
        processedAt: new Date().toISOString(),
        processedBy: adminId,
        rejectionReason: reason
      };
      
      await fetch(`${this.apiUrl}/${withdrawalId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedWithdrawal)
      });
      
      // 3. Recréditer les fonds au vendeur
      await this.redeemFundsToUser(withdrawal.userId, withdrawal.amount);
      
      // 4. Notifier le vendeur
      await this.notifyUser(
        withdrawal.userId,
        'Retrait rejeté',
        `Votre demande de retrait de ${withdrawal.amount} FCFA a été rejetée pour la raison suivante: ${reason}. Les fonds ont été recrédités sur votre compte.`,
        'warning'
      );
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du rejet du retrait:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors du rejet du retrait'
      };
    }
  }
  
  /**
   * Récupère le solde disponible d'un utilisateur
   * @private
   */
  private async getUserAvailableBalance(userId: string): Promise<number> {
    try {
      const response = await fetch(`/api/users/${userId}/earnings/available`);
      const data = await response.json();
      return data.availableBalance || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      return 0;
    }
  }
  
  /**
   * Récupère le dernier retrait d'un utilisateur
   * @private
   */
  private async getLastWithdrawal(userId: string): Promise<Withdrawal | null> {
    try {
      const response = await fetch(`${this.apiUrl}/user/${userId}/last`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier retrait:', error);
      return null;
    }
  }
  
  /**
   * Récupère le statut d'un utilisateur
   * @private
   */
  private async getUserStatus(userId: string): Promise<string> {
    try {
      const response = await fetch(`/api/users/${userId}/status`);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de l\'utilisateur:', error);
      return 'inactive';
    }
  }
  
  /**
   * Vérifie si l'utilisateur a un litige actif
   * @private
   */
  private async hasActiveDispute(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}/disputes/active`);
      const data = await response.json();
      return data.hasActiveDispute || false;
    } catch (error) {
      console.error('Erreur lors de la vérification des litiges:', error);
      return false;
    }
  }
  
  /**
   * Récupère les détails d'un retrait
   * @private
   */
  private async getWithdrawalDetails(withdrawalId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/${withdrawalId}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du retrait:', error);
      return null;
    }
  }
  
  /**
   * Recrédite les fonds à un utilisateur
   * @private
   */
  private async redeemFundsToUser(userId: string, amount: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}/earnings/credit`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          reason: 'Retrait rejeté - fonds recrédités'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur lors du recrédit des fonds:', error);
      return false;
    }
  }
  
  /**
   * Notifie l'administrateur d'une demande de retrait
   * @private
   */
  private async notifyAdminAboutWithdrawal(withdrawalId: string, userId: string, amount: number): Promise<void> {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'withdrawal_request',
          withdrawalId,
          userId,
          amount,
          priority: amount > 100000 ? 'high' : 'normal'
        })
      });
    } catch (error) {
      console.error('Erreur lors de la notification de l\'administrateur:', error);
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
}

// Exporter une instance unique du service
const withdrawalService = new WithdrawalService();
export default withdrawalService;