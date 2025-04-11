/**
 * Système de mise en cache des résultats d'API côté client
 * Permet d'optimiser les performances et de réduire les appels API
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  defaultTTL: number; // Durée de vie par défaut en millisecondes
  maxItems: number;   // Nombre maximum d'éléments dans le cache
  storageKey: string; // Clé pour le stockage dans localStorage
}

class ApiCache {
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;
  private isInitialized: boolean = false;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes par défaut
      maxItems: 100,             // 100 items maximum
      storageKey: 'nionfar_api_cache',
      ...config
    };
  }

  /**
   * Initialise le cache depuis localStorage
   */
  public init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    try {
      const storedCache = localStorage.getItem(this.config.storageKey);
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        
        // Valider et charger les entrées du cache
        Object.entries(parsedCache).forEach(([key, value]: [string, any]) => {
          if (value.expiresAt && value.expiresAt > Date.now()) {
            this.cache.set(key, value as CacheItem<any>);
          }
        });
        
        // Nettoyer le cache expiré
        this.cleanup();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing API cache:', error);
    }
  }

  /**
   * Sauvegarde le cache dans localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.config.storageKey, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving API cache to storage:', error);
    }
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  public cleanup(): void {
    const now = Date.now();
    let expired = 0;
    
    // Utiliser Array.from pour la compatibilité avec ES5
    Array.from(this.cache.keys()).forEach(key => {
      const item = this.cache.get(key);
      if (item && item.expiresAt < now) {
        this.cache.delete(key);
        expired++;
      }
    });
    
    if (expired > 0) {
      this.saveToStorage();
    }
  }

  /**
   * Récupère une valeur du cache
   * @param key - Clé du cache
   */
  public get<T>(key: string): T | null {
    this.init();
    
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Vérifier si l'élément est expiré
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Met une valeur dans le cache
   * @param key - Clé du cache
   * @param data - Données à mettre en cache
   * @param ttl - Durée de vie en millisecondes (optionnel)
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    this.init();
    
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.config.maxItems) {
      this.enforceMaxItems();
    }
    
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.config.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
    
    this.saveToStorage();
  }

  /**
   * Supprime un élément du cache
   * @param key - Clé du cache
   */
  public delete(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.saveToStorage();
    }
  }

  /**
   * Alias pour delete() utilisé par le système précédent
   * @param key - Clé du cache à invalider
   */
  public invalidateCache(key: string): void {
    this.delete(key);
  }

  /**
   * Vide entièrement le cache
   */
  public clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Force le respect du nombre maximal d'éléments
   * en supprimant les éléments les plus anciens
   */
  private enforceMaxItems(): void {
    if (this.cache.size <= this.config.maxItems) return;
    
    // Convertir en tableau pour pouvoir trier
    const cacheKeys = Array.from(this.cache.keys());
    const items: [string, CacheItem<any>][] = [];
    
    // Créer manuellement le tableau d'entrées
    cacheKeys.forEach(key => {
      const item = this.cache.get(key);
      if (item) {
        items.push([key, item]);
      }
    });
    
    // Trier par timestamp (du plus ancien au plus récent)
    items.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Supprimer les éléments les plus anciens
    const itemsToRemove = items.slice(0, items.length - this.config.maxItems);
    itemsToRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Méthode utilitaire pour faire un appel API avec mise en cache
   * @param key - Clé du cache
   * @param fetchFn - Fonction pour récupérer les données de l'API
   * @param ttl - Durée de vie en ms (optionnel)
   */
  public async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Vérifier si les données sont dans le cache
    const cachedData = this.get<T>(key);
    if (cachedData) {
      return cachedData;
    }
    
    // Récupérer les données depuis l'API
    const data = await fetchFn();
    
    // Stocker dans le cache
    this.set(key, data, ttl);
    
    return data;
  }
}

// Exporter une instance singleton
const apiCache = new ApiCache();
export default apiCache; 