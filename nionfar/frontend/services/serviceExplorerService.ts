import { Service, User, Category } from '../types';
import type { OrderStatus } from '../types';
import { NextRouter } from 'next/router';
import { mockServices } from '../data/services';

// Define missing types that were imported
type CategoryId = string;
type ServiceId = string;
type UserId = string;

// Import statement placeholders for files we need to create
import { createApi } from '../lib/api-client';
import { handleApiError } from '../utils/error-handlers';
import { ServiceNotFoundError, ServiceInactiveError, SelfOrderError, AuthenticationRequiredError } from '../utils/custom-errors';
import { logger } from '../utils/logger.js';

// Interface for the result of checking if a user can order a service
interface CanOrderResult {
  canOrder: boolean;
  message?: string;
}

/**
 * @class ServiceExplorerService
 * @description Service pour la gestion, la recherche et la manipulation des services sur la plateforme
 */
export class ServiceExplorerService {
  private readonly api;
  private readonly endpoints = {
    services: '/services',
    search: '/services/search',
    category: '/services/category',
    related: '/services/related',
    popular: '/services/popular'
  };

  constructor(baseURL = '/api') {
    this.api = createApi({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Intercepteurs pour la gestion globale des erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('API Request Failed:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère tous les services publics (actifs)
   * @param {Object} options - Options de pagination et de filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Services publics avec métadonnées
   */
  async getAllPublicServices({
    page = 1,
    limit = 20,
    sort = 'recent',
    filter = {}
  } = {}) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getAllPublicServices');
        const publicServices = mockServices.filter(service => service.isActive);
        return {
          services: publicServices,
          total: publicServices.length,
          pages: Math.ceil(publicServices.length / limit)
        };
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        isActive: 'true',
        ...filter
      });

      const { data } = await this.api.get(`${this.endpoints.services}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch public services', { page, limit, sort, filter });
    }
  }

  /**
   * Récupère les services par catégorie
   * @param {CategoryId} categoryId - ID de la catégorie
   * @param {Object} options - Options de pagination et de filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Services de la catégorie avec métadonnées
   */
  async getServicesByCategory(categoryId: CategoryId, {
    page = 1,
    limit = 20,
    sort = 'recent',
    filter = {}
  } = {}) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getServicesByCategory');
        const categoryServices = mockServices.filter(service => 
          service.isActive && 
          (typeof service.category === 'string' ? service.category === categoryId : service.category?.id === categoryId)
        );
        return {
          services: categoryServices,
          total: categoryServices.length,
          pages: Math.ceil(categoryServices.length / limit)
        };
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        isActive: 'true',
        ...filter
      });

      const { data } = await this.api.get(`${this.endpoints.category}/${categoryId}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch services for category ${categoryId}`, { categoryId, page, limit, filter });
    }
  }

  /**
   * Recherche des services par termes
   * @param {string} query - Terme de recherche
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Résultats de recherche avec métadonnées
   */
  async searchServices(query: string, {
    page = 1,
    limit = 20,
    filter = {},
  } = {}) {
    if (!query || query.trim() === '') {
      return { services: [], total: 0, pages: 0 };
    }

    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour searchServices');
        const searchResults = mockServices.filter(service => 
          service.isActive && 
          (service.title.toLowerCase().includes(query.toLowerCase()) || 
           (service.description?.toLowerCase() || '').includes(query.toLowerCase()))
        );
        return {
          services: searchResults,
          total: searchResults.length,
          pages: Math.ceil(searchResults.length / limit)
        };
      }

      const params = new URLSearchParams({
        q: query,
        page: String(page),
        limit: String(limit),
        isActive: 'true',
        ...filter
      });

      const { data } = await this.api.get(`${this.endpoints.search}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to search services with query "${query}"`, { query, page, limit, filter });
    }
  }

  /**
   * Vérifie l'éligibilité d'un utilisateur à commander un service 
   * @param {ServiceId} serviceId - ID du service
   * @param {UserId} userId - ID de l'utilisateur
   * @returns {Promise<{canOrder: boolean, message?: string}>} Résultat avec infos
   * @throws {ServiceNotFoundError} Si le service n'existe pas
   * @throws {ServiceInactiveError} Si le service est inactif
   * @throws {SelfOrderError} Si l'utilisateur tente de commander son propre service
   * @throws {AuthenticationRequiredError} Si l'utilisateur n'est pas authentifié
   */
  async canOrderService(serviceId: ServiceId, userId?: UserId): Promise<CanOrderResult> {
    try {
      logger.info('[ServiceExplorer] Vérification commande:', { serviceId, userId });
      
      // Vérifier si l'utilisateur est connecté
      if (!userId) {
        logger.info('[ServiceExplorer] Utilisateur non connecté');
        return {
          canOrder: false,
          message: 'Connectez-vous pour commander ce service'
        };
      }

      // Récupérer le service
      const service = await this.getServiceById(serviceId);
      
      logger.info('[ServiceExplorer] Service récupéré:', { 
        found: !!service, 
        isActive: service?.isActive,
        providerId: service?.provider?.id
      });

      // Vérifications
      if (!service) {
        throw new ServiceNotFoundError('Service not found or has been deleted');
      }

      if (!service.isActive) {
        throw new ServiceInactiveError('Service is currently unavailable');
      }

      if (service.provider?.id === userId) {
        throw new SelfOrderError('You cannot order your own service');
      }

      // Toutes les vérifications OK
      logger.info('[ServiceExplorer] Vérification réussie, commande possible');
      return {
        canOrder: true
      };
    } catch (error) {
      if (
        error instanceof ServiceNotFoundError ||
        error instanceof ServiceInactiveError ||
        error instanceof SelfOrderError ||
        error instanceof AuthenticationRequiredError
      ) {
        logger.warn('[ServiceExplorer] Erreur commande connue:', { type: error.constructor.name, message: error.message });
        return {
          canOrder: false,
          message: error.message
        };
      }

      logger.error('[ServiceExplorer] Erreur inattendue lors de la vérification:', { serviceId, userId, error });
      return {
        canOrder: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Récupère les services actifs
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Services actifs avec métadonnées
   */
  async getActiveServices({
    page = 1,
    limit = 20,
    sort = 'recent'
  } = {}) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getActiveServices');
        const activeServices = mockServices.filter(service => service.isActive);
        return {
          services: activeServices,
          total: activeServices.length,
          pages: Math.ceil(activeServices.length / limit)
        };
      }

      const params = new URLSearchParams({
        isActive: 'true',
        page: String(page),
        limit: String(limit),
        sort
      });

      const { data } = await this.api.get(`${this.endpoints.services}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch active services', { page, limit, sort });
    }
  }

  /**
   * Récupère un service par son slug
   * @param {string} slug - Le slug du service
   * @returns {Promise<Service|null>} Le service correspondant ou null
   */
  async getServiceBySlug(slug: string) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getServiceBySlug');
        const mockService = mockServices.find(s => s.slug === slug);
        if (mockService) {
          return mockService;
        }
      }

