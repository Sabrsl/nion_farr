import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiAlertCircle, FiCheckCircle, FiUser, FiBriefcase, FiMail, FiPhone, FiLock } from 'react-icons/fi/index.js';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

type UserRole = 'freelance' | 'client';

interface RegisterFormProps {
  defaultAccountType?: UserRole;
}

// Fonction de validation de mot de passe
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) return { valid: false, message: 'Le mot de passe est requis' };
  if (password.length < 8) return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  
  // Vérifier les critères de complexité
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  
  if (!hasUpperCase) return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule' };
  if (!hasLowerCase) return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre minuscule' };
  if (!hasDigit) return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  if (!hasSpecialChar) return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
  
  return { valid: true };
}

const RegisterForm: React.FC<RegisterFormProps> = ({ defaultAccountType = 'client' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<UserRole>(defaultAccountType);

  // Validation des champs
  const validateForm = useCallback(() => {
    // Réinitialiser les erreurs
    setError('');

    // Vérifier l'acceptation des termes
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales d\'utilisation.');
      return false;
    }

    // Vérifier les champs obligatoires
    if ((!email && !phone) || !password || !username || !fullName) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return false;
    }

    // Validation de l'email si fourni
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }

    // Validation du téléphone si fourni
    if (phone && !phone.match(/^[0-9]{9,10}$/)) {
      setError('Veuillez entrer un numéro de téléphone valide (9-10 chiffres).');
      return false;
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Mot de passe invalide');
      return false;
    }

    // Vérification de la concordance des mots de passe
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }

    // Validation du nom d'utilisateur (alphanumériques + quelques caractères spéciaux)
    if (!username.match(/^[a-zA-Z0-9._-]{3,20}$/)) {
      setError('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, ., _, -).');
      return false;
    }

    return true;
  }, [email, phone, password, confirmPassword, username, fullName, acceptTerms]);

  // Gestionnaire d'erreurs amélioré
  const handleApiError = (errorMessage: string) => {
    console.error("📛 Erreur d'API traitée:", errorMessage);
    
    // Traiter les erreurs de réseau de manière spécifique
    if (errorMessage.includes('impossible de communiquer') || 
        errorMessage.includes('failed to fetch') || 
        errorMessage.includes('network error') ||
        errorMessage.toLowerCase().includes('cors')) {
      
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api';
      
      // Vérifier si le backend a été précédemment détecté comme hors ligne
      const backendStatus = localStorage.getItem('backendStatus');
      const lastCheck = localStorage.getItem('lastBackendCheck');
      
      if (backendStatus === 'offline' && lastCheck) {
        const checkTime = new Date(lastCheck).toLocaleTimeString();
        setError(`Le serveur (${serverUrl}) semble être temporairement indisponible (dernière vérification à ${checkTime}). 
                  L'équipe technique a été informée de ce problème. Veuillez réessayer ultérieurement ou contacter le support.`);
      } else {
        setError(`Impossible de se connecter au serveur (${serverUrl}). 
                  Le serveur est peut-être temporairement indisponible ou en maintenance. Veuillez réessayer dans quelques instants.`);
      }
      
      console.error("🌐 URL backend configurée:", serverUrl);
      
      return;
    }
    
    // Erreur CSRF
    if (errorMessage.toLowerCase().includes('csrf')) {
      setError("Erreur de sécurité (CSRF). Rafraîchissez la page et réessayez.");
      return;
    }
    
    // Erreur d'authentification 
    if (errorMessage.toLowerCase().includes('unauthorized') || 
        errorMessage.toLowerCase().includes('non autorisé')) {
      setError("Authentification non autorisée. Veuillez réessayer.");
      return;
    }
    
    // Erreur par défaut
    setError(errorMessage || "Une erreur inattendue est survenue");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Tentative d'inscription via authService...");
      const result = await authService.register({
        username,
        email: email || undefined,
        phone: phone || undefined,
        password,
        fullName,
        acceptTerms,
        role: userType
      });
      
      if (result.success) {
        console.log("✅ Inscription réussie:", result);
        setIsLoading(false);
        setSuccess('Inscription réussie ! Redirection...');
        setError('');
        
        toast.success('Inscription réussie ! Redirection...');
        
        // La redirection est gérée par authService
      } else {
        console.error("❌ Échec de l'inscription:", result.error);
        setIsLoading(false);
        setSuccess('');
        
        // Afficher le message d'erreur
        handleApiError(result.error || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error) {
      console.error("🔥 Exception lors de l'inscription:", error);
      setIsLoading(false);
      setSuccess('');
      
      // Afficher le message d'exception
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      handleApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Vérifier le statut du backend au chargement du formulaire
  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api';
        
        // Utiliser AbortController pour gérer le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${backendUrl}/health`, { 
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
        
        if (response.ok) {
          localStorage.setItem('backendStatus', 'online');
          localStorage.setItem('lastBackendCheck', new Date().toISOString());
        } else {
          localStorage.setItem('backendStatus', 'offline');
          localStorage.setItem('lastBackendCheck', new Date().toISOString());
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du backend:", error);
        localStorage.setItem('backendStatus', 'offline');
        localStorage.setItem('lastBackendCheck', new Date().toISOString());
      }
    };
    
    checkBackendStatus();
  }, []);

  // Récupérer le jeton CSRF lors du chargement
  React.useEffect(() => {
    async function fetchCsrfToken() {
      try {
        console.log("🔄 Tentative de récupération du token CSRF pour le formulaire d'inscription");
        // Essayer d'abord via le proxy local
        const csrfResponse = await fetch('/api/security/csrf-tokens', {
          method: 'GET',
          credentials: 'include',
          headers: { 
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        });
        
        if (csrfResponse.ok) {
          const data = await csrfResponse.json();
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès pour le formulaire d\'inscription');
          }
        } else {
          // Essayer directement avec le backend
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';
          const backendUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.substring(0, apiBaseUrl.length - 4) : apiBaseUrl;
          
          console.log('⚠️ Tentative directe de récupération du token CSRF depuis:', `${backendUrl}/api/security/csrf-tokens`);
          
          const directResponse = await fetch(`${backendUrl}/api/security/csrf-tokens`, {
            method: 'GET',
            credentials: 'include',
            headers: { 
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Origin': window.location.origin
            }
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            if (directData.token) {
              localStorage.setItem('csrf_token', directData.token);
              console.log('✅ Token CSRF récupéré avec succès via requête directe');
            }
          } else {
            console.warn('⚠️ Impossible de récupérer le token CSRF directement');
            
            // Dernière tentative avec le endpoint auth
            try {
              const authResponse = await fetch(`${backendUrl}/api/auth/csrf-tokens`, {
                method: 'GET',
                credentials: 'include',
                headers: { 
                  'X-Requested-With': 'XMLHttpRequest',
                  'Accept': 'application/json',
                  'Origin': window.location.origin
                }
              });
              
              if (authResponse.ok) {
                const authData = await authResponse.json();
                if (authData.token) {
                  localStorage.setItem('csrf_token', authData.token);
                  console.log('✅ Token CSRF récupéré avec succès via /api/auth/csrf-tokens');
                }
              } else {
                console.warn('⚠️ Impossible de récupérer le token CSRF via /api/auth/csrf-tokens');
              }
            } catch (authError) {
              console.error('❌ Erreur lors de la récupération du token CSRF via auth:', authError);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du token CSRF:', error);
      }
    }
    
    fetchCsrfToken();
  }, []);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Messages d'erreur/succès */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {success}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Type de compte */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de compte
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center px-4 py-3 border ${
              userType === 'client' 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                : 'border-gray-300 text-gray-700 bg-white'
            } rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none transition-colors`}
            onClick={() => setUserType('client')}
          >
            <FiUser className="mr-2" />
            Client
          </button>
          
          <button
            type="button"
            className={`flex-1 flex items-center justify-center px-4 py-3 border ${
              userType === 'freelance' 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                : 'border-gray-300 text-gray-700 bg-white'
            } rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none transition-colors`}
            onClick={() => setUserType('freelance')}
          >
            <FiBriefcase className="mr-2" />
            Freelance
          </button>
        </div>
      </div>

      {/* Nom complet */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Nom complet
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="text-gray-400" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Prénom et Nom"
          />
        </div>
      </div>

      {/* Nom d'utilisateur */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Nom d'utilisateur
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">@</span>
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="username"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="vous@exemple.com"
          />
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPhone className="text-gray-400" />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="77 123 45 67"
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
        </p>
      </div>

      {/* Confirmer mot de passe */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmer le mot de passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Accepter les conditions */}
      <div className="flex items-center">
        <input
          id="accept-terms"
          name="accept-terms"
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
          J'accepte les{' '}
          <Link href="/conditions-utilisation" className="font-medium text-indigo-600 hover:text-indigo-500">
            conditions d'utilisation
          </Link>
          {' '}et la{' '}
          <Link href="/politique-confidentialite" className="font-medium text-indigo-600 hover:text-indigo-500">
            politique de confidentialité
          </Link>
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Création du compte...' : 'Créer un compte'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm; 