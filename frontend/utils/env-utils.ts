/**
 * Utilitaires pour détecter et gérer l'environnement d'exécution
 */

/**
 * Détermine si le code s'exécute côté serveur ou client
 */
export const isServer = typeof window === 'undefined';
export const isClient = !isServer;

/**
 * Déterminer l'environnement d'exécution
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Information sur le navigateur et le système
 */
export const getBrowserInfo = () => {
  if (isServer) return null;
  
  try {
    const userAgent = window.navigator.userAgent;
    const browserName = detectBrowser(userAgent);
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
    
    return {
      userAgent,
      browserName,
      isMobile,
      language: window.navigator.language,
      platform: window.navigator.platform,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  } catch (error) {
    console.warn('Failed to detect browser info:', error);
    return null;
  }
};

/**
 * Détecte le nom du navigateur à partir de l'user agent
 */
function detectBrowser(userAgent: string): string {
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/chrome/i.test(userAgent)) {
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/opr/i.test(userAgent)) return 'Opera';
    return 'Chrome';
  }
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/trident|msie/i.test(userAgent)) return 'Internet Explorer';
  return 'Unknown';
}

/**
 * Récupère les informations sur l'application
 */
export const getAppInfo = () => {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'NionFar',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'development',
    cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || (isClient ? window.location.origin : '')
  };
};

/**
 * Configure les variables d'environnement requises
 * Utile pour le débogage
 */
export function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_NAME'
  ];
  
  const missing = requiredVars.filter(
    (name) => !process.env[name]
  );
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Some features may not work correctly.`
    );
  }
  
  return missing.length === 0;
}

/**
 * Détecte si l'application est en mode SSR
 */
export const isSSR = isServer || 
  (typeof document !== 'undefined' && document?.getElementById('__next')?.hasAttribute('data-reactroot'));

/**
 * Détecte les fonctionnalités du navigateur
 */
export const detectFeatures = () => {
  if (isServer) return {};
  
  return {
    localStorage: storageAvailable('localStorage'),
    sessionStorage: storageAvailable('sessionStorage'),
    webp: detectWebP()
  };
};

/**
 * Vérifie si un type de stockage est disponible
 */
function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (isServer) return false;
  
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Détecte le support WebP
 */
function detectWebP(): boolean {
  if (isServer) return false;

  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
  } catch (e) {}
  
  return false;
}

export default {
  isServer,
  isClient,
  isDevelopment,
  isProduction,
  isTest,
  getBrowserInfo,
  getAppInfo,
  validateEnvironment,
  isSSR,
  detectFeatures
}; 