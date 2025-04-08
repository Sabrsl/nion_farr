import { toast } from 'react-toastify';

/**
 * Types pour le système de violation
 */
export type ViolationType = 
  | 'message_inappropriate' 
  | 'contact_external' 
  | 'circumvention_payment' 
  | 'impersonation' 
  | 'fake_reviews' 
  | 'multi_account' 
  | 'abusive_behavior' 
  | 'fraud_attempt' 
  | 'service_misrepresentation' 
  | 'intellectual_property';

export type ViolationSeverity = 'warning' | 'minor' | 'moderate' | 'severe' | 'critical';

export interface Violation {
  id: string;
  userId: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  createdAt: string;
  expiresAt?: string; // Date d'expiration de la violation (si applicable)
  relatedEntityId?: string; // ID de la commande, message, ou service lié
  relatedEntityType?: 'order' | 'message' | 'service' | 'review';
  status: 'active' | 'expired' | 'appealed' | 'dismissed';
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  appealReason?: string;
}

export interface UserViolationStatus {
  userId: string;
  activeViolations: Violation[];
  violationHistory: Violation[];
  currentStatus: 'good_standing' | 'warning' | 'restricted' | 'suspended' | 'banned';
  suspensionHistory: Array<{
    startDate: string;
    endDate?: string;
    reason: string;
    type: 'temporary' | 'permanent';
  }>;
  warningCount: number;
  lastWarningDate?: string;
  totalViolationPoints: number;
  nextReviewDate?: string;
}

/**
 * Service de gestion des violations et suspensions d'utilisateurs
 * Gère le système progressif d'avertissements, restrictions et suspensions
 */
class UserViolationService {
  private apiUrl = '/api/user-violations';

