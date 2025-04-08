import axios from 'axios';

/**
 * Creates an axios instance with predefined configuration
 * @param config - Axios configuration options
 * @returns Axios instance
 */
export const createApi = (config = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  
  const api = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds default timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });
  
  // Add interceptors for logging
  api.interceptors.request.use(
    (config) => {
      // Utiliser console.log uniquement en développement
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );
  
  api.interceptors.response.use(
    (response) => {
      // Utiliser console.log uniquement en développement
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        console.log(`[API] Response: ${response.status}`);
      }
      return response;
    },
    (error) => {
      // Gérer les erreurs réseau (connexion refusée, timeout, etc.)
      if (!error.response) {
        console.error('[API Network Error]', error.message);
        return Promise.reject({
          status: 0,
          message: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
          isNetworkError: true,
          originalError: error
        });
      }
      
      // Gérer les erreurs de serveur
      console.error('[API Response Error]', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );
  
  return api;
};

/**
 * Creates an API client instance with authentication
 * @param token - JWT token for authentication
 * @param config - Additional axios configuration
 * @returns Authenticated axios instance
 */
export const createAuthApi = (token, config = {}) => {
  const api = createApi(config);
  
  // Add authorization header if token exists
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Ajouter un intercepteur pour rafraîchir le token si besoin
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Si l'erreur est 401 (non autorisé), tenter de rafraîchir le token
      // ou rediriger vers la page de connexion
      if (error.response?.status === 401) {
        // Ici, on pourrait implémenter une logique de rafraîchissement de token
        // ou simplement rediriger vers la page de connexion
        // Pour l'instant, nous nous contentons de rejeter l'erreur
      }
      return Promise.reject(error);
    }
  );
  
  return api;
}; 