import axios from 'axios';
import { toast } from 'react-toastify';
import { NextRouter } from 'next/router';
import { login as apiLogin, register as apiRegister } from '../src/lib/api';

// Constantes pour le stockage des données d'authentification
const AUTH_TOKEN_KEY = 'nionfarToken';
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nionfar.vercel.app';
    
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
      // Utiliser la nouvelle fonction d'API
      const response = await apiRegister(userData);
      
      console.log("✅ Inscription réussie:", response);
      
      // Redirection automatique vers la page appropriée selon le rôle
      const redirectUrl = response.user?.isFreelancer ? '/dashboard' : '/';
      
      console.log("✅ Inscription réussie! Redirection vers:", redirectUrl);
      
      // Forcer la redirection avec un léger délai pour permettre l'affichage du message de succès
      setTimeout(() => {
        console.log("🔄 Exécution de la redirection...");
        window.location.href = redirectUrl;
      }, 1500);
      
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error("❌ Erreur d'inscription:", error);
      
      // Essayer d'extraire le message d'erreur
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async login(credentials: LoginCredentials, autoRedirect = true, redirectUrl?: string): Promise<LoginResponse> {
    console.log("🔐 Tentative de connexion avec:", {
      email: credentials.emailOrPhone,
      password: '****',
      rememberMe: credentials.rememberMe
    });
    
    // Vérifier si l'utilisateur est bloqué
    if (this.isBlocked(credentials.emailOrPhone)) {
      const remainingMinutes = Math.ceil(this.getRemainingBlockTime(credentials.emailOrPhone) / 60000);
      return {
        success: false,
        error: `Trop de tentatives incorrectes. Compte bloqué pour ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
      };
    }
    
    try {
      // Utiliser la nouvelle fonction d'API
      const response = await apiLogin(
        credentials.emailOrPhone,
        credentials.password,
        credentials.rememberMe
      );
      
      console.log("✅ Connexion réussie:", response);
      
      // Réinitialiser les tentatives échouées
      this.resetFailedAttempts(credentials.emailOrPhone);
      
      // Mettre à jour la dernière connexion
      this.updateLastLogin();
      
      // Redirection automatique vers la page appropriée selon le rôle
      if (autoRedirect) {
        const actualRedirectUrl = redirectUrl || (response.user?.isFreelancer ? '/dashboard' : '/');
        
        console.log("🔄 Redirection automatique vers:", actualRedirectUrl);
        
        // Forcer la redirection avec un léger délai pour permettre l'affichage du message de succès
        setTimeout(() => {
          console.log("🔄 Exécution de la redirection...");
          window.location.href = actualRedirectUrl;
        }, 1500);
      }
      
      return {
        success: true,
        token: response.accessToken,
        user: response.user,
        message: response.message || "Connexion réussie"
      };
    } catch (error: any) {
      console.error("🔥 Erreur critique de connexion:", error);
      
      // Incrémenter les tentatives échouées même en cas d'erreur technique
      this.incrementFailedAttempts(credentials.emailOrPhone);
      
      // Essayer d'extraire le message d'erreur
      let errorMessage = "Une erreur est survenue lors de la connexion";
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
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
      localStorage.removeItem('nionfarToken');
      localStorage.removeItem('nionfarUser');
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
      localStorage.setItem('nionfarToken', token);
    }
  }

  private removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nionfarToken');
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
  private checkServerAvailability(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        console.log('🔍 Vérification de la disponibilité du serveur backend:', this.apiUrl);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => {
          controller.abort();
          console.error('🕒 Délai d\'attente dépassé lors de la vérification du serveur');
        }, 5000);
        
        // Tester avec une requête simple à l'endpoint health
        const response = await fetch(`${this.apiUrl}/health`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🟢 Serveur backend disponible:', data);
          resolve(true);
        } else {
          console.error('🔴 Serveur backend inaccessible - Statut:', response.status);
          console.error('Détails:', await response.text());
          resolve(false);
        }
      } catch (error) {
        console.error('🔴 Erreur lors de la vérification du serveur backend:', error);
        console.error('URL API configurée:', this.apiUrl);
        console.error('Environnement:', process.env.NODE_ENV);
        console.error('Variables d\'environnement:', {
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
          NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT
        });
        
        // Afficher des informations sur la connectivité réseau si disponible
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
          console.log('État de la connexion Internet du navigateur:', navigator.onLine ? 'En ligne' : 'Hors ligne');
        }
        
        resolve(false);
      }
    });
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

  private saveAuthDataToLocalStorage(): void {
    if (this.localStorageAvailable) {
      if (this.token) {
        localStorage.setItem('nionfarToken', this.token);
      }
      if (this.user) {
        localStorage.setItem('nionfarUser', JSON.stringify(this.user));
      }
    }
  }

  private loadAuthDataFromLocalStorage(): void {
    if (this.localStorageAvailable) {
      // Charger le token et les données utilisateur
      const token = localStorage.getItem('nionfarToken');
      const userJson = localStorage.getItem('nionfarUser');
      
      if (token) {
        this.token = token;
      }
      
      if (userJson) {
        try {
          this.user = JSON.parse(userJson);
        } catch (e) {
          console.error('Erreur lors du chargement des données utilisateur:', e);
          this.user = null;
          localStorage.removeItem('nionfarUser');
        }
      }
    }
  }
}

// Exporter une instance du service
export const authService = new AuthService(); 