  /**
   * Obtient le statut des violations d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Statut des violations et infractions
   */
  async getUserViolationStatus(userId: string): Promise<UserViolationStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/user/${userId}/status`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut des violations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getUserViolationStatus:', error);
      
      // Retourner un état par défaut en cas d'erreur
      return {
        userId,
        activeViolations: [],
        violationHistory: [],
        currentStatus: 'good_standing',
        suspensionHistory: [],
        warningCount: 0,
        totalViolationPoints: 0
      };
    }
  }

  /**
   * Enregistre une nouvelle violation pour un utilisateur
   * @param userId ID de l'utilisateur
   * @param violationData Données de la violation
   * @returns Résultat de l'opération et actions appliquées
   */
  async recordViolation(
    userId: string,
    violationData: {
      type: ViolationType;
      severity: ViolationSeverity;
      description: string;
      relatedEntityId?: string;
      relatedEntityType?: 'order' | 'message' | 'service' | 'review';
    }
  ): Promise<{
    success: boolean;
    message?: string;
    violationId?: string;
    actionTaken?: 'none' | 'warning' | 'restriction' | 'temporary_suspension' | 'permanent_ban';
    suspensionDuration?: number; // en heures, si applicable
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          ...violationData,
          createdAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la violation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans recordViolation:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'enregistrement de la violation'
      };
    }
  }

  /**
   * Calcule la durée de suspension appropriée basée sur l'historique
   * @param violations Liste des violations de l'utilisateur
   * @param violationType Type de la nouvelle violation
   * @param violationSeverity Sévérité de la nouvelle violation
   * @returns Durée de suspension recommandée en heures (0 = avertissement, -1 = ban permanent)
   */
  calculateSuspensionDuration(
    violations: Violation[],
    violationType: ViolationType,
    violationSeverity: ViolationSeverity
  ): {
    duration: number;  
    actionType: 'none' | 'warning' | 'restriction' | 'temporary_suspension' | 'permanent_ban';
  } {
    // Compter les violations actives par type et sévérité
    const activeViolations = violations.filter(v => v.status === 'active');
    const recentViolations = violations.filter(
      v => new Date(v.createdAt).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
    );
    
    // Nombre total de violations récentes
    const recentViolationCount = recentViolations.length;
    
    // Violations du même type
    const sameTypeViolations = recentViolations.filter(v => v.type === violationType);
    
    // Points de sévérité
    const severityPoints = {
      'warning': 1,
      'minor': 2,
      'moderate': 3,
      'severe': 4,
      'critical': 5
    };
    
    // Points pour cette violation
    const currentViolationPoints = severityPoints[violationSeverity];
    
    // Total des points de violation récents
    const totalRecentPoints = recentViolations.reduce(
      (sum, v) => sum + severityPoints[v.severity], 0
    ) + currentViolationPoints;
    
    // Récidive du même type (facteur aggravant)
    const isRepeatOffense = sameTypeViolations.length > 0;
    
    // Violations critiques
    const hasCriticalViolations = recentViolations.some(v => v.severity === 'critical');
    
    // Logique de détermination de la durée
    if (violationSeverity === 'critical' || (totalRecentPoints >= 15) || 
        (isRepeatOffense && violationSeverity === 'severe')) {
      // Ban permanent pour violations critiques, accumulation de nombreuses violations,
      // ou récidive de violations sévères
      return { duration: -1, actionType: 'permanent_ban' };
    } else if (violationSeverity === 'severe' || totalRecentPoints >= 10) {
      // Suspension longue (7 jours) pour violations sévères ou accumulation
      return { duration: 168, actionType: 'temporary_suspension' }; // 7 jours
    } else if (violationSeverity === 'moderate' || (isRepeatOffense && violationSeverity === 'minor') || 
               totalRecentPoints >= 5) {
      // Suspension moyenne (48h) pour violations modérées, récidives mineures
      return { duration: 48, actionType: 'temporary_suspension' }; // 48 heures
    } else if (violationSeverity === 'minor' || totalRecentPoints >= 3) {
      // Suspension courte (24h) pour violations mineures
      return { duration: 24, actionType: 'temporary_suspension' }; // 24 heures
    } else if (isRepeatOffense || recentViolationCount > 1) {
      // Restriction des fonctionnalités pour récidives d'avertissement
      return { duration: 24, actionType: 'restriction' }; // 24 heures de restriction
    } else {
      // Simple avertissement pour première violation légère
      return { duration: 0, actionType: 'warning' };
    }
  }

  /**
   * Applique une suspension automatique basée sur les violations
   * @param userId ID de l'utilisateur
   * @param reason Raison de la suspension
   * @param duration Durée en heures (0 pour permanent)
   * @returns Succès de l'opération
   */
  async applySuspension(
    userId: string, 
    reason: string, 
    duration: number = 24
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          reason,
          duration,
          appliedAt: new Date().toISOString(),
          expiresAt: duration > 0 
            ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
            : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'application de la suspension');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans applySuspension:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'application de la suspension'
      };
    }
  }

  /**
   * Faire appel d'une violation ou suspension
   * @param violationId ID de la violation
   * @param appealReason Raison de l'appel
   * @returns Résultat de la demande d'appel
   */
  async appealViolation(
    violationId: string,
    appealReason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/appeal/${violationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appealReason,
          appealedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de l\'appel');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans appealViolation:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la soumission de votre appel'
      };
    }
  }

  /**
   * Vérifier si un utilisateur a des violations qui empêchent une action spécifique
   * @param userId ID de l'utilisateur
   * @param actionType Type d'action à vérifier
   * @returns Vrai si l'utilisateur peut effectuer l'action
   */
  async canPerformAction(
    userId: string,
    actionType: 'message' | 'order' | 'withdrawal' | 'review' | 'service_creation'
  ): Promise<{ 
    canPerform: boolean; 
    reason?: string; 
    restrictions?: string[];
    timeRemaining?: number; // en secondes
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/check-action/${userId}?action=${actionType}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification des restrictions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans canPerformAction:', error);
      // Par défaut, autoriser l'action en cas d'erreur
      return { canPerform: true };
    }
  }

  /**
   * Analyser l'évolution des violations d'un utilisateur
   * @param userId ID de l'utilisateur 
   * @returns Analyse des tendances de violation
   */
  async analyzeViolationTrends(userId: string): Promise<{
    improvingBehavior: boolean;
    violationFrequency: 'decreasing' | 'stable' | 'increasing';
    recommendedActions?: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/user/${userId}/trends`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse des tendances');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans analyzeViolationTrends:', error);
      return {
        improvingBehavior: true,
        violationFrequency: 'stable',
        riskLevel: 'low'
      };
    }
  }

  /**
   * Traite les expirations des violations temporaires
   * Vérifie et met à jour le statut des violations arrivées à expiration
   */
  async processViolationExpirations(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/expirations/process`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du traitement des expirations');
      }
    } catch (error) {
      console.error('Erreur dans processViolationExpirations:', error);
    }
  }

  /**
   * Obtient la liste des utilisateurs ayant plusieurs violations
   * @param minViolations Nombre minimum de violations pour être inclus
   * @returns Liste d'IDs des utilisateurs avec multiples violations
   */
  async getUsersWithMultipleViolations(minViolations: number = 3): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/users/multiple-violations?min=${minViolations}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs à violations multiples');
      }
      
      const data = await response.json();
      return data.userIds || [];
    } catch (error) {
      console.error('Erreur dans getUsersWithMultipleViolations:', error);
      return [];
    }
  }

  /**
   * Considère la réduction des sanctions pour un utilisateur s'améliorant
   * @param userId ID de l'utilisateur à évaluer
   * @returns Résultat de l'opération
   */
  async considerViolationReduction(userId: string): Promise<{
    success: boolean;
    reduced: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/user/${userId}/reduce-sanctions`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la considération de réduction des sanctions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans considerViolationReduction:', error);
      return {
        success: false,
        reduced: false,
        message: 'Une erreur est survenue lors de l\'évaluation des sanctions'
      };
    }
  }
}

export const userViolationService = new UserViolationService();
export default userViolationService; 