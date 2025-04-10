import axios from 'axios';

interface Provider {
  id: string;
  name: string;
  avatar?: string;
}

// Définition complète du type Service avec tous les champs nécessaires
interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  provider: Provider;
  images?: string[];
  image?: string;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  slug: string;
  isActive: boolean;
  isFeatured?: boolean;
  deliveryTime?: number;
  revisions?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: string;
  tags?: string[];
  queuedOrders?: number;
}

class ServiceService {
  private apiUrl = '/api/services';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes en ms

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
   * Supprime une entrée spécifique du cache
   * @param key Clé de cache à invalider
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
   * Récupère tous les services
   * @returns Promesse avec la liste des services
   */
  async getAllServices(): Promise<Service[]> {
    return this.getWithCaching('allServices', async () => {
      try {
        const response = await axios.get(this.apiUrl);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des services:', error);
        return [];
      }
    });
  }

  /**
   * Récupère un service par son ID ou son slug
   * @param idOrSlug ID ou slug du service
   * @returns Promesse avec le service
   */
  async getServiceById(idOrSlug: string): Promise<Service | null> {
    return this.getWithCaching(`service_${idOrSlug}`, async () => {
      try {
        // Vérifier si c'est un ID ou un slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        
        let endpoint = isUUID 
          ? `${this.apiUrl}/${idOrSlug}`
          : `${this.apiUrl}/slug/${idOrSlug}`;
        
        const response = await axios.get(endpoint);
        
        // Si nous obtenons un objet service valide
        if (response.data && response.data.id) {
          // Enrichir le service avec les données nécessaires pour la page de détail
          return this.transformServiceForDetailPage(response.data);
        }
        
        // Si nous obtenons un objet avec une propriété service (format API différent)
        if (response.data && response.data.service) {
          return this.transformServiceForDetailPage(response.data.service);
        }
        
        // Aucun format reconnu, retourner les données brutes
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération du service ${idOrSlug}:`, error);
        
        // En cas d'erreur, essayer de récupérer par slug si on avait essayé par ID, ou vice versa
        try {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
          const alternateEndpoint = isUUID 
            ? `${this.apiUrl}/slug/${idOrSlug}`  // Si c'était un ID, essayer comme slug
            : `${this.apiUrl}/${idOrSlug}`;      // Si c'était un slug, essayer comme ID
          
          const response = await axios.get(alternateEndpoint);
          
          if (response.data && (response.data.id || response.data.service)) {
            const serviceData = response.data.service || response.data;
            return this.transformServiceForDetailPage(serviceData);
          }
          
          return null;
        } catch (fallbackError) {
          console.error(`Erreur lors de la récupération alternative du service ${idOrSlug}:`, fallbackError);
          return null;
        }
      }
    });
  }

  /**
   * Transforme un service pour la page de détail en ajoutant des informations manquantes
   * @param service Données du service à transformer
   * @returns Service enrichi
   */
  private transformServiceForDetailPage(service: any): Service {
    // Vérifier que le service a des propriétés essentielles
    if (!service.id || !service.title) {
      console.warn('Service incomplet:', service);
    }
    
    // Ajouter les champs manquants avec des valeurs par défaut
    return {
      id: service.id || '',
      title: service.title || 'Service sans titre',
      description: service.description || '',
      price: typeof service.price === 'number' ? service.price : 0,
      rating: typeof service.rating === 'number' ? service.rating : 0,
      totalReviews: typeof service.totalReviews === 'number' ? service.totalReviews : 0,
      totalOrders: typeof service.totalOrders === 'number' ? service.totalOrders : 0,
      provider: service.provider || {
        id: '',
        name: 'Freelance'
      },
      images: Array.isArray(service.images) ? service.images : 
              (service.image ? [service.image] : []),
      slug: service.slug || service.id || '',
      isActive: typeof service.isActive === 'boolean' ? service.isActive : true,
      deliveryTime: typeof service.deliveryTime === 'number' ? service.deliveryTime : 0,
      revisions: typeof service.revisions === 'number' ? service.revisions : 0,
      // Ajouter d'autres propriétés utiles pour la page de détail
      createdAt: service.createdAt || new Date().toISOString(),
      updatedAt: service.updatedAt || new Date().toISOString(),
      category: service.category || null,
      tags: Array.isArray(service.tags) ? service.tags : [],
      isFeatured: typeof service.isFeatured === 'boolean' ? service.isFeatured : false,
      shortDescription: service.shortDescription || ''
    };
  }

  /**
   * Récupère les services de la catégorie spécifiée
   * @param categoryId ID de la catégorie
   * @returns Promesse avec la liste des services de la catégorie
   */
  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    return this.getWithCaching(`category_${categoryId}`, async () => {
      try {
        const response = await axios.get(`${this.apiUrl}/category/${categoryId}`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des services de la catégorie ${categoryId}:`, error);
        return [];
      }
    });
  }

  /**
   * Récupère les services du fournisseur spécifié
   * @param providerId ID du fournisseur
   * @returns Promesse avec la liste des services du fournisseur
   */
  async getServicesByProvider(providerId: string): Promise<Service[]> {
    return this.getWithCaching(`provider_${providerId}`, async () => {
      try {
        const response = await axios.get(`${this.apiUrl}/provider/${providerId}`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des services du fournisseur ${providerId}:`, error);
        return [];
      }
    });
  }

  /**
   * Récupère les meilleurs services (plus de 5 avis et trié par nombre de commandes)
   * @param limit Limite de résultats (par défaut 4)
   * @returns Promesse avec la liste des meilleurs services
   */
  async getTopServices(limit: number = 4): Promise<Service[]> {
    return this.getWithCaching(`topServices_${limit}`, async () => {
      try {
        // Essayer d'abord de récupérer via l'API
        try {
          const response = await axios.get(`${this.apiUrl}/top?limit=${limit}&minReviews=5`);
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data;
          }
        } catch (apiError) {
          console.warn('Erreur lors de la récupération des meilleurs services via API:', apiError);
          // Si l'API échoue, continuer avec les données simulées
        }
        
        // Simuler un délai pour éviter les changements brutaux d'UI
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Données simulées
        return [
          {
            id: "service-1",
            title: "Création de logo professionnel",
            price: 5000,
            rating: 4.9,
            totalReviews: 38,
            totalOrders: 128,
            provider: {
              id: "provider-1",
              name: "Ahmed D.",
              avatar: "/img/avatars/designer-ahmed.jpg"
            },
            description: "Je crée un logo unique et professionnel qui représente parfaitement votre marque avec 3 versions et fichiers sources inclus.",
            slug: "creation-logo-professionnel",
            images: ["/img/services/logo-design.jpg"]
          },
          {
            id: "service-2",
            title: "Création site web vitrine",
            price: 30000,
            rating: 4.8,
            totalReviews: 26,
            totalOrders: 96,
            provider: {
              id: "provider-2",
              name: "Fatou M.",
              avatar: "/img/avatars/developer-fatou.jpg"
            },
            description: "Je développe un site web responsive et moderne pour votre entreprise, optimisé pour le référencement avec hébergement inclus.",
            slug: "site-web-vitrine",
            images: ["/img/services/web-development.jpg"]
          },
          {
            id: "service-3",
            title: "Traduction français-wolof",
            price: 4000,
            rating: 5.0,
            totalReviews: 42,
            totalOrders: 85,
            provider: {
              id: "provider-3",
              name: "Abdou N.",
              avatar: "/img/avatars/translator-abdou.jpg"
            },
            description: "Je traduis vos documents, textes ou sites web du français vers le wolof avec précision et adaptation culturelle.",
            slug: "traduction-francais-wolof",
            images: ["/img/services/translation.jpg"]
          },
          {
            id: "service-4",
            title: "Design posts réseaux sociaux",
            price: 8000,
            rating: 4.7,
            totalReviews: 31,
            totalOrders: 78,
            provider: {
              id: "provider-4",
              name: "Aida S.",
              avatar: "/img/avatars/designer-aida.jpg"
            },
            description: "Je crée 10 visuels uniques et attrayants pour vos réseaux sociaux, adaptés à votre marque et optimisés pour chaque plateforme.",
            slug: "conception-graphique",
            images: ["/img/services/graphic-design.jpg"]
          }
        ];
      } catch (error) {
        console.error('Erreur lors de la récupération des meilleurs services:', error);
        return [];
      }
    });
  }

  /**
   * Crée un nouveau service
   * @param serviceData Données du service
   * @returns Promesse avec le résultat de la création
   */
  async createService(serviceData: Partial<Service>): Promise<{ success: boolean; message: string; serviceId?: string }> {
    try {
      const response = await axios.post(this.apiUrl, serviceData);
      // Invalider le cache après une création
      this.invalidateCache('allServices');
      this.invalidateCache(`topServices_4`); // Cache par défaut des meilleurs services
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
      return { success: false, message: 'Une erreur est survenue lors de la création du service' };
    }
  }

  /**
   * Met à jour un service existant
   * @param id ID du service à mettre à jour
   * @param serviceData Nouvelles données du service
   * @returns Promesse avec le résultat de la mise à jour
   */
  async updateService(id: string, serviceData: Partial<Service>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.put(`${this.apiUrl}/${id}`, serviceData);
      // Invalider le cache après une mise à jour
      this.invalidateCache(`service_${id}`);
      this.invalidateCache('allServices');
      this.invalidateCache(`topServices_4`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du service ${id}:`, error);
      return { success: false, message: 'Une erreur est survenue lors de la mise à jour du service' };
    }
  }

  /**
   * Supprime un service
   * @param id ID du service à supprimer
   * @returns Promesse avec le résultat de la suppression
   */
  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.apiUrl}/${id}`);
      // Invalider le cache après une suppression
      this.invalidateCache(`service_${id}`);
      this.invalidateCache('allServices');
      this.invalidateCache(`topServices_4`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du service ${id}:`, error);
      return { success: false, message: 'Une erreur est survenue lors de la suppression du service' };
    }
  }

  /**
   * Récupère les services liés à un service 
   * @param serviceId ID du service
   * @param limit Limite de résultats (par défaut 4)
   * @returns Promesse avec la liste des services liés
   */
  async getRelatedServices(serviceId: string, limit: number = 4): Promise<Service[]> {
    return this.getWithCaching(`related_${serviceId}_${limit}`, async () => {
      try {
        // Essayer de récupérer les services liés par l'API
        try {
          const response = await axios.get(`${this.apiUrl}/${serviceId}/related?limit=${limit}`);
          if (response.data && Array.isArray(response.data)) {
            return response.data.map(service => this.transformServiceForDetailPage(service));
          }
          
          if (response.data && Array.isArray(response.data.services)) {
            return response.data.services.map(service => this.transformServiceForDetailPage(service));
          }
        } catch (apiError) {
          console.warn(`Erreur lors de la récupération des services liés à ${serviceId}:`, apiError);
          // Si l'API de services liés échoue, continuer avec l'approche alternative
        }
        
        // Approche alternative - récupérer le service pour connaître sa catégorie
        const service = await this.getServiceById(serviceId);
        if (!service || !service.category || !service.category.id) {
          return [];
        }
        
        // Récupérer les services de la même catégorie
        const categoryServices = await this.getServicesByCategory(service.category.id);
        
        // Filtrer pour exclure le service courant et limiter le nombre
        return categoryServices
          .filter(s => s.id !== serviceId)
          .slice(0, limit);
      } catch (error) {
        console.error(`Erreur lors de la récupération des services liés à ${serviceId}:`, error);
        return [];
      }
    });
  }
}

export default new ServiceService(); 