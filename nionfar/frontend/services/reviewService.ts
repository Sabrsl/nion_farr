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
        order: { id: `order-${index}` } as Order,
        service: { id: `service-${index}`, title: 'Service simulé' } as Service,
        reviewer: {
          id: asRecipient ? `user-${index}` : userId,
          name: asRecipient ? `Utilisateur ${index}` : 'Vous',
          role: asRecipient ? 'client' : 'freelancer',
          email: `user${index}@example.com`,
          createdAt: new Date().toISOString()
        } as User,
        recipient: {
          id: asRecipient ? userId : `user-${index}`,
          name: asRecipient ? 'Vous' : `Utilisateur ${index}`,
          role: asRecipient ? 'freelancer' : 'client',
          email: asRecipient ? 'you@example.com' : `user${index}@example.com`,
          createdAt: new Date().toISOString()
        } as User,
        rating: isPositive ? 4 + Math.random() : 2 + Math.random() * 2,
        title: isPositive ? 'Très satisfait du service' : 'Service passable',
        content: isPositive 
          ? 'Le prestataire a été professionnel et a livré un travail de qualité dans les délais impartis.'
          : 'Le travail a été fait, mais la communication était difficile et il a fallu plusieurs révisions.',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Jusqu'à 30 jours dans le passé
        isPublic: Math.random() > 0.1, // 90% des avis sont publics
        likes: Math.floor(Math.random() * 10)
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
        order: { id: `order-${index}` } as Order,
        service: { id: serviceId, title: 'Service simulé' } as Service,
        reviewer: {
          id: `client-${index}`,
          name: `Client ${index}`,
          role: 'client',
          email: `client${index}@example.com`,
          createdAt: new Date().toISOString()
        } as User,
        recipient: {
          id: `provider-${serviceId}`,
          name: 'Prestataire de service',
          role: 'freelancer',
          email: 'provider@example.com',
          createdAt: new Date().toISOString()
        } as User,
        rating: isPositive ? 4 + Math.random() : 2 + Math.random() * 2,
        title: isPositive ? 'Excellent service' : 'Service moyen',
        content: isPositive 
          ? 'Je recommande vivement ce prestataire. Le travail fourni était de très haute qualité et livré rapidement.'
          : 'Le résultat final est correct mais le délai n\'a pas été respecté et la communication était difficile.',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Jusqu'à 60 jours dans le passé
        isPublic: true,
        likes: Math.floor(Math.random() * 15)
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
      order: { id: params.orderId } as Order,
      service: { id: params.serviceId } as Service,
      reviewer: { id: params.reviewerId } as User,
      recipient: { id: params.recipientId } as User,
      rating: params.rating,
      title: params.title,
      content: params.content,
      createdAt: new Date().toISOString(),
      isPublic: params.isPublic,
      likes: 0
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
  }
};

export default reviewService; 