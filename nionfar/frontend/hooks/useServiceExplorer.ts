import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServiceExplorer } from '../services/serviceExplorerService';
import type { Service } from '../types';
import { logger } from '../utils/logger.js';
import { handleComponentError } from '../utils/error-handlers';

// Define types for IDs
type CategoryId = string;
type ServiceId = string;
type UserId = string;

// Instance du service
const serviceExplorer = getServiceExplorer();

// Clés de query
const QUERY_KEYS = {
  allServices: 'services',
  service: (id: string) => ['service', id],
  serviceBySlug: (slug: string) => ['service', 'slug', slug],
  servicesByCategory: (categoryId: string) => ['services', 'category', categoryId],
  searchServices: (query: string) => ['services', 'search', query],
  popularServices: 'popularServices',
  relatedServices: (categoryId: string, serviceId: string) => ['services', 'related', categoryId, serviceId],
  recommendedServices: (userId?: string) => ['services', 'recommended', userId],
  recentlyViewed: (userId?: string) => ['services', 'recentlyViewed', userId],
};

/**
 * Hook pour récupérer tous les services publics avec pagination
 */
export function usePublicServices(options = {}, queryOptions = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.allServices, options],
    queryFn: () => serviceExplorer.getAllPublicServices(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions
  });
}

/**
 * Hook pour l'infinite loading des services
 */
export function useInfiniteServices(options = {}, queryOptions = {}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.allServices, 'infinite', options],
    queryFn: ({ pageParam = 1 }) => serviceExplorer.getAllPublicServices({
      ...options,
      page: pageParam,
    }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage;
      return page < pages ? page + 1 : undefined;
    },
    ...queryOptions
  });
}

/**
 * Hook pour récupérer un service par ID
 */
export function useService(id: ServiceId | null, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.service(id || ''),
    queryFn: () => serviceExplorer.getServiceById(id as ServiceId),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options
  });
}

/**
 * Hook pour récupérer un service par slug
 */
export function useServiceBySlug(slug: string | null, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceBySlug(slug || ''),
    queryFn: () => serviceExplorer.getServiceBySlug(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options
  });
}

/**
 * Hook pour récupérer les services par catégorie
 */
export function useServicesByCategory(categoryId: CategoryId | null, options = {}, queryOptions = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.servicesByCategory(categoryId || ''),
    queryFn: () => serviceExplorer.getServicesByCategory(categoryId as CategoryId, options),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions
  });
}

/**
 * Hook pour rechercher des services
 */
export function useSearchServices(query: string, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.searchServices(query),
    queryFn: () => serviceExplorer.searchServices(query, options),
    enabled: query.length > 2, // Seulement rechercher si plus de 2 caractères
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
}

/**
 * Hook pour une recherche de services debounced
 */
export function useDebouncedSearchServices(initialQuery = '', options = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const searchResults = useSearchServices(debouncedQuery, options);

  return {
    query,
    setQuery,
    debouncedQuery,
    ...searchResults
  };
}

/**
 * Hook pour récupérer les services populaires
 */
export function usePopularServices(limit = 6, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.popularServices, { limit }],
    queryFn: () => serviceExplorer.getPopularServices(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options
  });
}

/**
 * Hook pour récupérer les services liés à un service
 */
export function useRelatedServices(categoryId: CategoryId | null, serviceId: ServiceId | null, limit = 4, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.relatedServices(categoryId || '', serviceId || ''),
    queryFn: () => serviceExplorer.getRelatedServices(categoryId as CategoryId, serviceId as ServiceId, limit),
    enabled: !!categoryId && !!serviceId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options
  });
}

/**
 * Hook pour vérifier si un utilisateur peut commander un service
 */
export function useCanOrderService(serviceId: ServiceId | null, userId: UserId | null) {
  return useQuery({
    queryKey: ['canOrderService', serviceId, userId],
    queryFn: () => serviceExplorer.canOrderService(serviceId as ServiceId, userId as UserId),
    enabled: !!serviceId && !!userId,
    staleTime: 1000 * 60, // 1 minute
    retry: 1
  });
}

/**
 * Hook pour les services recommandés à un utilisateur
 */
export function useRecommendedServices(userId?: UserId, limit = 6, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.recommendedServices(userId),
    queryFn: () => serviceExplorer.getRecommendedServices(userId, limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options
  });
}

/**
 * Hook pour les services récemment consultés
 */
export function useRecentlyViewedServices(userId?: UserId, limit = 4, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.recentlyViewed(userId),
    queryFn: () => serviceExplorer.getRecentlyViewedServices(userId, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
}

/**
 * Hook pour suivre la consultation d'un service
 */
export function useTrackServiceView() {
  const queryClient = useQueryClient();

  const trackView = useCallback(async (serviceId: ServiceId, userId?: UserId) => {
    try {
      await serviceExplorer.trackServiceView(serviceId, userId);
      
      // Invalider la query des services récemment vus
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.recentlyViewed(userId)
      });
    } catch (error) {
      logger.warn('Failed to track service view', { serviceId, userId, error });
    }
  }, [queryClient]);

  return trackView;
}

/**
 * Hook pour gérer la visualisation d'un service et suivre l'affichage
 */
export function useServiceDetails(serviceIdOrSlug: string, options = {}) {
  const isSlug = !serviceIdOrSlug.includes('-'); // Simple heuristique pour déterminer si c'est un slug ou un ID
  const trackServiceView = useTrackServiceView();
  const userId = useMemo(() => {
    // Récupérer l'ID utilisateur du store ou localStorage
    return null; // Placeholder - À adapter selon la gestion d'authentification
  }, []);

  // Requête pour le service
  const serviceQuery = isSlug
    ? useServiceBySlug(serviceIdOrSlug, options)
    : useService(serviceIdOrSlug, options);

  // Suivre la visualisation quand le service est chargé
  useEffect(() => {
    if (serviceQuery.isSuccess && serviceQuery.data) {
      trackServiceView(serviceQuery.data.id, userId);
    }
  }, [serviceQuery.isSuccess, serviceQuery.data, trackServiceView, userId]);

  // Charger les services liés si le service est trouvé
  const relatedServicesQuery = useRelatedServices(
    serviceQuery.data?.category?.id || null,
    serviceQuery.data?.id || null,
    4,
    { enabled: !!serviceQuery.data }
  );

  return {
    service: serviceQuery,
    relatedServices: relatedServicesQuery,
    isLoading: serviceQuery.isLoading,
    isError: serviceQuery.isError,
    error: serviceQuery.error
  };
}

/**
 * Hook pour le carrousel de services (populaires, recommandés, etc.)
 */
export function useServiceCarousel(type: 'popular' | 'recommended' | 'recent' = 'popular', limit = 6, userId?: UserId) {
  // Sélectionner la bonne requête selon le type
  const query = (() => {
    switch (type) {
      case 'popular':
        return usePopularServices(limit);
      case 'recommended':
        return useRecommendedServices(userId, limit);
      case 'recent':
        return useRecentlyViewedServices(userId, limit);
      default:
        return usePopularServices(limit);
    }
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const services = query.data || [];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= services.length ? 0 : prevIndex + 1
    );
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? services.length - 1 : prevIndex - 1
    );
  }, [services.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play avec intervalle de 5 secondes
  useEffect(() => {
    if (services.length <= 1) return;
    
    const intervalId = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalId);
  }, [nextSlide, services.length]);

  return {
    currentIndex,
    services,
    nextSlide,
    prevSlide,
    goToSlide,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
} 