import { Review, User, Order, Service } from '../types';

interface SubmitReviewParams {
  orderId: string;
  reviewerId: string;
  recipientId: string;
  serviceId: string;
  rating: number;
  title: string;
  content: string;
  isPublic: boolean;
}

interface ReviewSubmitResult {
  success: boolean;
  review?: Review;
  message?: string;
}

interface FlagReviewParams {
  reviewId: string;
  userId: string;
  reason: string;
  details?: string;
}

interface ReviewFilterResult {
  isInappropriate: boolean;
  reasons: string[];
  score: number;
}

/**
 * Service pour gérer les évaluations
 */
const reviewService = {
  /**
   * Récupérer les évaluations pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param asRecipient - Si true, récupère les avis reçus par l'utilisateur, sinon ceux qu'il a laissés
   * @param limit - Nombre d'avis à récupérer (par défaut 10)
   * @param page - Numéro de page (pagination)
   */
  async getUserReviews(userId: string, asRecipient: boolean = true, limit: number = 10, page: number = 1): Promise<Review[]> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Générer des données simulées
    const mockReviews: Review[] = Array.from({ length: limit }).map((_, index) => {
      const isPositive = Math.random() > 0.2; // 80% des avis sont positifs
      
      return {
        id: `review-${Date.now()}-${index}`,
        reviewer: {
          id: asRecipient ? `user-${index}` : userId,
          name: asRecipient ? `Utilisateur ${index}` : 'Vous',
          role: asRecipient ? 'client' : 'freelancer',
          email: `user${index}@example.com`,
          createdAt: new Date().toISOString()
        } as User,
        service: { 
          id: `service-${index}`, 
          title: 'Service simulé',
          slug: `service-${index}`,
          price: 100,
          deliveryTime: 3,
          isActive: true,
          createdAt: new Date().toISOString()
        } as Service,
        rating: isPositive ? 4 + Math.random() : 2 + Math.random() * 2,
        title: isPositive ? 'Très satisfait du service' : 'Service passable',
        content: isPositive 
          ? 'Le prestataire a été professionnel et a livré un travail de qualité dans les délais impartis.'
          : 'Le travail a été fait, mais la communication était difficile et il a fallu plusieurs révisions.',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        helpfulCount: Math.floor(Math.random() * 10)
      };
    });
    
    return mockReviews;
  },
  
  /**
   * Récupérer les évaluations pour un service
   * @param serviceId - ID du service
   * @param limit - Nombre d'avis à récupérer (par défaut 10)
   * @param page - Numéro de page (pagination)
   */
  async getServiceReviews(serviceId: string, limit: number = 10, page: number = 1): Promise<Review[]> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Générer des données simulées (comme getUserReviews mais adapté pour les services)
    const mockReviews: Review[] = Array.from({ length: limit }).map((_, index) => {
      const isPositive = Math.random() > 0.2; // 80% des avis sont positifs
      
      return {
        id: `review-${Date.now()}-${index}`,
        reviewer: {
          id: `client-${index}`,
          name: `Client ${index}`,
          role: 'client',
          email: `client${index}@example.com`,
          createdAt: new Date().toISOString()
        } as User,
        service: { 
          id: serviceId, 
          title: 'Service simulé', 
          slug: `service-${serviceId}`,
          price: 100,
          deliveryTime: 3,
          isActive: true,
          createdAt: new Date().toISOString()
        } as Service,
        rating: isPositive ? 4 + Math.random() : 2 + Math.random() * 2,
        title: isPositive ? 'Excellent service' : 'Service moyen',
        content: isPositive 
          ? 'Je recommande vivement ce prestataire. Le travail fourni était de très haute qualité et livré rapidement.'
          : 'Le résultat final est correct mais le délai n\'a pas été respecté et la communication était difficile.',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        helpfulCount: Math.floor(Math.random() * 15)
      };
    });
    
    return mockReviews;
  },
  
  /**
   * Soumettre une évaluation
   * @param params - Paramètres de l'évaluation
   */
  async submitReview(params: SubmitReviewParams): Promise<ReviewSubmitResult> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Vérifier que l'évaluation n'est pas inappropriée
    const filterResult = await this.checkInappropriateContent(params.content);
    
    if (filterResult.isInappropriate) {
      return {
        success: false,
        message: `L'évaluation a été automatiquement rejetée car elle contient du contenu inapproprié : ${filterResult.reasons.join(', ')}`
      };
    }
    
    // Simuler une évaluation créée avec succès
    const mockReview: Review = {
      id: `review-${Date.now()}`,
      reviewer: { id: params.reviewerId } as User,
      service: { id: params.serviceId } as Service,
      rating: params.rating,
      content: params.content,
      title: params.title,
      createdAt: new Date().toISOString(),
      helpfulCount: 0
    };
    
    return {
      success: true,
      review: mockReview
    };
  },
  
  /**
   * Ajouter une réponse à une évaluation
   * @param reviewId - ID de l'évaluation
   * @param content - Contenu de la réponse
   */
  async addReviewReply(reviewId: string, content: string): Promise<ReviewSubmitResult> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Vérifier que le contenu n'est pas inapproprié
    const filterResult = await this.checkInappropriateContent(content);
    
    if (filterResult.isInappropriate) {
      return {
        success: false,
        message: `La réponse a été automatiquement rejetée car elle contient du contenu inapproprié : ${filterResult.reasons.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'Réponse ajoutée avec succès'
    };
  },
  
  /**
   * Signaler une évaluation comme inappropriée
   * @param params - Paramètres du signalement
   */
  async flagReview(params: FlagReviewParams): Promise<{ success: boolean; message: string }> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Merci pour votre signalement. Notre équipe va examiner cette évaluation dans les plus brefs délais.'
    };
  },
  
  /**
   * Vérifier si le contenu d'une évaluation est inapproprié
   * @param content - Contenu à vérifier
   */
  async checkInappropriateContent(content: string): Promise<ReviewFilterResult> {
    // Simuler un appel à un service d'analyse de contenu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Liste de mots ou expressions interdits (simulé)
    const forbiddenWords = ['insulte', 'grossier', 'arnaque', 'escroquerie', 'malhonnête'];
    
    // Vérifier si le contenu contient des mots interdits
    const foundReasons: string[] = forbiddenWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    
    // Calculer un score basé sur la présence de mots interdits
    const score = foundReasons.length > 0 ? 0.8 : Math.random() * 0.2;
    
    return {
      isInappropriate: score > 0.7,
      reasons: foundReasons.length > 0 ? ['Langage inapproprié détecté'] : [],
      score
    };
  },
  
  /**
   * Vérifier si un utilisateur est un Top vendeur
   * @param userId - ID de l'utilisateur
   */
  async checkTopSellerStatus(userId: string): Promise<{ isTopSeller: boolean; rating: number; completedOrders: number }> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Générer des données simulées
    const rating = 3.5 + Math.random() * 1.5;
    const completedOrders = Math.floor(15 + Math.random() * 30);
    
    return {
      isTopSeller: rating >= 4.5 && completedOrders >= 20,
      rating,
      completedOrders
    };
  },

  /**
   * Calcule un score de fiabilité pour un freelancer en prenant en compte l'historique des litiges
   * @param userId - ID du freelancer
   * @returns Un score entre 0 et 100, et des détails sur le calcul
   */
  async calculateReliabilityScore(userId: string): Promise<{ 
    score: number;
    details: {
      totalOrders: number;
      disputeCount: number;
      resolvedDisputesInFavor: number;
      disputeRatio: number;
      ratingScore: number;
      completionScore: number;
      responseTimeScore: number;
      verificationBonus: number;
    }
  }> {
    try {
      // Simuler un appel API pour récupérer les statistiques du freelancer
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Au lieu d'importer dynamiquement, créons des objets fictifs
      const orderService = {
        getFreelancerOrderStats: async (userId: string) => ({
          totalOrders: 25 + Math.floor(Math.random() * 30),
          completedOrders: 20 + Math.floor(Math.random() * 25),
          inProgressOrders: 2 + Math.floor(Math.random() * 3),
          cancelledOrders: Math.floor(Math.random() * 3),
          averageCompletionTime: 3 + Math.random() * 4, // en jours
          orderCompletionRate: 0.85 + Math.random() * 0.15,
          disputedOrders: Math.floor(Math.random() * 3),
          revenueStats: {
            total: 100000,
            lastMonth: 20000,
            lastWeek: 5000
          }
        })
      };
      
      const disputeService = {
        getFreelancerDisputeHistory: async (userId: string) => ({
          totalDisputes: Math.floor(Math.random() * 5),
          resolvedInFavor: Math.floor(Math.random() * 3),
          resolvedAgainst: Math.floor(Math.random() * 2),
          openDisputes: Math.floor(Math.random() * 1),
          disputeSummary: []
        })
      };
      
      const securityService = {
        getUserVerificationStatus: async (userId: string) => ({
          isVerified: Math.random() > 0.3,
          verificationLevel: Math.random() > 0.7 ? 'full' : Math.random() > 0.4 ? 'basic' : 'none',
          verifiedEmail: true,
          verifiedPhone: Math.random() > 0.3,
          verifiedIdentity: Math.random() > 0.6,
          verifiedAddress: Math.random() > 0.7
        })
      };
      
      // Récupérer le nombre total de commandes
      const orderStats = await orderService.getFreelancerOrderStats(userId);
      const totalOrders = orderStats.totalOrders || 0;
      const completedOrders = orderStats.completedOrders || 0;
      
      // Récupérer l'historique des litiges
      const disputeHistory = await disputeService.getFreelancerDisputeHistory(userId);
      const disputeCount = disputeHistory.totalDisputes || 0;
      const resolvedDisputesInFavor = disputeHistory.resolvedInFavor || 0;
      const resolvedDisputesAgainst = disputeHistory.resolvedAgainst || 0;
      
      // Récupérer les évaluations
      const reviews = await this.getUserReviews(userId, true, 100);
      const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1);
      
      // Récupérer le statut de vérification
      const verificationStatus = await securityService.getUserVerificationStatus(userId);
      
      // Calculer les scores individuels
      // 1. Ratio de litiges (moins de litiges = meilleur score)
      const disputeRatio = totalOrders > 0 ? disputeCount / totalOrders : 0;
      const disputeScore = Math.max(0, 25 - (disputeRatio * 100)); // Max 25 points
      
      // 2. Résolution des litiges (plus de résolutions en faveur = meilleur score)
      const disputeResolutionRatio = disputeCount > 0 
        ? resolvedDisputesInFavor / disputeCount 
        : 1; // Si pas de litiges, ratio parfait
      const disputeResolutionScore = 15 * disputeResolutionRatio; // Max 15 points
      
      // 3. Évaluations (sur 30 points)
      const ratingScore = (averageRating / 5) * 30;
      
      // 4. Taux d'achèvement des commandes (sur 20 points)
      const completionRatio = totalOrders > 0 ? completedOrders / totalOrders : 0;
      const completionScore = completionRatio * 20;
      
      // 5. Temps de réponse (sur 5 points)
      // Fictif pour le moment, à remplacer par une vraie logique
      const responseTimeScore = Math.random() * 5;
      
      // 6. Bonus de vérification (sur 5 points)
      const verificationBonus = verificationStatus.isVerified ? 5 : 0;
      
      // Calculer le score total (maximum 100 points)
      const totalScore = Math.min(100, Math.round(
        disputeScore + 
        disputeResolutionScore + 
        ratingScore + 
        completionScore + 
        responseTimeScore + 
        verificationBonus
      ));
      
      return {
        score: totalScore,
        details: {
          totalOrders,
          disputeCount,
          resolvedDisputesInFavor,
          disputeRatio,
          ratingScore,
          completionScore,
          responseTimeScore,
          verificationBonus
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul du score de fiabilité:', error);
      // En cas d'erreur, retourner un score par défaut
      return {
        score: 50,
        details: {
          totalOrders: 0,
          disputeCount: 0,
          resolvedDisputesInFavor: 0,
          disputeRatio: 0,
          ratingScore: 0,
          completionScore: 0,
          responseTimeScore: 0,
          verificationBonus: 0
        }
      };
    }
  }
};

export default reviewService; 