import axios from 'axios';
import { toast } from 'react-toastify';
import { NextRouter } from 'next/router';

// Déclarer le type global pour la fenêtre
declare global {
  interface Window {
    __CORRECT_API_URL?: string;
    __CORRECT_BACKEND_URL?: string;
    __CORRECT_FRONTEND_URL?: string;
  }
}

// Constantes pour le stockage des données d'authentification
const AUTH_TOKEN_KEY = 'auth_token';
const USER_STORAGE_KEY = 'nionfarUser';

// URLs de base pour l'API - Vercel, Railway ou localhost
const LOCAL_API_URL = 'http://localhost:3001/api';
const LOCAL_BACKEND_URL = 'http://localhost:3001';
const RENDER_BACKEND_URL = 'https://nionfar-backend.onrender.com';
const RENDER_API_URL = 'https://nionfar-backend.onrender.com/api';

// Déterminer quelle URL utiliser
const getBaseApiUrl = () => {
  // Priorité 1: Variable d'environnement
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Priorité 2: URL stockée dans localStorage (paramètre API_URL)
  if (typeof window !== 'undefined' && localStorage.getItem('API_URL')) {
    return localStorage.getItem('API_URL');
  }

  // Priorité 3: URL correcte en fonction de l'environnement
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return LOCAL_API_URL;
  }
  
  // Par défaut: URL de production Render
  return RENDER_API_URL;
};

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface PhoneVerification {
  phone: string;
  otp: string;
}

interface RegisterData {
  username?: string;  // Rendu optionnel
  email: string;
  phone?: string;     // Rendu optionnel
  password: string;
  fullName: string;
  acceptTerms: boolean;
  role: 'client' | 'freelance';
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  requiresOtp?: boolean;
  temporaryToken?: string;
  error?: string;
}

interface User {
  id: string;
  name?: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'freelance' | 'admin';
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  updatedAt?: string;
}

class AuthService {
  private apiUrl: string;
  private token: string | null;
  private user: User | null;
  private localStorageAvailable: boolean;
  private failedAttempts: Record<string, number>;
  private blockedUntil: Record<string, Date>;
  private MAX_FAILED_ATTEMPTS = 5;
  private BLOCK_DURATION_MINUTES = 30;

  constructor() {
    // Forcer l'utilisation des URLs Vercel en production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Valeur correcte pour l'API
    this.apiUrl = getBaseApiUrl();
    
    // Vérifier et corriger l'URL si nécessaire
    if (this.apiUrl.includes('railway') || 
        (this.apiUrl.includes('vercel') && !this.apiUrl.includes('nionfar-backend.onrender.com'))) {
      console.error('❌ URL API incorrecte détectée:', this.apiUrl);
      this.apiUrl = RENDER_API_URL;
      
      // Mettre à jour localStorage si disponible
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('NEXT_PUBLIC_API_URL', RENDER_API_URL);
        localStorage.setItem('backend_fixed', 'true');
      }
    }
    
    const appUrl = RENDER_BACKEND_URL;
    
    console.log("🔧 Configuration AuthService:", { 
      apiUrl: this.apiUrl, 
      environment: isProduction ? 'production' : 'development'
    });
    
    this.token = null;
    this.user = null;
    this.failedAttempts = {};
    this.blockedUntil = {};
    
    // Vérifier si localStorage est disponible
    this.localStorageAvailable = typeof window !== 'undefined' && !!window.localStorage;
    
    // Récupérer les informations d'authentification depuis le localStorage au démarrage
    if (this.localStorageAvailable) {
      this.loadFromStorage();
      
      // Forcer la bonne URL dans localStorage
      localStorage.setItem('NEXT_PUBLIC_API_URL', this.apiUrl);
    }

