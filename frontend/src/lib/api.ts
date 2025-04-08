import axios from 'axios';

// Pour la production : https://nionfar-backend.onrender.com/api
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';

console.log('🔌 API Configuration:', { 
  baseURL,
  env: process.env.NODE_ENV,
  publicUrl: process.env.NEXT_PUBLIC_API_URL
});

// Test de connectivité direct
const testBackendConnectivity = async () => {
  console.log('🔍 Test de connectivité au backend:', baseURL);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Utiliser l'API directement sans proxy pour éviter les problèmes CORS
    const testUrl = baseURL.includes('localhost') 
      ? `${baseURL}/health`
      : 'https://nionfar-backend.onrender.com/api/health';
    
    console.log('Test URL:', testUrl);
    
    const response = await fetch(testUrl, {
      signal: controller.signal,
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors',
      credentials: 'omit' // Important pour éviter les problèmes CORS
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend disponible:', data);
      return true;
    } else {
      console.error('❌ Échec du test de connectivité - Statut:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion au backend:', error);
    return false;
  }
};

// Lancer le test de connectivité au démarrage
if (typeof window !== 'undefined') {
  testBackendConnectivity().then(isAvailable => {
    if (!isAvailable) {
      console.warn('⚠️ Le backend semble inaccessible - Vérifiez la configuration');
    }
  });
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes pour éviter les timeouts prématurés
  withCredentials: false, // Désactiver l'envoi des cookies pour éviter les problèmes CORS
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Récupération du token depuis localStorage
    const token = localStorage.getItem('nionfarToken');
    
    // Ajout du token dans les en-têtes si disponible
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Assurer que l'URL est bien formée, même en cas d'erreur de configuration
    if (!config.url?.startsWith('http')) {
      // Utiliser l'URL directe en cas d'échec du proxy
      if (config.baseURL === '/api' || !config.baseURL) {
        config.baseURL = 'https://nionfar-backend.onrender.com/api';
      }
    }
    
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Erreur avec réponse du serveur
    if (error.response) {
      console.error(`❌ Erreur API ${error.response.status}:`, error.response.data);
      
      // Redirection vers la page de connexion si non authentifié
      if (error.response.status === 401) {
        console.log('🔒 Session expirée, redirection vers la page de connexion');
        window.location.href = '/auth/login';
      }
    } 
    // Erreur de requête (timeout, réseau, etc.)
    else if (error.request) {
      console.error('❌ Erreur réseau - Pas de réponse du serveur:', error.request);
      
      // Test de connectivité lors d'une erreur réseau
      testBackendConnectivity().then(isAvailable => {
        if (!isAvailable) {
          console.error('❌❌ Confirmation: Le serveur backend est inaccessible');
          // Ici vous pourriez afficher une notification à l'utilisateur
        }
      });
    } 
    // Autres erreurs
    else {
      console.error('❌ Erreur lors de la configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonctions d'authentification qui correspondent précisément aux attentes du backend

/**
 * Fonction pour se connecter à l'API
 * @param emailOrPhone - Email ou téléphone de l'utilisateur
 * @param password - Mot de passe
 * @param rememberMe - Option de mémorisation de session
 * @returns Réponse de l'API contenant le token et les informations utilisateur
 */
export const login = async (emailOrPhone: string, password: string, rememberMe = false) => {
  console.log('🔐 Tentative de connexion API:', { email: emailOrPhone });
  console.log('🌐 URL d\'API utilisée:', baseURL);
  
  try {
    // Le backend attend "email" même si on lui envoie un numéro de téléphone
    const apiData = {
      email: emailOrPhone, // Le backend attend 'email'
      password,
      rememberMe
    };
    
    // Essayer d'abord avec axios
    try {
      const response = await api.post('/auth/login', apiData);
      console.log('✅ Connexion réussie (axios):', response.data);
      
      // Si la connexion réussit, stocker le token
      if (response.data.accessToken) {
        localStorage.setItem('nionfarToken', response.data.accessToken);
      }
      
      // Stocker les informations utilisateur
      if (response.data.user) {
        localStorage.setItem('nionfarUser', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (axiosError) {
      console.error('❌ Erreur avec axios:', axiosError);
      
      // Fallback: essayer avec fetch directement
      console.log('⚠️ Tentative avec fetch direct...');
      const directUrl = `${baseURL}/auth/login`;
      
      try {
        const fetchResponse = await fetch(directUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(apiData),
          mode: 'cors',
          credentials: 'omit'
        });
        
        console.log(`📥 Réponse fetch (${fetchResponse.status}):`, fetchResponse);
        
        const responseText = await fetchResponse.text();
        console.log('📄 Réponse texte:', responseText);
        
        const data = responseText ? JSON.parse(responseText) : {};
        console.log('📊 Données parsées:', data);
        
        if (fetchResponse.ok) {
          console.log('✅ Connexion réussie (fetch):', data);
          
          // Si la connexion réussit, stocker le token
          if (data.accessToken) {
            localStorage.setItem('nionfarToken', data.accessToken);
          }
          
          // Stocker les informations utilisateur
          if (data.user) {
            localStorage.setItem('nionfarUser', JSON.stringify(data.user));
          }
          
          return data;
        } else {
          console.error('❌ Erreur HTTP avec fetch:', data);
          throw new Error(data.message || `Erreur ${fetchResponse.status}: Une erreur est survenue lors de la connexion`);
        }
      } catch (fetchError) {
        console.error('❌ Erreur avec fetch:', fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('❌ Erreur de connexion API:', error);
    // Si c'est une erreur avec un message réseau spécifique, le convertir en message plus convivial
    if (error.message && (
      error.message.includes('Network Error') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    )) {
      throw new Error('Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion internet et réessayer.');
    }
    throw error;
  }
};

/**
 * Fonction pour s'inscrire via l'API
 * @param userData - Données d'inscription
 * @returns Réponse de l'API avec statut de succès et données utilisateur
 */
export const register = async (userData: {
  username: string;
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  acceptTerms: boolean;
  role: 'client' | 'freelance';
}) => {
  console.log('📝 Tentative d\'inscription API:', { ...userData, password: '***' });
  console.log('🌐 URL d\'API utilisée:', baseURL);
  
  try {
    // Adapter les données au format attendu par le backend
    const apiData = {
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phone,
      password: userData.password,
      passwordConfirm: userData.password, // Le backend a besoin de la confirmation
      firstName: userData.fullName.split(' ')[0],
      lastName: userData.fullName.split(' ').slice(1).join(' '),
      termsAccepted: userData.acceptTerms,
      role: userData.role === 'freelance' ? 'FREELANCER' : 'CLIENT',
      isFreelancer: userData.role === 'freelance'
    };
    
    console.log('📦 Données formatées pour le backend:', { ...apiData, password: '***', passwordConfirm: '***' });
    
    // Essayer d'abord avec axios
    try {
      const response = await api.post('/auth/register', apiData);
      console.log('✅ Inscription réussie (axios):', response.data);
      
      // Si l'inscription réussit et que l'API renvoie un token, le stocker
      if (response.data.token) {
        localStorage.setItem('nionfarToken', response.data.token);
      }
      
      // Stocker les informations utilisateur
      if (response.data.user) {
        localStorage.setItem('nionfarUser', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (axiosError) {
      console.error('❌ Erreur avec axios:', axiosError);
      
      // Fallback: essayer avec fetch directement
      console.log('⚠️ Tentative avec fetch direct...');
      const directUrl = `${baseURL}/auth/register`;
      
      try {
        const fetchResponse = await fetch(directUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(apiData),
          mode: 'cors', 
          credentials: 'omit'
        });
        
        console.log(`📥 Réponse fetch (${fetchResponse.status}):`, fetchResponse);
        
        const responseText = await fetchResponse.text();
        console.log('📄 Réponse texte:', responseText);
        
        const data = responseText ? JSON.parse(responseText) : {};
        console.log('📊 Données parsées:', data);
        
        if (fetchResponse.ok) {
          console.log('✅ Inscription réussie (fetch):', data);
          
          // Si l'inscription réussit et que l'API renvoie un token, le stocker
          if (data.token) {
            localStorage.setItem('nionfarToken', data.token);
          }
          
          // Stocker les informations utilisateur
          if (data.user) {
            localStorage.setItem('nionfarUser', JSON.stringify(data.user));
          }
          
          return data;
        } else {
          console.error('❌ Erreur HTTP avec fetch:', data);
          throw new Error(data.message || `Erreur ${fetchResponse.status}: Une erreur est survenue lors de l'inscription`);
        }
      } catch (fetchError) {
        console.error('❌ Erreur avec fetch:', fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('❌ Erreur d\'inscription API:', error);
    // Si c'est une erreur avec un message réseau spécifique, le convertir en message plus convivial
    if (error.message && (
      error.message.includes('Network Error') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    )) {
      throw new Error('Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion internet et réessayer.');
    }
    throw error;
  }
};

// Exporter également la fonction de test pour utilisation externe
export { testBackendConnectivity }; 