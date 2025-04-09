import axios from 'axios';
import { toast } from 'react-toastify';
import { NextRouter } from 'next/router';

// Constantes pour le stockage des données d'authentification
const AUTH_TOKEN_KEY = 'auth_token';
const USER_STORAGE_KEY = 'nionfarUser';

interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

interface PhoneVerification {
  phone: string;
  otp: string;
}

interface RegisterData {
  username: string;
  email?: string;
  phone?: string;
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
    // Initialiser l'URL de l'API en fonction de l'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app';
    
    console.log("🔧 Configuration AuthService:", { 
      apiUrl, 
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production' 
    });
    
    this.apiUrl = apiUrl;
    this.token = null;
    this.user = null;
    this.failedAttempts = {};
    this.blockedUntil = {};
    
    // Vérifier si localStorage est disponible
    this.localStorageAvailable = typeof window !== 'undefined' && !!window.localStorage;
    
    // Récupérer les informations d'authentification depuis le localStorage au démarrage
    if (this.localStorageAvailable) {
      this.loadFromStorage();
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

    try {
      // Récupérer les tokens CSRF avant l'inscription
      const csrfTokensRetrieved = await this.fetchCsrfTokens();
      if (!csrfTokensRetrieved) {
        console.warn("⚠️ Impossible de récupérer les tokens CSRF, tentative d'inscription sans tokens");
      }
      
      // Vérifier la disponibilité du serveur avant de tenter l'inscription
      const isServerAvailable = await this.checkServerAvailability();
      if (!isServerAvailable) {
        const serverUrl = this.apiUrl || 'le serveur';
        return { 
          success: false, 
          error: `Impossible de communiquer avec le serveur (${serverUrl}). Le serveur est peut-être temporairement indisponible ou en maintenance. Veuillez réessayer dans quelques instants.`
        };
      }

      // Construire l'URL spécifique
      const url = `${this.apiUrl}/auth/register`;
      console.log("🌐 URL d'inscription complète:", url);
      
      // Préparer les données pour l'API backend
      const apiData = {
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phone,
        password: userData.password,
        passwordConfirm: userData.password,
        firstName: userData.fullName.split(' ')[0],
        lastName: userData.fullName.split(' ').slice(1).join(' '),
        fullName: userData.fullName,
        termsAccepted: userData.acceptTerms,
        role: userData.role.toUpperCase(),
        isFreelancer: userData.role === 'freelance'
      };

      console.log("📦 Données formatées:", { ...apiData, password: '***', passwordConfirm: '***' });

      // Vérification de l'URL du backend
      if (!this.apiUrl || this.apiUrl === '/api') {
        console.error("❌ URL de l'API non configurée correctement:", this.apiUrl);
        return { 
          success: false,
          error: "Configuration du serveur incorrecte. L'URL de l'API n'est pas définie."
        };
      }

      // Utiliser fetch avec option credentials include pour permettre l'envoi des cookies
      try {
        console.log("🔍 Tentative d'inscription avec fetch...");
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
          },
          body: JSON.stringify(apiData),
          mode: 'cors',
          credentials: 'include' // Inclure les cookies pour le CSRF
        });
        
        // Obtenir la réponse complète du serveur
        const responseText = await response.text();
        console.log(`📥 Réponse serveur (${response.status}):`, responseText);
        
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
          } else {
            errorMessage = responseData.message || `Erreur ${response.status}: Une erreur est survenue lors de l'inscription`;
          }
          
          console.error("❌ Échec de l'inscription avec fetch:", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (fetchError) {
        // Si fetch échoue, utiliser XMLHttpRequest comme fallback
        console.error("❌ Erreur fetch:", fetchError);
        console.log("⚠️ Retour au fallback XMLHttpRequest...");
        
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader('X-CSRF-Token', localStorage.getItem('csrf_token') || '');
          xhr.withCredentials = true; // Activer l'envoi des cookies pour le CSRF
          xhr.timeout = 15000;
          
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
              console.log("📋 Headers XHR reçus:", xhr.getAllResponseHeaders());
            }
          };
          
          xhr.onload = function() {
            console.log(`📥 Réponse XHR reçue (${xhr.status}):`, xhr.responseText);
            
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
          
          xhr.send(JSON.stringify(apiData));
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
      ...credentials,
      password: '***',
      autoRedirect,
      redirectUrl
    });
    
    try {
      // Récupérer les tokens CSRF avant la connexion
      const csrfTokens = await this.fetchCsrfTokens();
      if (!csrfTokens) {
        console.warn('Impossible de récupérer les tokens CSRF');
      }
      
      // Construction de l'URL
      const url = `${this.apiUrl}/auth/login`;
      
      // Requête de connexion
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      
      // Traiter la réponse
      const data = await response.json();
      
      if (!response.ok) {
        console.error("❌ Erreur de connexion:", data);
        return { 
          success: false, 
          error: data.message || "Identifiants incorrects" 
        };
      }
      
      console.log("✅ Connexion réussie:", data);
      
      // Stocker le token si présent
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      
      // Stocker le token CSRF s'il est fourni par le serveur
      if (data.csrfToken) {
        localStorage.setItem('csrf_token', data.csrfToken);
      }
      
      // Stocker les données utilisateur si présentes
      if (data.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        
        // Redirection automatique si activée
        if (autoRedirect) {
          // Rediriger vers la page appropriée selon le rôle
          const targetUrl = data.user.isFreelancer ? '/dashboard' : (redirectUrl || '/');
          this.forceRedirectAfterLogin(targetUrl);
        }
      }
      
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error("🔥 Erreur lors de la connexion:", error);
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
      this.removeToken();
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
      const storedToken = localStorage.getItem('nionfarToken');
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
    console.log('🔍 Vérification de la disponibilité du serveur backend sur:', this.apiUrl);
    
    // Essayer plusieurs endpoints pour une vérification robuste
    const endpoints = ['/health', '/status', '/', '/api'];
    
    for (const endpoint of endpoints) {
      try {
        const url = `${this.apiUrl}${endpoint}`;
        console.log(`🔄 Tentative de connexion à ${url}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        clearTimeout(timeoutId);
        
        // Si la réponse est OK, le serveur est accessible
        if (response.ok) {
          console.log('🟢 Serveur backend disponible à', url);
          return true;
        }
      } catch (error) {
        console.error(`❌ Échec de connexion à ${this.apiUrl}${endpoint}:`, error);
        // Continuer avec le prochain endpoint
      }
    }
    
    console.error('🔴 Serveur backend inaccessible après plusieurs tentatives:', this.apiUrl);
    localStorage.setItem('backendStatus', 'offline');
    localStorage.setItem('lastBackendCheck', new Date().toISOString());
    return false;
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
      
      // Forcer une redirection complète au lieu d'un rechargement
      window.location.href = finalUrlWithParams;
    }
  }

  // Méthode pour récupérer les tokens CSRF
  private async fetchCsrfTokens(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/security/csrf-tokens`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        console.error('Erreur lors de la récupération des tokens CSRF:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('csrf_token', data.token);
        console.log('Token CSRF récupéré avec succès');
      } else {
        console.warn('Token CSRF manquant dans la réponse');
      }
      
      return !!data.token;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens CSRF:', error);
      return false;
    }
  }
}

// Exporter une instance du service
export const authService = new AuthService(); 