    // Vérifier la disponibilité du serveur backend si en environnement client
    if (typeof window !== 'undefined') {
      this.checkServerAvailability();
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean, user?: User, error?: string }> {
    console.log("📝 Tentative d'inscription avec:", { ...userData, password: '***' });
    
    // Vérifier que l'email ou le téléphone est fourni
    if (!userData.email && !userData.phone) {
      return { success: false, error: "Email ou numéro de téléphone requis" };
    }
    
    // Tentative de récupération d'un nouveau token CSRF pour s'assurer qu'il est valide
    try {
      await this.fetchCsrfTokensBeforeOperation();
    } catch (csrfError) {
      console.error("Impossible de récupérer le token CSRF:", csrfError);
      // On continue quand même car certains serveurs n'exigent pas le CSRF
    }
    
    // Formatage des données pour le backend - conforme aux attentes du DTO et du schéma Zod
    const formatUserDataForBackend = (data: RegisterData) => {
      // Diviser le nom complet en prénom et nom
      const nameParts = data.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Si pas de nom, utiliser le prénom
      
      return {
        email: data.email,
        firstName: firstName,
        lastName: lastName,
        password: data.password,
        passwordConfirm: data.password, // Ajouter confirmation de mot de passe
        termsAccepted: data.acceptTerms, // Ajouter acceptation des termes
        role: data.role.toUpperCase()
      };
    };
    
    // Données formatées selon la structure attendue par le backend
    const formattedData = formatUserDataForBackend(userData);
    console.log("📦 Données formatées pour le backend:", { ...formattedData, password: '***' });

    try {
      // Vérification de l'URL du backend
      if (!this.apiUrl || this.apiUrl === '/api') {
        console.error("❌ URL de l'API non configurée correctement:", this.apiUrl);
        return { 
          success: false,
          error: "Configuration du serveur incorrecte. L'URL de l'API n'est pas définie."
        };
      }

      // Récupérer le token CSRF
      const csrfToken = localStorage.getItem('csrf_token') || '';
      console.log("🔐 Token CSRF utilisé pour l'inscription:", csrfToken ? "Présent" : "Absent");

      // Essayons d'abord de faire l'inscription via notre proxy local
      try {
        console.log("🔍 Tentative d'inscription via proxy local...");
        // Utiliser explicitement notre route API personnalisée au lieu du proxy Next.js générique
        const proxyUrl = '/api/auth/register';
        
        console.log("🌐 URL de proxy local (route API personnalisée):", proxyUrl);
        
        const proxyResponse = await fetch(proxyUrl, {
          method: 'POST', // Forcer la méthode POST
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken,
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'X-HTTP-Method': 'POST', // Ajouter un en-tête explicite pour la méthode HTTP
            'X-HTTP-Method-Override': 'POST' // Alternative utilisée par certains serveurs
          },
          body: JSON.stringify(formattedData), // ⚠️ Utiliser les données formatées pour le backend
          credentials: 'include',
          // S'assurer que cette requête n'est pas mise en cache
          cache: 'no-store'
        });
        
        // Logger plus d'informations sur la requête pour le débogage
        console.log(`📊 Proxy local - Status: ${proxyResponse.status} ${proxyResponse.statusText}`);
        console.log(`📊 Proxy local - URL: ${proxyResponse.url}`);
        console.log(`📊 Proxy local - Type: ${proxyResponse.type}`);
        
        const proxyTextResponse = await proxyResponse.text();
        console.log(`📥 Réponse proxy (${proxyResponse.status}):`, proxyTextResponse.substring(0, 150));
        
        let proxyData;
        try {
          proxyData = proxyTextResponse ? JSON.parse(proxyTextResponse) : {};
        } catch (e) {
          console.error("❌ Erreur parsing JSON de la réponse proxy:", e);
          proxyData = { message: proxyTextResponse || "Réponse non-JSON du proxy" };
        }
        
        if (proxyResponse.ok) {
          console.log("✅ Inscription réussie via proxy:", proxyData);
          
          // Stocker le token et les données utilisateur
          if (proxyData.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, proxyData.token);
          }
          
          if (proxyData.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(proxyData.user));
            
            // Redirection automatique
            const redirectUrl = proxyData.user.isFreelancer ? '/dashboard' : '/';
            
            console.log("✅ Redirection vers:", redirectUrl);
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1500);
          }
          
