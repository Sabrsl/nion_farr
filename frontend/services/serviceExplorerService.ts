import { Service, User, Category } from '../types';
import type { OrderStatus } from '../types';
import { NextRouter } from 'next/router';
import axios from 'axios';

// Define missing types that were imported
type CategoryId = string;
type ServiceId = string;
type ServiceQuery = any;

// API URLs
const LOCAL_API_URL = 'http://localhost:3001/api';
const RENDER_API_URL = 'https://nionfar-backend.onrender.com/api';

// Get the base API URL based on environment
const getBaseApiUrl = () => {
  // Priorité 1: Variable d'environnement
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Priorité 2: URL stockée dans localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('API_URL')) {
    return localStorage.getItem('API_URL');
  }

  // Priorité 3: Localhost en développement
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return LOCAL_API_URL;
  }
  
  // Par défaut: URL de production Render
  return RENDER_API_URL;
};

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
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services?${queryParams.toString()}`;
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
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services?${queryParams.toString()}`;
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
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services/search?${queryParams.toString()}`;
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
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/${id}`);
        return response.data.service || null;
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
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/slug/${slug}`);
        return response.data.service || null;
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
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/${serviceId}/can-order?userId=${userId}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la vérification de la commande:', error);
        return {
          canOrder: false,
          message: 'Une erreur est survenue lors de la vérification'
        };
      }
    });
  },

  // Get related services
  getRelatedServices: async (serviceId: string, limit = 3): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/${serviceId}/related?limit=${limit}`);
        return response.data.services || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Get featured services
  getFeaturedServices: async (limit = 3): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/featured?limit=${limit}`);
        return response.data.services || [];
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
    try {
      const baseUrl = getBaseApiUrl();
      const response = await axios.post(`${baseUrl}/services`, serviceData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error; // Propagation de l'erreur après logging
    }
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    try {
      const baseUrl = getBaseApiUrl();
      const response = await axios.put(`${baseUrl}/services/${id}`, serviceData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error; // Propagation de l'erreur après logging
    }
  },

  // Delete service
  deleteService: async (id: string): Promise<void> => {
    try {
      const baseUrl = getBaseApiUrl();
      await axios.delete(`${baseUrl}/services/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error; // Propagation de l'erreur après logging
    }
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
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services/filter?${queryParams.toString()}`;
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

  // Get services by user
  getUserServices: async (userId: string): Promise<Service[]> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/users/${userId}/services`);
        return response.data.services || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Méthode pour noter un service
  rateService: async (
    serviceId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const baseUrl = getBaseApiUrl();
      const response = await axios.post(
        `${baseUrl}/services/${serviceId}/reviews`,
        { rating, comment },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la notation du service',
      };
    }
  },

  // Récupérer les avis pour un service
  getServiceReviews: async (
    serviceId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: any[];
    total: number;
  }> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(
          `${baseUrl}/services/${serviceId}/reviews?page=${page}&limit=${limit}`
        );
        return {
          reviews: response.data.reviews || [],
          total: response.data.total || 0,
        };
      } catch (error) {
        handleApiError(error);
        return { reviews: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Récupérer toutes les catégories
  getAllCategories: async (): Promise<Category[]> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/categories`);
        return response.data.categories || [];
      } catch (error) {
        handleApiError(error);
        return []; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Récupérer une catégorie par ID
  getCategoryById: async (id: CategoryId): Promise<Category | null> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/categories/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        return null; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Récupérer une catégorie par slug
  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/categories/slug/${slug}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        return null; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Commander un service
  orderService: async (
    serviceId: string,
    orderDetails: any
  ): Promise<{
    success: boolean;
    orderId?: string;
    message?: string;
  }> => {
    try {
      const baseUrl = getBaseApiUrl();
      const response = await axios.post(
        `${baseUrl}/services/${serviceId}/orders`,
        orderDetails,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        orderId: response.data.orderId,
        message: 'Commande créée avec succès',
      };
    } catch (error) {
      handleApiError(error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la création de la commande',
      };
    }
  },

  // Récupérer les commandes d'un service
  getServiceOrders: async (
    serviceId: string,
    status?: OrderStatus,
    page = 1,
    limit = 10
  ): Promise<{
    orders: any[];
    total: number;
  }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (status) queryParams.append('status', status);
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services/${serviceId}/orders?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          orders: response.data.orders || [],
          total: response.data.total || 0,
        };
      } catch (error) {
        handleApiError(error);
        return { orders: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Chercher des services par géolocalisation
  searchServicesByLocation: async (
    lat: number,
    lng: number,
    radius = 10, // en km
    page = 1,
    limit = 10,
    categoryId?: string
  ): Promise<{
    services: Service[];
    total: number;
  }> => {
    return withRetry(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('lat', lat.toString());
        queryParams.append('lng', lng.toString());
        queryParams.append('radius', radius.toString());
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (categoryId) queryParams.append('category', categoryId);
        
        const baseUrl = getBaseApiUrl();
        const url = `${baseUrl}/services/nearby?${queryParams.toString()}`;
        const response = await axios.get(url);
        
        return {
          services: response.data.services || [],
          total: response.data.total || 0,
        };
      } catch (error) {
        handleApiError(error);
        return { services: [], total: 0 }; // Cette ligne ne sera jamais atteinte
      }
    });
  },

  // Récupérer les statistiques d'un service
  getServiceStats: async (): Promise<{
    totalServices: number;
    totalCategories: number;
    topCategories: { name: string; count: number }[];
  }> => {
    return withRetry(async () => {
      try {
        const baseUrl = getBaseApiUrl();
        const response = await axios.get(`${baseUrl}/services/stats`);
        return response.data || {
          totalServices: 0,
          totalCategories: 0,
          topCategories: [],
        };
      } catch (error) {
        handleApiError(error);
        return {
          totalServices: 0,
          totalCategories: 0,
          topCategories: [],
        }; // Cette ligne ne sera jamais atteinte
      }
    });
  },
};

// Export pour la compatibilité avec le code existant
export const serviceExplorerService = serviceExplorer;
// Export le service
export { serviceExplorer };
export default serviceExplorer;