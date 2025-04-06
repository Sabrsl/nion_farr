import axios from 'axios';
import { toast } from 'react-toastify';
import { NextRouter } from 'next/router';

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
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
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

  async register(data: RegisterData): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      // Vérifier que l'email ou le téléphone est fourni
      if (!data.email && !data.phone) {
        return { 
          success: false, 
          message: 'Veuillez fournir un email ou un numéro de téléphone' 
        };
      }
      
      console.log('Envoi des données d\'inscription à l\'API:', `${this.apiUrl}/auth/register`);
      
      // Mode développement - simulation backend pour tests
      if (process.env.NODE_ENV === 'development' && (this.apiUrl.includes('localhost') || this.apiUrl === '/api')) {
        console.log('Mode développement: Simulation d\'une inscription réussie');
        
        // Créer un utilisateur simulé
        const mockUser: User = {
          id: 'mock-user-id-' + Date.now(),
          username: data.username,
          email: data.email || 'mock@example.com',
          phone: data.phone,
          role: data.role,
          isVerified: true,
          emailVerified: true,
          phoneVerified: !!data.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Créer un token simulé
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Stocker les données simulées
        this.token = mockToken;
        this.user = mockUser;
        this.saveToStorage();
        
        // Pour les tests de OTP
        if (data.phone) {
          return { 
            success: true, 
            message: 'Veuillez vérifier votre numéro de téléphone avec le code OTP (pour les tests, utilisez 123456)',
            user: mockUser
          };
        }
        
        // Retourner succès sans redirection
        return {
          success: true,
          message: 'Inscription simulée réussie en mode développement',
          user: mockUser
        };
      }
      
      // Code normal pour la production
      // Adapter le format des données si nécessaire pour la compatibilité avec le backend
      const apiData = {
        email: data.email,
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        phoneNumber: data.phone,
        password: data.password,
        passwordConfirm: data.password, // Le backend attend une confirmation
        termsAccepted: data.acceptTerms,
        role: data.role
      };

      // Appel à l'API pour enregistrer l'utilisateur
      const response = await axios.post(`${this.apiUrl}/auth/register`, apiData);
      const result = response.data;
      
      // Gérer le cas où le backend renvoie juste un message sans token/user
      if (!result.token && !result.user) {
        return {
          success: true,
          message: result.message || 'Inscription réussie. Veuillez vérifier votre email.'
        };
      }
      
      // Authentifier l'utilisateur automatiquement après l'inscription
      if (result.token && result.user) {
        this.setAuthData(result);
      }
      
      // Rediriger vers la vérification OTP si phone est fourni
      if (data.phone) {
        return { 
          success: true, 
          message: 'Veuillez vérifier votre numéro de téléphone avec le code OTP envoyé',
          user: result.user
        };
      }
      
      // Pas de redirection automatique vers le tableau de bord
      // La redirection sera gérée par le composant appelant
      
      return { 
        success: true, 
        message: result.message || 'Inscription réussie', 
        user: result.user
      };
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      // Mode développement - gestion d'erreur spécifique
      if (process.env.NODE_ENV === 'development' && (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED'))) {
        console.warn('Backend inaccessible en mode développement. Création d\'un compte simulé.');
        
        // Créer un utilisateur simulé
        const mockUser: User = {
          id: 'mock-user-id-' + Date.now(),
          username: data.username,
          email: data.email || 'mock@example.com',
          phone: data.phone,
          role: data.role,
          isVerified: true,
          emailVerified: true,
          phoneVerified: !!data.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Créer un token simulé
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Stocker les données simulées
        this.token = mockToken;
        this.user = mockUser;
        this.saveToStorage();
        
        return {
          success: true,
          message: 'Inscription simulée réussie (backend non disponible)',
          user: mockUser
        };
      }
      
      // Améliorer le message d'erreur avec les détails du backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Une erreur est survenue lors de l\'inscription';
      
      // Journaliser plus de détails pour le débogage
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Erreur de requête (pas de réponse):', error.request);
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }

  async login(data: LoginCredentials, autoRedirect: boolean = false, customUrl?: string): Promise<LoginResponse> {
    const identifier = data.emailOrPhone;

    // Vérifier si l'utilisateur est temporairement bloqué
    if (this.isBlocked(identifier)) {
      const remainingTime = this.getRemainingBlockTime(identifier);
      return { 
        success: false, 
        message: `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.` 
      };
    }

    try {
      // Dans le mode développement/démo, simuler une connexion réussie
      if (process.env.NODE_ENV === 'development' && (this.apiUrl.includes('localhost') || this.apiUrl === '/api')) {
        console.log('Mode développement: Simulation d\'une connexion réussie');
        
        // Pour la démonstration, vérifier si l'email contient "test"
        if (data.emailOrPhone.includes('test')) {
          // Créer un utilisateur simulé
          const mockUser: User = {
            id: 'mock-user-id-' + Date.now(),
            username: data.emailOrPhone.split('@')[0],
            email: data.emailOrPhone,
            role: 'client', // Par défaut client
            isVerified: true,
            emailVerified: true,
            phoneVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Créer un token simulé
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          // Stocker les données simulées
          this.token = mockToken;
          this.user = mockUser;
          
          // Force une mise à jour immédiate du localStorage pour garantir sa disponibilité
          try {
            console.log('Stockage immédiat des données utilisateur dans localStorage');
            localStorage.setItem('nionfarToken', mockToken);
            localStorage.setItem('nionfarUser', JSON.stringify(mockUser));
            
            // Signal pour indiquer une connexion réussie (utilisé par les composants)
            localStorage.setItem('lastAuthSuccess', Date.now().toString());
            
            // Déclencher un événement global pour forcer la mise à jour des composants
            if (typeof window !== 'undefined') {
              // Pour les autres onglets/fenêtres
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'nionfarUser',
                newValue: JSON.stringify(mockUser)
              }));
              
              // Pour l'onglet actuel
              window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { user: mockUser, isAuthenticated: true }
              }));
            }
          } catch (storageError) {
            console.error('Erreur lors du stockage des données utilisateur:', storageError);
          }
          
          this.saveToStorage();
          
          // Réinitialiser le compteur de tentatives échouées
          this.resetFailedAttempts(identifier);
          
          console.log('Connexion simulée réussie, utilisateur:', mockUser.username);
          
          return {
            success: true,
            token: mockToken,
            user: mockUser
          };
        } else {
          // Échec de connexion simulé
          console.log('Échec de connexion simulée: identifiants invalides');
          this.incrementFailedAttempts(identifier);
          
          return {
            success: false,
            message: 'Identifiants invalides'
          };
        }
      }

      // Code pour la production - appel API réel
      const response = await axios.post(`${this.apiUrl}/auth/login`, data);
      const dataResponse = response.data;

      // Réinitialiser le compteur de tentatives échouées en cas de succès
      this.resetFailedAttempts(identifier);

      // Si le téléphone n'est pas vérifié et qu'une vérification OTP est requise
      if (dataResponse.requiresOtp) {
        return {
          success: false,
          message: 'Vérification par téléphone requise',
          requiresOtp: true,
          temporaryToken: dataResponse.temporaryToken
        };
      }

      // Connexion réussie
      if (dataResponse.token) {
        this.setToken(dataResponse.token);
        
        // Forcer une mise à jour immédiate du localStorage
        if (dataResponse.user && typeof window !== 'undefined') {
          localStorage.setItem('nionfarUser', JSON.stringify(dataResponse.user));
          localStorage.setItem('lastAuthSuccess', Date.now().toString());
          
          // Déclencher un événement global de changement d'état
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'nionfarUser',
            newValue: JSON.stringify(dataResponse.user)
          }));
          
          window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: dataResponse.user, isAuthenticated: true }
          }));
        }
        
        this.setAuthData(dataResponse);
        this.updateLastLogin();
        
        return {
          success: true,
          token: dataResponse.token,
          user: dataResponse.user
        };
      }

      return { success: false, message: 'Échec de connexion' };
    } catch (error: any) {
      // Incrémenter le compteur de tentatives échouées
      this.incrementFailedAttempts(identifier);

      // Vérifier si l'utilisateur doit être bloqué
      if (this.getFailedAttempts(identifier) >= this.MAX_FAILED_ATTEMPTS) {
        this.blockUser(identifier);
        return { 
          success: false, 
          message: `Trop de tentatives échouées. Compte bloqué pour ${this.BLOCK_DURATION_MINUTES} minutes.` 
        };
      }

      return { 
        success: false, 
        message: error.response?.data?.message || 'Identifiants invalides' 
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
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
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
  private async checkServerAvailability(): Promise<void> {
    try {
      await axios.get(`${this.apiUrl}/health`, { timeout: 5000 });
      console.log('🟢 Serveur backend disponible');
    } catch (error) {
      console.warn('🔴 Serveur backend inaccessible - les fonctionnalités d\'authentification peuvent ne pas fonctionner correctement');
      console.warn(`URL du serveur: ${this.apiUrl}`);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Assurez-vous que le serveur backend est en cours d\'exécution');
      }
    }
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
}

// Exporter une instance du service
export const authService = new AuthService(); 