          return { success: true, user: proxyData.user };
        } else {
          // Si le proxy a échoué, essayer directement le backend
          console.log("⚠️ Échec via proxy, tentative directe au backend");
        }
      } catch (proxyError) {
        console.error("❌ Erreur lors de l'inscription via proxy:", proxyError);
        // Continuer avec la méthode directe
      }

      // Tentative directe avec le backend si le proxy a échoué
      console.log("🔄 Tentative d'inscription directe avec le backend...");
      
      // Utiliser fetch avec option credentials include pour permettre l'envoi des cookies
      try {
        // Déterminer l'URL complète du backend
        const backendUrl = this.apiUrl.startsWith('http')
          ? this.apiUrl
          : RENDER_API_URL;
        
        const registerUrl = `${backendUrl}/auth/register`;
        console.log("🌐 URL d'inscription backend:", registerUrl);
        
        const response = await fetch(registerUrl, {
          method: 'POST', // Forcer explicitement la méthode POST
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken,
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'X-HTTP-Method': 'POST', // Ajouter un en-tête explicite pour la méthode HTTP
            'X-HTTP-Method-Override': 'POST' // Alternative utilisée par certains serveurs
          },
          body: JSON.stringify(formattedData),
          mode: 'cors',
          credentials: 'include' // Inclure les cookies pour le CSRF
        });
        
        // Obtenir la réponse complète du serveur
        const responseText = await response.text();
        console.log(`📥 Réponse serveur (${response.status}):`, responseText.substring(0, 150));
        
        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error("❌ Erreur parsing JSON:", e);
          responseData = { message: responseText || "Réponse non-JSON du serveur" };
        }
        
        if (response.ok) {
          console.log("✅ Inscription réussie avec fetch:", responseData);
          
          // Stocker le token si présent
          if (responseData.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, responseData.token);
          }
          
          // Stocker les données utilisateur si présentes
          if (responseData.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(responseData.user));
            
            // Redirection automatique vers la page appropriée selon le rôle
            const redirectUrl = responseData.user.isFreelancer ? '/dashboard' : '/';
            
            console.log("✅ Inscription réussie! Redirection vers:", redirectUrl);
            
            // Forcer la redirection avec un léger délai pour permettre l'affichage du message de succès
            setTimeout(() => {
              console.log("🔄 Exécution de la redirection...");
              window.location.href = redirectUrl;
            }, 1500);
          }
          
          return { success: true, user: responseData.user };
        } else {
          // Gestion des erreurs spécifiques
          let errorMessage;
          
          if (response.status === 409) {
            errorMessage = "Cet email est déjà utilisé";
          } else if (responseData.message && responseData.message.includes("mot de passe")) {
            errorMessage = responseData.message;
          } else if (responseData.message && responseData.message.includes("Cannot")) {
            errorMessage = "Erreur serveur: Méthode HTTP incorrecte. Réessayez plus tard.";
          } else {
            errorMessage = responseData.message || `Erreur ${response.status}: Une erreur est survenue lors de l'inscription`;
          }
          
          console.error("❌ Échec de l'inscription avec fetch:", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        // Si fetch échoue, utiliser XMLHttpRequest comme fallback
        console.error("❌ Erreur fetch:", error);
        console.log("⚠️ Retour au fallback XMLHttpRequest...");
        
        // Déterminer l'URL complète du backend pour XMLHttpRequest
        const backendUrl = this.apiUrl.startsWith('http')
          ? this.apiUrl
          : RENDER_API_URL;
        const registerUrl = `${backendUrl}/auth/register`;
        console.log("🌐 URL d'inscription XHR:", registerUrl);
        
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', registerUrl, true); // Forcer explicitement la méthode POST
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader('X-CSRF-Token', csrfToken || '');
          xhr.withCredentials = true; // Activer l'envoi des cookies pour le CSRF
          xhr.timeout = 15000;
          
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
              console.log("📋 Headers XHR reçus:", xhr.getAllResponseHeaders());
            }
          };
          
          xhr.onload = function() {
            console.log(`📥 Réponse XHR reçue (${xhr.status}):`, xhr.responseText.substring(0, 150));
            
            try {
              const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              
              if (xhr.status >= 200 && xhr.status < 300) {
                console.log("✅ Inscription réussie avec XHR:", response);
                
                // Stocker le token si présent
                if (response.token) {
                  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
                }
                
                // Stocker les données utilisateur
                if (response.user) {
                  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
                  
                  const redirectUrl = response.user.isFreelancer ? '/dashboard' : '/';
                  setTimeout(() => {
                    window.location.href = redirectUrl;
                  }, 1500);
                }
                
                resolve({ success: true, user: response.user });
              } else {
                // Gestion erreurs
                console.error("❌ Erreur serveur XHR:", response);
                let errorMessage;
                
                if (xhr.status === 409) {
                  errorMessage = "Cet email est déjà utilisé";
                } else if (response.message && response.message.includes("mot de passe")) {
                  errorMessage = response.message;
                } else if (response.message && response.message.includes("Cannot")) {
                  errorMessage = "Erreur serveur: Méthode HTTP incorrecte. Réessayez plus tard.";
                } else {
                  errorMessage = response.message || `Erreur ${xhr.status}: Une erreur est survenue lors de l'inscription`;
                }
                
                resolve({ success: false, error: errorMessage });
              }
            } catch (parseError) {
              console.error("❌ Erreur parsing XHR:", parseError);
              resolve({ success: false, error: "Réponse invalide du serveur" });
            }
          };
          
          xhr.onerror = function() {
            console.error("❌ Erreur réseau XHR");
            resolve({ 
              success: false, 
              error: "Impossible de communiquer avec le serveur. Vérifiez votre connexion internet ou le serveur peut être temporairement indisponible. Veuillez réessayer plus tard."
            });
          };
          
          xhr.ontimeout = function() {
            console.error("❌ Timeout XHR");
            resolve({ 
              success: false, 
              error: "Le serveur met trop de temps à répondre. Veuillez réessayer plus tard."
            });
          };
          
          xhr.send(JSON.stringify(formattedData));
        });
      }
    } catch (error) {
      console.error("🔥 Erreur lors de l'inscription:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Une erreur inattendue est survenue" 
      };
    }
  }

  async login(credentials: LoginCredentials, autoRedirect = true, redirectUrl?: string): Promise<LoginResponse> {
    console.log("🔐 Tentative de connexion avec:", {
      email: credentials.email,
      password: "********",
      rememberMe: credentials.rememberMe
    });

    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: "Veuillez fournir un email et un mot de passe"
      };
    }

    // Vérifier si l'utilisateur est bloqué
    if (this.isBlocked(credentials.email)) {
      const remainingBlockTime = this.getRemainingBlockTime(credentials.email);
      const minutesRemaining = Math.ceil(remainingBlockTime / 60000);
      
      return {
        success: false,
        error: `Trop de tentatives échouées. Compte temporairement bloqué. Réessayez dans ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`
      };
    }

    try {
      // Récupérer les tokens CSRF avant la connexion
      const csrfTokensRetrieved = await this.fetchCsrfTokens();
      if (!csrfTokensRetrieved) {
        console.warn("⚠️ Impossible de récupérer les tokens CSRF, tentative de connexion sans tokens");
      }
      
      // Vérifier la disponibilité du serveur avant de tenter la connexion
      const isServerAvailable = await this.checkServerAvailability();
      if (!isServerAvailable) {
        const serverUrl = this.apiUrl || 'le serveur';
        return { 
          success: false, 
          error: `Serveur indisponible (${serverUrl}). Veuillez réessayer plus tard.`
        };
      }

      // Préparer les données pour l'API
      const requestBody = {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      };

      // Utilisez un timeout pour éviter les attentes trop longues
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<LoginResponse>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("La requête a pris trop de temps"));
        }, 15000); // 15 secondes de timeout
      });

      try {
        // Tenter d'abord via notre API proxy locale pour éviter les problèmes CORS
        console.log("🔄 Tentative via proxy API local");
        const proxyUrl = '/api/auth/login';
        
        console.log("🔗 URL de proxy local:", proxyUrl);
        
        // Récupérer le token CSRF pour la requête proxy
        const csrfToken = localStorage.getItem('csrf_token');
        console.log("🔐 Token CSRF utilisé pour proxy:", csrfToken ? "Présent" : "Absent");
        
        const proxyResponse = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken || ''
          },
          body: JSON.stringify(requestBody),
          credentials: 'same-origin'
        });
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (proxyResponse.ok) {
          try {
            const data = await proxyResponse.json();
            console.log("✅ Connexion via proxy réussie");
            
            // Stocker le token
            const token = data.accessToken || data.token;
            if (token) {
              if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
              }
              this.token = token;
            }
            
            // Stocker les données utilisateur
            if (data.user) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
              this.user = data.user;
              
              // Redirection si nécessaire
              if (autoRedirect) {
                const targetUrl = data.user.isFreelancer ? '/dashboard' : (redirectUrl || '/');
                this.forceRedirectAfterLogin(targetUrl);
              }
            }
            
            // Réinitialiser les tentatives échouées
            this.resetFailedAttempts(credentials.email);
            
            return {
              success: true,
              user: data.user,
              token: token
            };
          } catch (jsonError) {
            console.error("❌ Erreur lors du parsing de la réponse JSON:", jsonError);
            return {
              success: false,
              error: "Erreur lors du traitement de la réponse du serveur"
            };
          }
        } else {
          // Si le proxy local a échoué, essayer directement avec l'API backend
          console.warn(`❌ Échec de la connexion via proxy (${proxyResponse.status}), tentative directe`);
          return this.tryDirectBackendLogin(requestBody, autoRedirect, redirectUrl);
        }
      } catch (proxyError) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("❌ Erreur lors de la connexion via proxy:", proxyError);
        
        // Si le proxy a échoué, essayer directement avec l'API backend
        return this.tryDirectBackendLogin(requestBody, autoRedirect, redirectUrl);
      }
    } catch (error) {
      console.error("🔥 Erreur générale lors de la connexion:", error);
      this.incrementFailedAttempts(credentials.email);
      
      // Si trop de tentatives échouées, bloquer temporairement
      if (this.getFailedAttempts(credentials.email) >= this.MAX_FAILED_ATTEMPTS) {
        this.blockUser(credentials.email);
        
        return {
          success: false,
          error: `Trop de tentatives échouées. Compte temporairement bloqué pour ${this.BLOCK_DURATION_MINUTES} minutes.`
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Une erreur inattendue est survenue" 
      };
    }
  }

  async verifyOtp(data: PhoneVerification, temporaryToken?: string): Promise<LoginResponse> {
    try {
      const headers: any = {};
      if (temporaryToken) {
        headers.Authorization = `Bearer ${temporaryToken}`;
      } else if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await axios.post(`${this.apiUrl}/auth/verify-otp`, data, { headers });
      const responseData = response.data;

      if (responseData.success && responseData.token) {
        this.setToken(responseData.token);
        this.setAuthData(responseData);
        this.updateLastLogin();
        
        // Pas de redirection automatique - la redirection sera gérée par le composant appelant
        
        return {
          success: true,
          token: responseData.token,
          user: responseData.user
        };
      }

      if (responseData.success) {
        if (this.user) {
          this.user.phoneVerified = true;
          this.saveToStorage();
        }
        
        // Pas de redirection automatique
        
        return {
          success: true,
          message: 'Numéro de téléphone vérifié avec succès'
        };
      }

      return {
        success: false,
        message: responseData.message || 'Code OTP invalide'
      };
    } catch (error: any) {
      console.error('Erreur de vérification OTP:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de la vérification du code OTP'
      };
    }
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/send-otp`, { phone });
      return { 
        success: true, 
        message: 'Code OTP envoyé avec succès' 
      };
    } catch (error: any) {
      console.error('Erreur d\'envoi OTP:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du code OTP' 
      };
    }
  }

  async logout(router?: NextRouter): Promise<void> {
    try {
      // Appel API pour invalider le token côté serveur
      if (this.token) {
        await axios.post(`${this.apiUrl}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token côté client dans tous les cas
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    this.user = null;
    this.token = null;
    this.failedAttempts = {};
    this.blockedUntil = {};
    
    // Supprimer les informations d'authentification du localStorage
    if (this.localStorageAvailable) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('failed_attempts');
      localStorage.removeItem('blocked_until');
    }
    
    // Ne pas rediriger ici - laisser le composant appelant gérer la redirection
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await axios.get(`${this.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  async checkInactiveAccounts(): Promise<void> {
    if (!this.token) return;

    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return;

      const lastActivity = new Date(currentUser.lastActivityAt || currentUser.updatedAt || currentUser.createdAt);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Si dernière activité > 5 mois (avertissement avant désactivation)
      if (lastActivity < sixMonthsAgo) {
        const warningDate = new Date();
        warningDate.setMonth(warningDate.getMonth() - 5);
        
        if (lastActivity < warningDate) {
          // Envoyer notification d'avertissement pour compte bientôt désactivé
          toast.warning('Votre compte sera désactivé pour inactivité dans 1 mois. Connectez-vous régulièrement pour éviter la désactivation.');
          
          // Appel API pour enregistrer l'avertissement
          await axios.post(`${this.apiUrl}/auth/inactivity-warning`, {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
        }
      }
      
      // Désactivation après 6 mois d'inactivité gérée côté serveur lors de la connexion
    } catch (error) {
      console.error('Erreur lors de la vérification d\'inactivité:', error);
    }
  }

  async requestDoubleVerification(withdrawalAmount: number, userId: string): Promise<boolean> {
    if (withdrawalAmount <= 100000) return true; // Pas besoin de double vérification

    try {
      // Envoyer une demande de vérification supplémentaire
      const response = await axios.post(
        `${this.apiUrl}/auth/double-verification`,
        { userId, amount: withdrawalAmount },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
      
      // Afficher une notification à l'utilisateur
      toast.info('Une vérification supplémentaire est requise pour ce retrait. Veuillez vérifier votre email ou téléphone.');
      
      return response.data.success;
    } catch (error) {
      toast.error('Impossible de demander une vérification supplémentaire');
      return false;
    }
  }

  // Méthodes auxiliaires pour la gestion des tentatives de connexion
  private isBlocked(identifier: string): boolean {
    const blockedUntil = this.blockedUntil[identifier];
    return blockedUntil !== undefined && blockedUntil > new Date();
  }

  private getRemainingBlockTime(identifier: string): number {
    const blockedUntil = this.blockedUntil[identifier];
    if (!blockedUntil) return 0;
    
    const diffMs = blockedUntil.getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60)); // Convertir en minutes
  }

  private getFailedAttempts(identifier: string): number {
    return this.failedAttempts[identifier] || 0;
  }

  private incrementFailedAttempts(identifier: string): void {
    const current = this.getFailedAttempts(identifier);
    this.failedAttempts[identifier] = current + 1;
    
    if (this.localStorageAvailable) {
      localStorage.setItem('failed_attempts', JSON.stringify(this.failedAttempts));
    }
  }

  private resetFailedAttempts(identifier: string): void {
    delete this.failedAttempts[identifier];
    delete this.blockedUntil[identifier];
    
    if (this.localStorageAvailable) {
      localStorage.setItem('failed_attempts', JSON.stringify(this.failedAttempts));
      localStorage.setItem('blocked_until', JSON.stringify(this.blockedUntil));
    }
  }

  private blockUser(identifier: string): void {
    const blockUntil = new Date();
    blockUntil.setMinutes(blockUntil.getMinutes() + this.BLOCK_DURATION_MINUTES);
    this.blockedUntil[identifier] = blockUntil;
    
    if (this.localStorageAvailable) {
      localStorage.setItem('blocked_until', JSON.stringify(this.blockedUntil));
    }
  }

  // Méthodes utilitaires
  private async getCurrentIp(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'IP:', error);
      return '';
    }
  }

  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return '';
    
    return JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`
    });
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  }

  private removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  private setAuthData(data: any): void {
    if (data.token) {
      this.token = data.token;
    }
    
    if (data.user) {
      this.user = data.user;
      
      // Synchronisation immédiate et forcée avec localStorage
      if (this.localStorageAvailable) {
        try {
          // Stocker directement dans localStorage pour garantir la cohérence immédiate
          localStorage.setItem('nionfarUser', JSON.stringify(data.user));
          console.log('✅ IMPORTANT: Utilisateur sauvegardé directement dans localStorage');
          console.log('Données utilisateur:', JSON.stringify(data.user, null, 2));
          
          // Déclencher un événement de stockage pour informer les autres onglets/composants
          window.dispatchEvent(new Event('storage'));
          
          // Force le rechargement de la page pour être certain de la mise à jour de l'interface
          setTimeout(() => {
            console.log('🔄 Forçage du rafraîchissement pour mise à jour de l\'interface');
            window.location.reload();
          }, 500); // Délai court pour permettre la sauvegarde des données
        } catch (error) {
          console.error('❌ Erreur critique lors de la sauvegarde directe:', error);
        }
      }
    }
    
    // Enregistrer dans le localStorage (méthode complète)
    this.saveToStorage();
    
    console.log('Authentification réussie - Données d\'utilisateur enregistrées sans redirection automatique');
    // Aucune redirection automatique ici
  }

  private saveToStorage(): void {
    if (!this.localStorageAvailable) return;
    
    try {
      console.log('Sauvegarde des données d\'authentification dans le localStorage');
      
      if (this.token) {
        localStorage.setItem('nionfarToken', this.token);
      } else {
        localStorage.removeItem('nionfarToken');
      }
      
      if (this.user) {
        localStorage.setItem('nionfarUser', JSON.stringify(this.user));
      } else {
        localStorage.removeItem('nionfarUser');
      }
      
      localStorage.setItem('nionfarFailedAttempts', JSON.stringify(this.failedAttempts));
      
      // Convertir les objets Date en chaînes ISO pour le stockage
      const serializedBlockedUntil: Record<string, string> = {};
      for (const key in this.blockedUntil) {
        serializedBlockedUntil[key] = this.blockedUntil[key].toISOString();
      }
      localStorage.setItem('nionfarBlockedUntil', JSON.stringify(serializedBlockedUntil));
      
      console.log('Données d\'authentification sauvegardées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
    }
  }

  private loadFromStorage(): void {
    if (!this.localStorageAvailable) return;
    
    try {
      console.log('🔄 DÉBUT Chargement des données d\'authentification depuis le localStorage');
      
      // DEBUG: Lister toutes les clés de localStorage pour trouver le problème
      console.log('📦 Clés disponibles dans localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(` - ${key}`);
      }
      
      // Récupérer et vérifier le token
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (storedToken) {
        this.token = storedToken;
        console.log('✅ Token trouvé dans le localStorage:', storedToken.substring(0, 10) + '...');
      } else {
        console.log('❌ Aucun token trouvé dans le localStorage');
      }
      
      // Récupérer et vérifier l'utilisateur
      const storedUser = localStorage.getItem('nionfarUser');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
          console.log('✅ Utilisateur trouvé dans le localStorage:', this.user?.username || this.user?.email);
          console.log('Détails utilisateur:', JSON.stringify(this.user, null, 2));
        } catch (e) {
          console.error('❌ Erreur lors du parsing des données utilisateur:', e);
          console.error('Données brutes reçues:', storedUser);
          this.user = null;
          // Nettoyer les données invalides
          localStorage.removeItem('nionfarUser');
        }
      } else {
        console.log('❌ Aucun utilisateur trouvé dans le localStorage');
      }
      
      // Charger les tentatives échouées et le blocage
      const storedAttempts = localStorage.getItem('nionfarFailedAttempts');
      if (storedAttempts) {
        try {
          this.failedAttempts = JSON.parse(storedAttempts);
        } catch (e) {
          console.error('❌ Erreur lors du parsing des tentatives échouées:', e);
          this.failedAttempts = {};
          // Nettoyer les données invalides
          localStorage.removeItem('nionfarFailedAttempts');
        }
      }
      
      const storedBlockedUntil = localStorage.getItem('nionfarBlockedUntil');
      if (storedBlockedUntil) {
        try {
          // Convertir les chaînes ISO en objets Date
          const parsed = JSON.parse(storedBlockedUntil);
          this.blockedUntil = {};
          
          // Convertir les dates ISO en objets Date
          for (const key in parsed) {
            this.blockedUntil[key] = new Date(parsed[key]);
          }
        } catch (e) {
          console.error('❌ Erreur lors du parsing des données de blocage:', e);
          this.blockedUntil = {};
          // Nettoyer les données invalides
          localStorage.removeItem('nionfarBlockedUntil');
        }
      }
      
      // Si un token existe mais pas d'utilisateur, effacer le token car il est probablement invalide
      if (this.token && !this.user) {
        console.warn('⚠️ Token trouvé sans utilisateur associé, suppression du token');
        this.token = null;
        localStorage.removeItem('nionfarToken');
      }
      
      console.log('🔄 FIN État d\'authentification après chargement:', this.isAuthenticated());
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE lors du chargement des données d\'authentification:', error);
      // En cas d'erreur, réinitialiser l'état d'authentification
      this.token = null;
      this.user = null;
    }
  }

  private async updateLastLogin(): Promise<void> {
    if (!this.token) return;
    
    try {
      await axios.post(`${this.apiUrl}/users/last-login`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      // Mettre à jour l'utilisateur local
      if (this.user) {
        this.user.lastLoginAt = new Date().toISOString();
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Erreur de mise à jour de dernière connexion:', error);
    }
  }

  private isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  private redirectToDashboard(router?: NextRouter, customUrl?: string): void {
    if (!this.user) return;
    
    // Si une redirection personnalisée est fournie, l'utiliser
    if (customUrl) {
      console.log("Redirection vers l'URL personnalisée:", customUrl);
      if (router) {
        router.push(customUrl);
      } else if (typeof window !== 'undefined') {
        window.location.href = customUrl;
      }
      return;
    }
    
    // Si aucune redirection n'est spécifiée, ne rien faire - rester sur la page actuelle
    console.log("Aucune redirection - l'utilisateur reste sur la page actuelle");
    // Ne pas rediriger vers /dashboard/client ou /dashboard automatiquement
  }

  // Nouvelle méthode pour vérifier la disponibilité du serveur backend
  private async checkServerAvailability(): Promise<boolean> {
    console.log('🔍 Vérification temporairement désactivée - on considère le serveur comme disponible');
    
    // Solution temporaire: considérer le serveur comme toujours disponible
    // pour permettre aux utilisateurs de se connecter
    return true;
  }

  forceRedirectAfterLogin(redirectUrl: string): void {
    console.log("🔄 Redirection après connexion vers:", redirectUrl);
    
    if (typeof window !== 'undefined') {
      // Valeur par défaut si l'URL est invalide
      let finalUrl = redirectUrl || '/';
      
      // Sécurité anti-redirection vers des domaines externes
      if (!finalUrl.startsWith('/') || finalUrl.startsWith('//') || finalUrl.includes('://')) {
        console.log("⚠️ Tentative de redirection externe bloquée:", finalUrl);
        finalUrl = '/'; // Redirection vers l'accueil par sécurité
      }
      
      // S'assurer que l'URL commence par un slash
      if (!finalUrl.startsWith('/')) {
        finalUrl = '/' + finalUrl;
      }
      
      // Ajouter des paramètres spéciaux pour indiquer une connexion réussie
      // et forcer le rafraîchissement des composants
      const separator = finalUrl.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      const finalUrlWithParams = `${finalUrl}${separator}_t=${timestamp}&_auth=1`;
      
      console.log("🔄 URL finale avec paramètres de connexion:", finalUrlWithParams);
      
      // Signal fort pour indiquer une connexion réussie (pour les autres onglets/fenêtres)
      localStorage.setItem('lastAuthSuccess', timestamp.toString());
      // Signal pour les composants de cette page
      localStorage.setItem('auth_updated', timestamp.toString());
      // Déclencher un événement pour informer les autres composants
      window.dispatchEvent(new Event('storage'));
      
      // Forcer une redirection complète avec replace (plus fiable que href)
      console.log("🚀 Exécution de la redirection forcée (replace)");
      window.location.replace(finalUrlWithParams);
    }
  }

  // Méthode pour tenter une connexion directe avec le backend
  private async tryDirectBackendLogin(requestBody: any, autoRedirect = true, redirectUrl?: string): Promise<LoginResponse> {
    try {
      console.log("🔄 Tentative de connexion directe avec le backend...");
      
      // Déterminer l'URL du backend
      const apiBaseUrl = this.apiUrl.startsWith('http') 
        ? this.apiUrl 
        : RENDER_API_URL;
      
      const loginUrl = `${apiBaseUrl}/auth/login`;
      console.log("🔗 URL de connexion au backend:", loginUrl);
      
      // Récupérer le token CSRF
      const csrfToken = localStorage.getItem('csrf_token');
      console.log("🔐 Token CSRF utilisé pour backend:", csrfToken ? "Présent" : "Absent");
      
      // Premier essai avec fetch
      try {
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken || '',
            'Origin': typeof window !== 'undefined' ? window.location.origin : ''
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
          mode: 'cors'
        });
        
        // Afficher les en-têtes de réponse pour le débogage
        console.log("📋 En-têtes de réponse:", response.headers);
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log("✅ Connexion directe réussie:", data);
            
            // Stocker le token
            const token = data.accessToken || data.token;
            if (token) {
              localStorage.setItem(AUTH_TOKEN_KEY, token);
              this.token = token;
            }
            
            // Stocker les données utilisateur
            if (data.user) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
              this.user = data.user;
              
              // Redirection si nécessaire
              if (autoRedirect) {
                const targetUrl = data.user.isFreelancer ? '/dashboard' : (redirectUrl || '/');
                this.forceRedirectAfterLogin(targetUrl);
              }
            }
            
            return {
              success: true,
              user: data.user,
              token: token
            };
          } catch (jsonError) {
            console.error("❌ Erreur lors du parsing de la réponse JSON:", jsonError);
            return {
              success: false,
              error: "Erreur lors du traitement de la réponse du serveur"
            };
          }
        } else {
          console.warn(`❌ Connexion directe échouée (${response.status})`);
          
          try {
            const errorText = await response.text();
            console.error("📄 Contenu de l'erreur:", errorText);
            
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }
            
            if (response.status === 401) {
              this.incrementFailedAttempts(requestBody.email || requestBody.phoneNumber);
              return {
                success: false,
                error: "Email ou mot de passe incorrect"
              };
            } else if (response.status === 403) {
              return {
                success: false,
                error: "Votre compte est bloqué. Veuillez contacter l'administrateur."
              };
            } else {
              return {
                success: false,
                error: errorData.message || `Erreur ${response.status}: Une erreur est survenue lors de la connexion`
              };
            }
          } catch (textError) {
            console.error("❌ Erreur lors de la récupération du texte d'erreur:", textError);
            return {
              success: false,
              error: "Impossible de se connecter au serveur"
            };
          }
        }
      } catch (fetchError) {
        console.error("❌ Erreur fetch:", fetchError);
        
        // Fallback avec XMLHttpRequest
        console.log("⚠️ Tentative avec XMLHttpRequest comme fallback");
        
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', loginUrl, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          if (csrfToken) {
            xhr.setRequestHeader('X-CSRF-Token', csrfToken);
          }
          xhr.withCredentials = true;
          xhr.timeout = 15000;
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                console.log("✅ Connexion XHR réussie:", response);
                
                // Stocker le token
                const token = response.accessToken || response.token;
                if (token) {
                  localStorage.setItem(AUTH_TOKEN_KEY, token);
                }
                
                // Stocker les données utilisateur
                if (response.user) {
                  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
                  
                  // Redirection si nécessaire
                  if (autoRedirect) {
                    const targetUrl = response.user.isFreelancer ? '/dashboard' : (redirectUrl || '/');
                    setTimeout(() => {
                      window.location.href = targetUrl;
                    }, 500);
                  }
                }
                
                resolve({
                  success: true,
                  user: response.user,
                  token: token
                });
              } catch (parseError) {
                console.error("❌ Erreur parsing XHR:", parseError);
                resolve({
                  success: false,
                  error: "Erreur lors du traitement de la réponse du serveur"
                });
              }
            } else {
              let errorMsg;
              try {
                const response = JSON.parse(xhr.responseText);
                errorMsg = response.message;
              } catch {
                errorMsg = xhr.responseText;
              }
              
              if (xhr.status === 401) {
                resolve({
                  success: false,
                  error: "Email ou mot de passe incorrect"
                });
              } else {
                resolve({
                  success: false,
                  error: errorMsg || `Erreur ${xhr.status}: Une erreur est survenue lors de la connexion`
                });
              }
            }
          };
          
          xhr.onerror = function() {
            console.error("❌ Erreur réseau XHR");
            resolve({
              success: false,
              error: "Impossible de communiquer avec le serveur. Vérifiez votre connexion internet."
            });
          };
          
          xhr.ontimeout = function() {
            console.error("❌ Timeout XHR");
            resolve({
              success: false,
              error: "Le serveur met trop de temps à répondre. Veuillez réessayer plus tard."
            });
          };
          
          xhr.send(JSON.stringify(requestBody));
        });
      }
    } catch (error) {
      console.error("❌ Erreur générale lors de la connexion directe:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inattendue est survenue"
      };
    }
  }

  private async fetchCsrfTokensBeforeOperation(): Promise<void> {
    console.log("🔒 Récupération d'un nouveau token CSRF avant opération sensible");
    try {
      // Utiliser directement l'URL du backend Render pour la production
      const apiBaseUrl = RENDER_API_URL;
      const backendUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.substring(0, apiBaseUrl.length - 4) : apiBaseUrl;
      
      // Ajouter des logs pour le débogage
      console.log("🌐 URL utilisée pour récupérer le CSRF:", backendUrl);
      
      // Essayer avec le endpoint standard pour la sécurité
      try {
        console.log("🔄 Tentative via endpoint de sécurité...");
        const csrfResponse = await fetch(`${backendUrl}/api/security/csrf-tokens`, {
          method: 'GET',
          credentials: 'include',
          headers: { 
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Origin': typeof window !== 'undefined' ? window.location.origin : ''
          }
        });
        
        if (csrfResponse.ok) {
          const data = await csrfResponse.json();
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès');
            return;
          } else {
            console.warn("⚠️ Réponse reçue sans token CSRF du endpoint sécurité");
          }
        } else {
          console.warn(`⚠️ Échec de récupération du token CSRF via endpoint sécurité (${csrfResponse.status})`);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du token CSRF via endpoint sécurité:", error);
      }
      
      // Fallback sur le endpoint auth
      try {
        console.log("🔄 Tentative fallback via endpoint auth...");
        const authResponse = await fetch(`${backendUrl}/api/auth/csrf-tokens`, {
          method: 'GET',
          credentials: 'include',
          headers: { 
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Origin': typeof window !== 'undefined' ? window.location.origin : ''
          }
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.token) {
            localStorage.setItem('csrf_token', authData.token);
            console.log('✅ Token CSRF récupéré avec succès via le endpoint auth');
            return;
          } else {
            console.warn("⚠️ Réponse reçue sans token CSRF du endpoint auth");
          }
        } else {
          console.warn(`⚠️ Échec de récupération du token CSRF via endpoint auth (${authResponse.status})`);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du token CSRF via endpoint auth:", error);
      }
      
      console.warn("⚠️ Aucun endpoint n'a pu fournir un token CSRF valide");
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token CSRF:', error);
      throw error;
    }
  }

  private async fetchCsrfTokens(): Promise<boolean> {
    console.log("🔄 Récupération des tokens CSRF...");
    try {
      // Utiliser l'URL de base du backend
      const apiBaseUrl = this.apiUrl.startsWith('http')
        ? this.apiUrl.replace(/\/api$/, '')
        : RENDER_BACKEND_URL;
      
      // Utiliser les bonnes URLs pour récupérer le jeton CSRF
      const csrfProxyUrl = '/api/security/csrf-tokens';
      const csrfDirectUrl = `${apiBaseUrl}/api/security/csrf-tokens`;
      
      console.log("🔄 URL CSRF Proxy:", csrfProxyUrl);
      console.log("🔄 URL CSRF Direct:", csrfDirectUrl);
      
      try {
        // Essayer d'abord via le proxy local
        const proxyResponse = await fetch(csrfProxyUrl, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (proxyResponse.ok) {
          const data = await proxyResponse.json();
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès via proxy');
            return true;
          }
        }
        
        // Si le proxy échoue, essayer directement
        console.log("⚠️ Échec via proxy, tentative directe");
      } catch (proxyError) {
        console.error("❌ Erreur lors de la récupération via proxy:", proxyError);
        // Continuer avec la méthode directe
      }
      
      // Méthode directe - essayer d'abord avec /security/csrf-tokens
      try {
        const response = await fetch(`${apiBaseUrl}/api/security/csrf-tokens`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès via /api/security/csrf-tokens');
            return true;
          }
        }
      } catch (error) {
        console.error('❌ Erreur avec /api/security/csrf-tokens:', error);
      }
      
      // Essayer avec /auth/csrf-tokens comme alternative
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/csrf-tokens`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès via /api/auth/csrf-tokens');
            return true;
          } else {
            console.warn('⚠️ Token CSRF manquant dans la réponse');
          }
        }
      } catch (error) {
        console.error('❌ Erreur avec /api/auth/csrf-tokens:', error);
      }
      
      // Si tout échoue, créer un token temporaire côté client (pour le développement uniquement)
      if (process.env.NODE_ENV !== 'production') {
        const tempToken = 'temp-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('csrf_token', tempToken);
        console.warn('⚠️ Utilisation d\'un token temporaire généré côté client:', tempToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tokens CSRF:', error);
      return false;
    }
  }
}

// Créer et exporter une instance unique du service
const authService = new AuthService();
export { authService };

// Exporter aussi la classe pour les tests et autres cas d'utilisation
export type { User, LoginResponse, LoginCredentials, RegisterData, PhoneVerification };
export { AuthService }; 