      const { data } = await this.api.get(`${this.endpoints.services}/slug/${slug}`);
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch service with slug ${slug}`);
    }
  }

  /**
   * Récupère un service par son ID
   * @param {ServiceId} id - L'ID du service
   * @returns {Promise<Service|null>} Le service correspondant ou null
   */
  async getServiceById(id: ServiceId) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getServiceById');
        const mockService = mockServices.find(s => s.id === id);
        if (mockService) {
          return mockService;
        }
      }

      const { data } = await this.api.get(`${this.endpoints.services}/${id}`);
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch service with id ${id}`);
    }
  }

  /**
   * Récupère les services liés à une catégorie (pour les suggestions)
   * @param {CategoryId} categoryId - L'ID de la catégorie
   * @param {ServiceId} currentServiceId - L'ID du service actuel à exclure
   * @param {number} limit - Nombre maximum de services à retourner
   * @returns {Promise<Service[]>} Liste des services liés
   */
  async getRelatedServices(categoryId: CategoryId, currentServiceId: ServiceId, limit = 4) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getRelatedServices');
        const relatedServices = mockServices
          .filter(service => 
            service.isActive && 
            service.id !== currentServiceId && 
            (typeof service.category === 'string' ? service.category === categoryId : service.category?.id === categoryId)
          )
          .slice(0, limit);
        return relatedServices;
      }

      const params = new URLSearchParams({
        categoryId: String(categoryId),
        exclude: String(currentServiceId),
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.related}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch related services for category "${categoryId}"`, 
        { categoryId, currentServiceId, limit });
    }
  }

  /**
   * Récupère les services populaires (par note et nombre d'avis)
   * @param {number} limit - Nombre maximum de services à retourner
   * @returns {Promise<Service[]>} Liste des services populaires
   */
  async getPopularServices(limit = 6) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getPopularServices');
        const popularServices = [...mockServices]
          .filter(service => service.isActive)
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          .slice(0, limit);
        return popularServices;
      }

      const params = new URLSearchParams({
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.popular}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch popular services', { limit });
    }
  }

  /**
   * Gère la redirection en cas de service inactif ou introuvable
   * @param {string} slug - Le slug du service
   * @param {NextRouter} router - Routeur Next.js pour la redirection
   * @returns {Promise<void>}
   */
  async handleInactiveServiceRedirect(slug: string, router: NextRouter): Promise<void> {
    try {
      logger.info('[ServiceExplorer] Vérification service actif:', { slug });
      const service = await this.getServiceBySlug(slug);
      
      // Si le service existe mais est inactif
      if (service && !service.isActive) {
        logger.warn('[ServiceExplorer] Service inactif, redirection:', { slug });
        router.push({
          pathname: '/service-unavailable',
          query: { reason: 'inactive', slug }
        });
      }
      // Si le service n'existe pas
      else if (!service) {
        logger.warn('[ServiceExplorer] Service introuvable, redirection:', { slug });
        router.push({
          pathname: '/service-unavailable',
          query: { reason: 'not-found', slug }
        });
      }
      
      // Si le service existe et est actif, ne rien faire
    } catch (error) {
      logger.error('[ServiceExplorer] Erreur lors de la vérification du service:', { slug, error });
      // En cas d'erreur, rediriger vers une page générique
      router.push('/service-unavailable');
    }
  }

  /**
   * Récupère les services recommandés pour un utilisateur
   * @param {UserId} userId - ID de l'utilisateur
   * @param {number} limit - Nombre maximum de résultats
   * @returns {Promise<Service[]>} Services recommandés
   */
  async getRecommendedServices(userId: UserId, limit = 6) {
    if (!userId) return this.getPopularServices(limit);

    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getRecommendedServices');
        // Simuler des recommandations basées sur les services populaires
        return this.getPopularServices(limit);
      }

      const params = new URLSearchParams({
        userId: String(userId),
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.services}/recommended?${params}`);
      return data;
    } catch (error) {
      // En cas d'erreur, on replie sur les services populaires comme fallback
      logger.warn('Failed to fetch personalized recommendations, falling back to popular services', { userId, error });
      return this.getPopularServices(limit);
    }
  }

  /**
   * Récupère les derniers services consultés par l'utilisateur
   * @param {UserId} userId - ID de l'utilisateur (optionnel, utilise les cookies sinon)
   * @param {number} limit - Nombre maximum de résultats
   * @returns {Promise<Service[]>} Derniers services consultés
   */
  async getRecentlyViewedServices(userId?: UserId, limit = 4) {
    try {
      // En développement, utiliser les données mockées
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Utilisation des données mockées pour getRecentlyViewedServices');
        // Simuler des services récemment consultés
        return mockServices.slice(0, limit);
      }

      const params = new URLSearchParams({
        limit: String(limit),
        isActive: 'true'
      });

      if (userId) {
        params.append('userId', String(userId));
      }

      const { data } = await this.api.get(`${this.endpoints.services}/recently-viewed?${params}`);
      return data;
    } catch (error) {
      logger.warn('Failed to fetch recently viewed services', { userId, error });
      return [];
    }
  }

  /**
   * Enregistre qu'un service a été vu par un utilisateur
   * @param {ServiceId} serviceId - ID du service consulté
   * @param {UserId} userId - ID de l'utilisateur (optionnel)
   * @returns {Promise<void>}
   */
  async trackServiceView(serviceId: ServiceId, userId?: UserId) {
    try {
      // En développement, ne rien faire
      if (process.env.NODE_ENV === 'development') {
        console.log('[ServiceExplorer] Simulation de trackServiceView:', { serviceId, userId });
        return;
      }

      await this.api.post(`${this.endpoints.services}/track-view`, {
        serviceId,
        userId
      });
    } catch (error) {
      // Non bloquant, on log simplement l'erreur
      logger.warn('Failed to track service view', { serviceId, userId, error });
    }
  }
}

// Export d'une instance singleton avec lazy-loading
let serviceExplorerInstance: ServiceExplorerService | null = null;

export const getServiceExplorer = () => {
  if (!serviceExplorerInstance) {
    serviceExplorerInstance = new ServiceExplorerService();
  }
  return serviceExplorerInstance;
};

// Export de l'instance par défaut pour compatibilité
export const serviceExplorerService = getServiceExplorer();