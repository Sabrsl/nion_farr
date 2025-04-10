/**
 * Utilitaire de gestion du token d'authentification
 * Fournit des méthodes pour stocker, récupérer et supprimer le token
 * de manière cohérente dans l'application
 */

// Constante pour le nom de la clé de stockage du token
const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Stocke le token d'authentification dans le localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

/**
 * Récupère le token d'authentification depuis le localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return null;
};

/**
 * Supprime le token d'authentification du localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

/**
 * Vérifie si un token est présent
 */
export const hasToken = (): boolean => {
  return !!getToken();
};

/**
 * Vérifie si un token est présent et valide (non expiré)
 * Note: cette vérification est basique et ne garantit pas que le token
 * est accepté par le backend
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Extraction de la partie payload du JWT (2ème partie)
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    // Décodage de la partie payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Vérification de l'expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      return expDate > new Date();
    }
    
    return true;
  } catch (e) {
    console.error('Erreur lors de la vérification du token:', e);
    return false;
  }
};

export default {
  setToken,
  getToken,
  removeToken,
  hasToken,
  isTokenValid
}; 