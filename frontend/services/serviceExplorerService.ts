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
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  }
  throw error;
};

// API Service Explorer
const serviceExplorer = {
  // Get all services
  getAllServices: async (params: SearchParams = {}): Promise<{ services: Service[]; total: number }> => {
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
      return { services: [], total: 0 };
    }
  },

  // Get services by category
  getServicesByCategory: async (
    category: string,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    isActive = true
  ): Promise<{ services: Service[]; total: number }> => {
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
      return { services: [], total: 0 };
    }
  },

  // Search services
  searchServices: async (
    searchTerm: string,
    page = 1,
    limit = 10
  ): Promise<{ services: Service[]; total: number }> => {
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
      return { services: [], total: 0 };
    }
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service | null> => {
    try {
      const response = await axios.get(`/api/services/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Get service by slug
  getServiceBySlug: async (slug: string): Promise<Service | null> => {
    try {
      const response = await axios.get(`/api/services/slug/${slug}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Vérifier si un utilisateur peut commander un service
  canOrderService: async (serviceId: string, userId: string): Promise<{
    canOrder: boolean;
    message?: string;
  }> => {
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
  },

  // Get related services
  getRelatedServices: async (serviceId: string, limit = 4): Promise<Service[]> => {
    try {
      const response = await axios.get(`/api/services/${serviceId}/related?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Get featured services
  getFeaturedServices: async (limit = 6): Promise<Service[]> => {
    try {
      const response = await axios.get(`/api/services/featured?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Get services by user
  getServicesByUser: async (userId: string): Promise<Service[]> => {
    try {
      const response = await axios.get(`/api/services/user/${userId}`);
      return response.data || [];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Create service
  createService: async (serviceData: Partial<Service>): Promise<Service> => {
    try {
      const response = await axios.post('/api/services', serviceData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    try {
      const response = await axios.put(`/api/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Delete service
  deleteService: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`/api/services/${id}`);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
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
      return { services: [], total: 0 };
    }
  }
};

// Export pour la compatibilité avec le code existant
export const serviceExplorerService = serviceExplorer;
// Export le service
export { serviceExplorer };
export default serviceExplorer;