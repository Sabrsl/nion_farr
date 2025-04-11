import axios from 'axios';
import { Service, User } from '../types';
import { serviceValidationBot, ValidationResult } from '../utils/serviceValidation';

// Type pour le filtrage des services
export interface ServiceValidationFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Helper pour convertir un provider en User pour la validation
const providerToUser = (provider: any): User => {
  return {
    id: provider.id,
    name: provider.name,
    email: provider.email || `${provider.id}@example.com`, // Email par défaut
    role: provider.role || 'provider', // Role par défaut
    avatar: provider.avatar,
    isVerified: provider.isVerified,
    emailVerified: provider.emailVerified,
    bio: provider.bio,
    skills: provider.skills,
    location: provider.location
  };
};

/**
 * Service de validation pour les services/offres des freelancers
 */
class ServiceValidationService {
  private readonly MAX_ACTIVE_SERVICES = 10;
  
  // Motifs à rechercher pour les contacts directs
  private readonly CONTACT_PATTERNS = [
    // Email
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    // Téléphone international
    /((?:\+|00)[0-9]{1,3}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4})/gi,
    // Téléphone local
    /(0[0-9]{1,2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2})/gi,
    // WhatsApp
    /whatsapp[\s.:]+([0-9+\s.-]+)/gi,
    // Telegram
    /telegram[\s.:@]+([a-zA-Z0-9_]+)/gi,
    // Instagram
    /instagram[\s.:@]+([a-zA-Z0-9._]+)/gi,
    // Facebook
    /facebook[\s.:]+([a-zA-Z0-9.]+)/gi,
    // URL
    /(https?:\/\/[^\s]+)/gi,
  ];
  
  // Mots-clés interdits nécessitant une modération manuelle
  private readonly FORBIDDEN_KEYWORDS = [
    "parions sport",
    "certificat de mariage",
    "faux document",
    "diplôme",
    "certificat médical",
    "hacke",
    "pirater compte",
    "piratage",
    "attestation",
    "casino",
    "jeu d'argent",
    "paris sportif",
    "permis de conduire",
    "contrefaçon",
    "faux papier",
    "tricher",
    "examen",
    "porno",
    "sexuel",
    "mémoire universitaire",
    "thèse",
    "dissert",
    "devoir",
    "examen",
  ];

  private apiUrl = '/api/services';
  private adminApiUrl = '/api/admin/services';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 2 * 60 * 1000; // 2 minutes en ms (plus court que le service normal)

  /**
   * Vérifie si les données dans le cache sont valides
   * @param key Clé du cache
   * @returns Vrai si les données du cache sont valides
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return now - cached.timestamp < this.cacheExpiry;
  }

  /**
   * Récupère les données du cache ou appelle l'API
   * @param key Clé de cache
   * @param apiCall Fonction qui fait l'appel API
   * @returns Promesse avec les données
   */
  private async getWithCaching<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
    // Si les données existent dans le cache et sont encore valides, les renvoyer
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data;
    }
    
    // Sinon, faire l'appel API et mettre à jour le cache
    try {
      const data = await apiCall();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // Si une erreur se produit, vérifier s'il y a des données en cache, même expirées
      const staleCache = this.cache.get(key);
      if (staleCache) {
        console.warn(`Erreur API pour ${key}, utilisation des données en cache périmées.`);
        return staleCache.data;
      }
      throw error;
    }
  }

  /**
   * Invalide le cache pour une clé spécifique
   * @param key Clé du cache à invalider
   */
  public invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Efface tout le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Vérifie si un utilisateur peut créer un nouveau service actif
   * @param userId ID de l'utilisateur
   * @param activeServicesCount Nombre de services actifs actuels
   * @returns {Promise<{isValid: boolean, message: string}>} Résultat de la validation
   */
  async canCreateActiveService(userId: string, activeServicesCount: number): Promise<{isValid: boolean, message: string}> {
    if (activeServicesCount >= this.MAX_ACTIVE_SERVICES) {
      return {
        isValid: false,
        message: `Vous ne pouvez pas avoir plus de ${this.MAX_ACTIVE_SERVICES} services actifs simultanément. Veuillez désactiver un service existant avant d'en créer un nouveau.`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Vérifie que le titre du service est unique
   * @param title Titre du service
   * @param existingServices Liste des services existants
   * @param currentServiceId ID du service actuel (pour l'édition)
   * @returns {Promise<{isValid: boolean, message: string}>} Résultat de la validation
   */
  async validateUniqueTitle(
    title: string, 
    existingServices: Service[], 
    currentServiceId?: string
  ): Promise<{isValid: boolean, message: string}> {
    const isDuplicate = existingServices.some(service => 
      service.title.toLowerCase() === title.toLowerCase() && 
      (!currentServiceId || service.id !== currentServiceId)
    );
    
    if (isDuplicate) {
      return {
        isValid: false,
        message: 'Ce titre de service existe déjà. Veuillez choisir un titre unique.'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Vérifie si la description contient des informations de contact directes
   * @param description Description du service
   * @returns {Promise<{isValid: boolean, message: string, matches: string[]}>} Résultat de la validation
   */
  async validateNoDirectContact(description: string): Promise<{isValid: boolean, message: string, matches: string[]}> {
    const matches: string[] = [];
    
    // Vérifier chaque pattern
    this.CONTACT_PATTERNS.forEach(pattern => {
      const result = description.match(pattern);
      if (result) {
        matches.push(...result);
      }
    });
    
    if (matches.length > 0) {
      return {
        isValid: false,
        message: 'La description ne peut pas contenir des informations de contact directes (email, téléphone, liens vers des réseaux sociaux, etc.)',
        matches
      };
    }
    
    return {
      isValid: true,
      message: '',
      matches: []
    };
  }

  /**
   * Vérifie si le service nécessite une modération manuelle
   * @param service Service à vérifier
   * @returns {Promise<{requiresModeration: boolean, reasons: string[]}>} Résultat de la vérification
   */
  async checkModeration(service: Service): Promise<{requiresModeration: boolean, reasons: string[]}> {
    const reasons: string[] = [];
    const content = `${service.title} ${service.description || ''}`.toLowerCase();
    
    // Vérifier les mots-clés interdits
    this.FORBIDDEN_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        reasons.push(`Contient le mot-clé interdit: "${keyword}"`);
      }
    });
    
    return {
      requiresModeration: reasons.length > 0,
      reasons
    };
  }

  /**
   * Effectue une validation complète d'un service
   * @param service Service à valider
   * @param existingServices Liste des services existants
   * @param currentUser Utilisateur actuel
   * @param isEditing Indique si c'est une édition (true) ou une création (false)
   * @returns Résultat de la validation complète
   */
  async validateService(
    service: Service,
    existingServices: Service[],
    currentUser: User,
    isEditing: boolean = false
  ): Promise<{
    isValid: boolean,
    requiresModeration: boolean,
    errors: {field: string, message: string}[],
    moderationReasons: string[]
  }> {
    const errors: {field: string, message: string}[] = [];
    
    // Vérifier le nombre de services actifs
    if (service.isActive && !isEditing) {
      const activeServicesCount = existingServices.filter(s => 
        s.provider && s.provider.id === currentUser.id && s.isActive
      ).length;
      
      const canCreateResult = await this.canCreateActiveService(currentUser.id, activeServicesCount);
      if (!canCreateResult.isValid) {
        errors.push({
          field: 'isActive',
          message: canCreateResult.message
        });
      }
    }
    
    // Vérifier l'unicité du titre
    const titleResult = await this.validateUniqueTitle(
      service.title, 
      existingServices, 
      isEditing ? service.id : undefined
    );
    if (!titleResult.isValid) {
      errors.push({
        field: 'title',
        message: titleResult.message
      });
    }
    
    // Vérifier l'absence de contacts directs
    if (service.description) {
      const contactResult = await this.validateNoDirectContact(service.description);
      if (!contactResult.isValid) {
        errors.push({
          field: 'description',
          message: contactResult.message
        });
      }
    }
    
    // Vérifier la modération automatique
    const moderationResult = await this.checkModeration(service);
    
    return {
      isValid: errors.length === 0,
      requiresModeration: moderationResult.requiresModeration,
      errors,
      moderationReasons: moderationResult.reasons
    };
  }

  /**
   * Récupère tous les services nécessitant une validation
   * @param filters Filtres pour la recherche
   * @returns Promesse avec les services et le nombre total
   */
  async getPendingServices(filters: ServiceValidationFilters = {}): Promise<{ services: Service[]; total: number }> {
    // Construire la clé de cache basée sur les filtres
    const cacheKey = `pending_services_${JSON.stringify(filters)}`;
    
    return this.getWithCaching(cacheKey, async () => {
      try {
        const queryParams = new URLSearchParams();
        
        // Ajouter les filtres à la requête
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);
        
        const response = await axios.get(`${this.adminApiUrl}/validation?${queryParams.toString()}`);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des services à valider:', error);
        return { services: [], total: 0 };
      }
    });
  }

  /**
   * Récupère un service spécifique avec ses détails de validation
   * @param serviceId ID du service
   * @returns Promesse avec le service et ses détails de validation
   */
  async getServiceWithValidationDetails(serviceId: string): Promise<{ service: Service; validationResult: ValidationResult | null }> {
    return this.getWithCaching(`service_validation_${serviceId}`, async () => {
      try {
        const response = await axios.get(`${this.adminApiUrl}/validation/${serviceId}`);
        
        return {
          service: response.data.service,
          validationResult: response.data.validationResult
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des détails de validation du service ${serviceId}:`, error);
        
        // En cas d'erreur, essayer de récupérer juste le service et générer une validation côté client
        try {
          const serviceResponse = await axios.get(`${this.apiUrl}/${serviceId}`);
          const service = serviceResponse.data;
          
          // Générer une validation côté client comme fallback
          const provider = service.provider;
          const validationResult = serviceValidationBot.validateService(service, providerToUser(provider));
          
          return {
            service,
            validationResult
          };
        } catch (fallbackError) {
          console.error(`Erreur lors de la récupération alternative du service ${serviceId}:`, fallbackError);
          throw fallbackError; // Re-throw l'erreur si les deux méthodes échouent
        }
      }
    });
  }

  /**
   * Exécute l'analyse de validation sur un service
   * @param serviceId ID du service à analyser
   * @returns Promesse avec le résultat de validation
   */
  async runServiceValidation(serviceId: string): Promise<ValidationResult> {
    try {
      const response = await axios.post(`${this.adminApiUrl}/validation/${serviceId}/analyze`);
      
      // Invalider le cache pour ce service
      this.invalidateCache(`service_validation_${serviceId}`);
      this.invalidateCache(`pending_services_`); // Invalider aussi la liste des services
      
      return response.data.validationResult;
    } catch (error) {
      console.error(`Erreur lors de l'analyse du service ${serviceId}:`, error);
      
      // En cas d'erreur, faire l'analyse côté client
      try {
        const serviceResponse = await axios.get(`${this.apiUrl}/${serviceId}`);
        const service = serviceResponse.data;
        const provider = service.provider;
        
        return serviceValidationBot.validateService(service, providerToUser(provider));
      } catch (fallbackError) {
        console.error(`Erreur lors de l'analyse alternative du service ${serviceId}:`, fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Met à jour le statut de validation d'un service
   * @param serviceId ID du service
   * @param status Nouveau statut de validation
   * @param feedback Feedback optionnel en cas de révision
   * @returns Promesse avec le résultat de l'opération
   */
  async updateServiceValidationStatus(
    serviceId: string, 
    status: 'validated' | 'validated_prod' | 'rejected' | 'pending' | 'revision',
    feedback?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.patch(`${this.adminApiUrl}/validation/${serviceId}/status`, {
        status,
        feedback
      });
      
      // Invalider le cache pour ce service et la liste des services
      this.invalidateCache(`service_validation_${serviceId}`);
      this.invalidateCache(`pending_services_`);
      
      return {
        success: true,
        message: response.data.message || `Statut mis à jour avec succès: ${status}`
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut du service ${serviceId}:`, error);
      return {
        success: false,
        message: (error as any)?.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      };
    }
  }

  /**
   * Envoie un service en révision avec un feedback
   * @param serviceId ID du service
   * @param feedback Feedback pour le prestataire
   * @returns Promesse avec le résultat de l'opération
   */
  async sendServiceForRevision(serviceId: string, feedback: string): Promise<{ success: boolean; message: string }> {
    return this.updateServiceValidationStatus(serviceId, 'revision', feedback);
  }

  /**
   * Met un service en production (validé et visible)
   * @param serviceId ID du service
   * @returns Promesse avec le résultat de l'opération
   */
  async publishServiceToProd(serviceId: string): Promise<{ success: boolean; message: string }> {
    return this.updateServiceValidationStatus(serviceId, 'validated_prod');
  }

  /**
   * Récupère les statistiques de validation
   * @returns Promesse avec les statistiques
   */
  async getValidationStats(): Promise<{ 
    total: number; 
    pending: number; 
    validated: number; 
    rejected: number; 
    revision: number;
    inProduction: number;
  }> {
    return this.getWithCaching('validation_stats', async () => {
      try {
        const response = await axios.get(`${this.adminApiUrl}/validation/stats`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de validation:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          total: 0,
          pending: 0,
          validated: 0,
          rejected: 0,
          revision: 0,
          inProduction: 0
        };
      }
    });
  }

  /**
   * Récupère l'historique des validations pour un service
   * @param serviceId ID du service
   * @returns Promesse avec l'historique des validations
   */
  async getServiceValidationHistory(serviceId: string): Promise<any[]> {
    return this.getWithCaching(`validation_history_${serviceId}`, async () => {
      try {
        const response = await axios.get(`${this.adminApiUrl}/validation/${serviceId}/history`);
        return response.data.history || [];
      } catch (error) {
        console.error(`Erreur lors de la récupération de l'historique de validation du service ${serviceId}:`, error);
        return [];
      }
    });
  }
}

// Exporter une instance singleton du service
const serviceValidationService = new ServiceValidationService();
export default serviceValidationService; 