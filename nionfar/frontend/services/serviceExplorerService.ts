import { Service, User, Category } from '../types';
import type { OrderStatus } from '../types';
import { NextRouter } from 'next/router';
import axios from 'axios';

// Define missing types that were imported
type CategoryId = string;
type ServiceId = string;
type ServiceQuery = any;

// Gestion des erreurs d'API
function handleApiError(error: any, message: string, context: any = {}) {
  console.error(`[API Error] ${message}:`, error, context);
  
  // Informations par défaut en cas d'erreur
  return {
    services: [],
    total: 0,
    pages: 0
  };
}

class ServiceExplorerService {
  private readonly api;
  private readonly endpoints = {
    all: '/api/services',
    search: '/api/services/search',
    category: '/api/services/category',
    related: '/api/services/related',
    popular: '/api/services/popular',
    trending: '/api/services/trending',
    service: '/api/services'
  };

  constructor() {
    this.api = axios.create({
      baseURL: '',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Récupère tous les services publics
   * @param {Object} options - Options de pagination et de filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Services avec métadonnées
   */
  async getAllServices({
    page = 1,
    limit = 20,
    sort = 'recent',
    filter = {}
  } = {}) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        isActive: 'true',
        ...filter
      });

      const { data } = await this.api.get(`${this.endpoints.all}?${params}`);
      return data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch services', { page, limit, sort, filter });
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
      // Utiliser toujours les données de l'API, même en développement
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
   * Recherche des services selon les termes fournis
   * @param {string} query - Termes de recherche
   * @param {Object} options - Options de pagination et de filtrage
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Résultats de recherche avec métadonnées
   */
  async searchServices(query: string, {
    page = 1,
    limit = 20,
    filter = {}
  } = {}) {
    try {
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
   * Filtre les services selon plusieurs critères
   * @param {ServiceQuery} query - Critères de filtrage
   * @param {Object} options - Options de pagination
   * @returns {Promise<{services: Service[], total: number, pages: number}>} Services filtrés avec métadonnées
   */
  async filterServices(query: ServiceQuery, {
    page = 1,
    limit = 20,
    sort = 'recent'
  } = {}) {
    try {
      const filterParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        isActive: 'true',
        ...query
      });

      const { data } = await this.api.get(`${this.endpoints.all}?${filterParams}`);
      return data;
    } catch (error) {
      return handleApiError(error, 'Failed to filter services', { query, page, limit, sort });
    }
  }

  /**
   * Récupère les détails d'un service par son slug
   * @param {string} slug - Slug du service
   * @returns {Promise<Service | null>} Service trouvé ou null
   */
  async getServiceBySlug(slug: string) {
    try {
      const { data } = await this.api.get(`${this.endpoints.service}/${slug}`);
      return data.service;
    } catch (error) {
      console.error(`[API Error] Failed to fetch service with slug "${slug}":`, error);
      return null;
    }
  }

  /**
   * Récupère les détails d'un service par son ID
   * @param {ServiceId} id - ID du service
   * @returns {Promise<Service | null>} Service trouvé ou null
   */
  async getServiceById(id: ServiceId) {
    try {
      const { data } = await this.api.get(`${this.endpoints.service}/${id}`);
      return data.service;
    } catch (error) {
      console.error(`[API Error] Failed to fetch service with ID "${id}":`, error);
      return null;
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
      const params = new URLSearchParams({
        categoryId: String(categoryId),
        exclude: String(currentServiceId),
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.related}?${params}`);
      return data.services || [];
    } catch (error) {
      console.error(`[API Error] Failed to fetch related services for category "${categoryId}"`, error);
      return [];
    }
  }

  /**
   * Récupère les services les plus populaires
   * @param {number} limit - Nombre maximum de services à retourner
   * @returns {Promise<Service[]>} Liste des services populaires
   */
  async getPopularServices(limit = 8) {
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.popular}?${params}`);
      return data.services || [];
    } catch (error) {
      console.error('[API Error] Failed to fetch popular services:', error);
      return [];
    }
  }

  /**
   * Récupère les services tendance (forte croissance récente)
   * @param {number} limit - Nombre maximum de services à retourner
   * @returns {Promise<Service[]>} Liste des services tendance
   */
  async getTrendingServices(limit = 8) {
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        isActive: 'true'
      });

      const { data } = await this.api.get(`${this.endpoints.trending}?${params}`);
      return data.services || [];
    } catch (error) {
      console.error('[API Error] Failed to fetch trending services:', error);
      return [];
    }
  }

  /**
   * Vérifie si un utilisateur peut commander un service
   * @param {ServiceId} serviceId - ID du service
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{canOrder: boolean, message?: string}>} Résultat de la vérification
   */
  async canOrderService(serviceId: ServiceId, userId: string) {
    try {
      const { data } = await this.api.get(`${this.endpoints.service}/${serviceId}/can-order`, {
        params: { userId }
      });
      return data;
    } catch (error) {
      console.error(`[API Error] Failed to check order permission for service ${serviceId}:`, error);
      return { canOrder: false, message: "Erreur lors de la vérification des permissions" };
    }
  }
}

// Exporter une instance unique du service
export const serviceExplorer = new ServiceExplorerService();