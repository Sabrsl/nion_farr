import { 
  FreelancerRanking, 
  RankingFactor, 
  DisputeHistory, 
  FreelancerOrderStats, 
  User 
} from '../types';

import disputeService from './disputeService';
import orderService from './orderService';
import reviewService from './reviewService';
import securityService from './securityService';

/**
 * Service pour gérer le classement des freelancers
 */
class RankingService {
  /**
   * Calcule le classement complet d'un freelancer
   * @param userId ID du freelancer
   * @returns Classement détaillé du freelancer
   */
  async calculateFreelancerRanking(userId: string): Promise<FreelancerRanking> {
    try {
      // Récupérer toutes les données nécessaires
      const disputeHistory = await disputeService.getFreelancerDisputeHistory(userId);
      const orderStats = await orderService.getFreelancerOrderStats(userId);
      const reliabilityScore = await reviewService.calculateReliabilityScore(userId);
      const verificationStatus = await securityService.getUserVerificationStatus(userId);
      
      // Calculer les scores individuels
      // 1. Score basé sur l'historique des litiges
      const disputeScore = this.calculateDisputeScore(disputeHistory, orderStats);
      
      // 2. Score basé sur la qualité (évaluations)
      const qualityScore = this.calculateQualityScore(reliabilityScore);
      
      // 3. Score basé sur les délais de livraison
      const deliveryScore = this.calculateDeliveryScore(orderStats);
      
      // 4. Score basé sur le temps de réponse
      const responseScore = this.calculateResponseScore(userId);
      
      // 5. Bonus de vérification
      const verificationBonus = this.calculateVerificationBonus(verificationStatus);
      
      // Calculer le score global (pondéré)
      const overallScore = Math.round(
        (disputeScore * 0.25) +
        (qualityScore * 0.35) +
        (deliveryScore * 0.20) +
        (responseScore * 0.15) +
        verificationBonus
      );
      
      // Déterminer le niveau (tier) du freelancer
      const tier = this.determineTier(overallScore, disputeHistory);
      
      // Position fictive (à remplacer par une vraie logique de classement)
      const position = Math.ceil(Math.random() * 100);
      const categoryPosition = Math.ceil(Math.random() * 25);
      
      return {
        userId,
        overallScore,
        reliabilityScore: reliabilityScore.score,
        qualityScore,
        deliveryScore,
        responseScore,
        verificationBonus,
        tier,
        position,
        categoryPosition,
        disputeStats: {
          totalDisputes: disputeHistory.totalDisputes,
          resolvedInFavor: disputeHistory.resolvedInFavor,
          resolvedAgainst: disputeHistory.resolvedAgainst,
          disputeRatio: orderStats.totalOrders > 0 ? disputeHistory.totalDisputes / orderStats.totalOrders : 0
        },
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors du calcul du classement du freelancer:', error);
      // Retourner un classement par défaut en cas d'erreur
      return {
        userId,
        overallScore: 50,
        reliabilityScore: 50,
        qualityScore: 50,
        deliveryScore: 50,
        responseScore: 50,
        verificationBonus: 0,
        tier: 'nouveau',
        position: 999,
        disputeStats: {
          totalDisputes: 0,
          resolvedInFavor: 0,
          resolvedAgainst: 0,
          disputeRatio: 0
        },
        updatedAt: new Date().toISOString()
      };
    }
  }
  
  /**
   * Récupère les facteurs de classement d'un freelancer
   * @param userId ID du freelancer
   * @returns Liste des facteurs qui composent le score du freelancer
   */
  async getRankingFactors(userId: string): Promise<RankingFactor[]> {
    try {
      // Récupérer le classement complet
      const ranking = await this.calculateFreelancerRanking(userId);
      
      // Créer les facteurs de classement
      return [
        {
          name: 'Gestion des litiges',
          weight: 0.25,
          description: 'Basé sur votre historique de litiges et leur résolution',
          score: ranking.reliabilityScore,
          trend: ranking.disputeStats.totalDisputes > 0 ? 
            (ranking.disputeStats.resolvedInFavor > ranking.disputeStats.resolvedAgainst ? 'up' : 'down') : 
            'stable',
          lastUpdated: ranking.updatedAt
        },
        {
          name: 'Qualité du travail',
          weight: 0.35,
          description: 'Basé sur les évaluations de vos clients',
          score: ranking.qualityScore,
          trend: 'stable', // À remplacer par une vraie logique
          lastUpdated: ranking.updatedAt
        },
        {
          name: 'Respect des délais',
          weight: 0.20,
          description: 'Basé sur le respect des délais de livraison',
          score: ranking.deliveryScore,
          trend: 'stable', // À remplacer par une vraie logique
          lastUpdated: ranking.updatedAt
        },
        {
          name: 'Temps de réponse',
          weight: 0.15,
          description: 'Basé sur votre réactivité aux messages des clients',
          score: ranking.responseScore,
          trend: 'stable', // À remplacer par une vraie logique
          lastUpdated: ranking.updatedAt
        },
        {
          name: 'Vérification du compte',
          weight: 0.05,
          description: 'Bonus pour la vérification d\'identité',
          score: ranking.verificationBonus * 20, // Convertir en score sur 100
          trend: 'stable',
          lastUpdated: ranking.updatedAt
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des facteurs de classement:', error);
      return [];
    }
  }
  
  /**
   * Calcule un score basé sur l'historique des litiges
   * @private
   */
  private calculateDisputeScore(
    disputeHistory: DisputeHistory, 
    orderStats: FreelancerOrderStats
  ): number {
    // Pas de commandes, pas de score
    if (orderStats.totalOrders === 0) {
      return 100; // Score parfait par défaut
    }
    
    // Calculer le ratio de litiges
    const disputeRatio = disputeHistory.totalDisputes / orderStats.totalOrders;
    
    // Calculer le ratio de résolution favorable
    const resolutionRatio = disputeHistory.totalDisputes > 0 
      ? disputeHistory.resolvedInFavor / disputeHistory.totalDisputes 
      : 1;
    
    // Pénaliser les freelancers avec beaucoup de litiges
    let disputeScore = 100 - (disputeRatio * 100);
    
    // Bonus/malus basé sur la résolution des litiges
    disputeScore = disputeScore + ((resolutionRatio - 0.5) * 20);
    
    // Cap le score entre 0 et 100
    return Math.max(0, Math.min(100, disputeScore));
  }
  
  /**
   * Calcule un score basé sur les évaluations
   * @private
   */
  private calculateQualityScore(reliabilityScore: { score: number }): number {
    // Utiliser directement le score de fiabilité calculé par le service de reviews
    return reliabilityScore.score;
  }
  
  /**
   * Calcule un score basé sur les délais de livraison
   * @private
   */
  private calculateDeliveryScore(orderStats: FreelancerOrderStats): number {
    // Utiliser le taux d'achèvement et le temps moyen de livraison
    // pour calculer un score
    
    const completionRatio = orderStats.orderCompletionRate * 70; // 70% du score
    
    // Calcul inverse pour le temps de livraison (plus c'est court, mieux c'est)
    // Considérer 7 jours comme référence (score parfait pour 1 jour, score moyen pour 7 jours)
    const deliveryTimeScore = Math.max(0, 30 - (orderStats.averageCompletionTime * 30 / 7));
    
    return Math.min(100, completionRatio + deliveryTimeScore);
  }
  
  /**
   * Calcule un score basé sur le temps de réponse
   * @private
   */
  private calculateResponseScore(userId: string): number {
    // Pour le moment, générer un score aléatoire
    // À remplacer par une vraie logique basée sur les temps de réponse
    return 60 + Math.random() * 40;
  }
  
  /**
   * Calcule un bonus basé sur le niveau de vérification
   * @private
   */
  private calculateVerificationBonus(verificationStatus: { 
    isVerified: boolean; 
    verificationLevel: 'none' | 'basic' | 'full' 
  }): number {
    // Attribuer un bonus en fonction du niveau de vérification
    switch (verificationStatus.verificationLevel) {
      case 'full':
        return 5; // +5 points pour une vérification complète
      case 'basic':
        return 2; // +2 points pour une vérification basique
      default:
        return 0; // Pas de bonus
    }
  }
  
  /**
   * Détermine le niveau du freelancer
   * @private
   */
  private determineTier(
    overallScore: number, 
    disputeHistory: DisputeHistory
  ): 'nouveau' | 'établi' | 'premium' | 'elite' {
    // Vérifier s'il y a des litiges non résolus
    const hasUnresolvedDisputes = disputeHistory.openDisputes > 0;
    
    // Vérifier le ratio de litiges perdus
    const lostDisputeRatio = disputeHistory.totalDisputes > 0 
      ? disputeHistory.resolvedAgainst / disputeHistory.totalDisputes 
      : 0;
    
    // Un freelancer avec beaucoup de litiges perdus ne peut pas être élite
    if (lostDisputeRatio > 0.3) {
      return overallScore >= 70 ? 'établi' : 'nouveau';
    }
    
    // Déterminer le niveau en fonction du score global
    if (overallScore >= 90 && !hasUnresolvedDisputes) {
      return 'elite';
    } else if (overallScore >= 80) {
      return 'premium';
    } else if (overallScore >= 60) {
      return 'établi';
    } else {
      return 'nouveau';
    }
  }
  
  /**
   * Récupère le classement des meilleurs freelancers
   * @param category Catégorie optionnelle pour filtrer
   * @param limit Nombre maximum de résultats
   * @returns Liste des meilleurs freelancers
   */
  async getTopRankedFreelancers(category?: string, limit: number = 10): Promise<{
    userId: string;
    username: string;
    avatar?: string;
    tier: string;
    score: number;
    specialty: string;
    ranking: number;
  }[]> {
    // Simuler un délai d'appel à l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // À remplacer par un appel réel à l'API pour récupérer les freelancers classés
    const mockFreelancers = Array.from({ length: limit }).map((_, index) => {
      const score = 95 - (index * 2) + (Math.random() * 3 - 1.5);
      
      let tier: string;
      if (score >= 90) tier = 'elite';
      else if (score >= 80) tier = 'premium';
      else if (score >= 60) tier = 'établi';
      else tier = 'nouveau';
      
      return {
        userId: `user-${1000 + index}`,
        username: `Freelancer${1000 + index}`,
        avatar: Math.random() > 0.3 ? `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${10 + index}.jpg` : undefined,
        tier,
        score: Math.round(score),
        specialty: ['Design graphique', 'Développement web', 'Rédaction', 'Traduction', 'Marketing digital'][Math.floor(Math.random() * 5)],
        ranking: index + 1
      };
    });
    
    // Si une catégorie est spécifiée, filtrer les résultats (simulé)
    if (category) {
      return mockFreelancers.filter(() => Math.random() > 0.5);
    }
    
    return mockFreelancers;
  }
}

const rankingService = new RankingService();
export default rankingService; 