import { Service, User, Category } from '../types';
import type { OrderStatus } from '../types';
import { NextRouter } from 'next/router';
import axios from 'axios';

// Define missing types that were imported
type CategoryId = string;
type ServiceId = string;
type ServiceQuery = any;

// Types
interface SearchParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  isActive?: boolean;
}

// Fonction pour gérer les erreurs API
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  // Erreur de réseau (pas de connexion au serveur)
  if (error.message && (error.message.includes('Network Error') || error.message.includes('Failed to fetch'))) {
    console.error('Erreur réseau - pas de connexion au serveur');
    const customError = new Error('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.');
    customError.name = 'NetworkError';
    throw customError;
  }
  
  // Erreur CORS
  if (error.message && error.message.includes('CORS')) {
    console.error('Erreur CORS détectée');
    const customError = new Error('Problème d\'accès au serveur. L\'équipe technique a été notifiée.');
    customError.name = 'CORSError';
    throw customError;
  }
  
  // Erreur spécifique HTTP
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    
    // Gérer les erreurs HTTP spécifiques
    switch (error.response.status) {
      case 401:
        console.error('Authentification requise');
        const authError = new Error('Vous devez être connecté pour accéder à ce service.');
        authError.name = 'AuthError';
        throw authError;
      case 403:
        console.error('Accès interdit');
        const forbiddenError = new Error('Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.');
        forbiddenError.name = 'ForbiddenError';
        throw forbiddenError;
      case 404:
        console.error('Ressource non trouvée');
        const notFoundError = new Error('Le service recherché n\'existe pas ou a été supprimé.');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      case 500:
      case 502:
      case 503:
      case 504:
        console.error('Erreur serveur');
        const serverError = new Error('Le serveur a rencontré un problème. L\'équipe technique a été notifiée.');
        serverError.name = 'ServerError';
        throw serverError;
      default:
        // Récupérer le message d'erreur du serveur si disponible
        const errorMessage = error.response.data?.message || error.response.data?.error || `Erreur ${error.response.status}`;
        const defaultError = new Error(errorMessage);
        defaultError.name = 'APIError';
        throw defaultError;
    }
  }
  
  // Erreur générique
  throw error;
};

// Fonction pour gérer les retentatives en cas d'erreur
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1000): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Ne pas réessayer pour certaines erreurs
      if (error.name === 'AuthError' || 
          error.name === 'ForbiddenError' || 
          error.name === 'NotFoundError') {
        throw error;
      }
      
      // Si c'est la dernière tentative, arrêter et renvoyer l'erreur
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Attendre avant de réessayer (délai exponentiel)
      const delay = delayMs * Math.pow(2, attempt);
      console.log(`Tentative ${attempt + 1}/${maxRetries + 1} échouée, nouvelle tentative dans ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// API Service Explorer
const serviceExplorer = {
  // Get all services
  getAllServices: async (params: SearchParams = {}): Promise<{ services: Service[]; total: number }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.priceMin) queryParams.append('priceMin', params.priceMin.toString());
        if (params.priceMax) queryParams.append('priceMax', params.priceMax.toString());
        if (params.rating) queryParams.append('rating', params.rating.toString());
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        
        const url = `/api/services?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0
        };
      } catch (error) {
        handleApiError(error);
        return { services: [], total: 0 }; // Cette ligne ne sera jamais atteinte en raison du throw dans handleApiError
      }
    });
  },

  // Get services by category
  getServicesByCategory: async (
    category: string,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    isActive = true
  ): Promise<{ services: Service[]; total: number }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('category', category);
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        queryParams.append('sort', sort);
        queryParams.append('isActive', isActive.toString());
        
        const url = `/api/services?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0
        };
      } catch (error) {
        handleApiError(error);
        return { services: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Search services
  searchServices: async (
    searchTerm: string,
    page = 1,
    limit = 10
  ): Promise<{ services: Service[]; total: number }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('search', searchTerm);
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        const url = `/api/services/search?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0
        };
      } catch (error) {
        handleApiError(error);
        return { services: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service | null> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        return null; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Get service by slug
  getServiceBySlug: async (slug: string): Promise<Service | null> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/slug/${slug}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        return null; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Vérifier si un utilisateur peut commander un service
  canOrderService: async (serviceId: string, userId: string): Promise<{
    canOrder: boolean;
    message?: string;
  }> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/${serviceId}/can-order?userId=${userId}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la vérification de la commande:', error);
        return {
          canOrder: false,
          message: 'Une erreur est survenue lors de la vérification'
        };
      }
    }, 1); // Une seule retentative pour cette opération
  },

  // Get related services
  getRelatedServices: async (serviceId: string, limit = 4): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/${serviceId}/related?limit=${limit}`);
        return response.data || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Get featured services
  getFeaturedServices: async (limit = 6): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/featured?limit=${limit}`);
        return response.data || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Get services by user
  getServicesByUser: async (userId: string): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const response = await axios.get(`/api/services/user/${userId}`);
        return response.data || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Create service
  createService: async (serviceData: Partial<Service>): Promise<Service> => {
    return withRetry(async () => {
      try {
        const response = await axios.post('/api/services', serviceData);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    return withRetry(async () => {
      try {
        const response = await axios.put(`/api/services/${id}`, serviceData);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },

  // Delete service
  deleteService: async (id: string): Promise<boolean> => {
    return withRetry(async () => {
      try {
        await axios.delete(`/api/services/${id}`);
        return true;
      } catch (error) {
        handleApiError(error);
        return false; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Filter services
  filterServices: async (
    filters: {
      category?: string;
      priceMin?: number;
      priceMax?: number;
      rating?: number;
    },
    page = 1,
    limit = 10
  ): Promise<{ services: Service[]; total: number }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.priceMin) queryParams.append('priceMin', filters.priceMin.toString());
        if (filters.priceMax) queryParams.append('priceMax', filters.priceMax.toString());
        if (filters.rating) queryParams.append('rating', filters.rating.toString());
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        const url = `/api/services/filter?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0
        };
      } catch (error) {
        handleApiError(error);
        return { services: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  }
};

// Export pour la compatibilité avec le code existant
export const serviceExplorerService = serviceExplorer;
// Export le service
export { serviceExplorer };
export default serviceExplorer;