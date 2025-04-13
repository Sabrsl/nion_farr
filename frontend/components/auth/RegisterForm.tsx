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
    if (!email || !password || !fullName || !userType) {
      setError('Veuillez remplir tous les champs obligatoires (email, nom complet, mot de passe, type de compte).');
      return false;
    }

    // Validation de l'email si fourni
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Veuillez entrer une adresse email valide.');
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

    return true;
  }, [acceptTerms, email, password, confirmPassword, fullName, userType]);

  // Gestionnaire d'erreurs amélioré
  const handleApiError = (errorMessage: string) => {
    // Analyser si l'erreur est liée au CSRF
    if (errorMessage.toLowerCase().includes('csrf') || 
        errorMessage.toLowerCase().includes('sécurité') ||
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('refresh')) {
      console.error('⚠️ Erreur CSRF détectée:', errorMessage);
      
      // Réinitialiser tout token existant
      try {
        localStorage.removeItem('csrf_token');
      } catch (e) {
        console.error('Erreur lors de la suppression du token CSRF:', e);
      }
      
      // Nous informons l'utilisateur et réessayons automatiquement
      setError('Erreur de validation temporaire. Nouvelle tentative en cours...');
      
      // Attendre un court délai puis réessayer
      setTimeout(() => {
        handleSubmit(new Event('retry') as any);
      }, 1000);
      
      return;
    }
    
    // Gestion spécifique des erreurs connues
    if (errorMessage.includes('existe déjà')) {
      setError('Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.');
      return;
    }
    
    if (errorMessage.includes('mot de passe')) {
      setError('Votre mot de passe ne respecte pas les critères requis. Il doit contenir au moins 8 caractères, incluant des majuscules, des minuscules et des chiffres.');
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
    
    // Préparation des données selon le format attendu par le backend
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').slice(1).join(' ') || firstName;
    
    console.log("📝 Données formatées pour l'inscription:", { 
      email,
      firstName,
      lastName,
      password: '***',
      role: userType.toUpperCase()
    });
    
    try {
      console.log("Tentative d'inscription via authService...");
      
      // Utiliser spécifiquement notre point d'entrée API pour éviter les problèmes de méthode
      const apiUrl = '/api/auth/register';
      
      // Utiliser directement fetch pour s'assurer que la méthode POST est bien utilisée
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HTTP-Method': 'POST',
          'X-HTTP-Method-Override': 'POST'
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          passwordConfirm: confirmPassword,
          termsAccepted: acceptTerms,
          role: userType.toUpperCase(),
          isFreelancer: userType === 'freelance'
        }),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setIsLoading(false);
        handleApiError(errorData.error || errorData.message || 'Erreur lors de l\'inscription');
        return;
      }
      
      const result = await response.json();
      
      if (result.success || result.token || result.user) {
        console.log("✅ Inscription réussie:", result);
        
        // Afficher des détails supplémentaires pour le débogage
        console.log("📊 État de l'inscription:", { 
          success: result.success, 
          hasToken: !!result.token, 
          hasUser: !!result.user,
          userDetails: result.user,
          message: result.message,
          redirectTo: result.redirectTo,
          rawResult: JSON.stringify(result)
        });

        setIsLoading(false);
        setSuccess('Inscription réussie ! Redirection...');
        setError('');
        
        toast.success('Inscription réussie ! Redirection...');
        
        // Stocker les données d'authentification
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
        
        if (result.user) {
          // S'assurer que l'utilisateur est enregistré avec le bon format
          const userData = {
            ...result.user,
            role: result.user.role || userType.toUpperCase(),
            isFreelancer: result.user.isFreelancer || userType === 'freelance'
          };
          
          // Stocker les données utilisateur
          localStorage.setItem('nionfarUser', JSON.stringify(userData));
          
          // Mémoriser explicitement le type de compte
          const accountType = userType === 'freelance' ? 'freelancer' : 'client';
          localStorage.setItem('accountType', accountType);
          
          console.log(`✅ Redirection vers la page d'accueil en tant que ${accountType}`);
          
          // Forcer la mise à jour du header en stockant un signal spécifique
          localStorage.setItem('auth_updated', Date.now().toString());
          // Déclencher un événement pour informer les autres composants
          window.dispatchEvent(new Event('storage'));
          
          // Rediriger vers l'URL suggérée par l'API ou la page d'accueil par défaut
          const redirectUrl = result.redirectTo || '/';
          console.log(`🔄 Redirection vers: ${redirectUrl}`);
          
          // NOUVEAU MÉCANISME DE REDIRECTION - méthode directe avec pushState + reload
          console.log('🚀 Méthode de redirection pushState + reload');
          
          try {
            // 1. Changer l'URL avec history API
            window.history.pushState({auth: true}, '', redirectUrl);
            
            // 2. Forcer un rafraîchissement complet de la page
            window.location.reload();
            
            // Fallback si reload ne fonctionne pas immédiatement
            setTimeout(() => {
              if (window.location.pathname !== redirectUrl) {
                console.log('⚠️ Redirection avec reload échouée, tentative avec document.location');
                document.location.href = redirectUrl;
              }
            }, 200);
          } catch (redirectError) {
            console.error('⚠️ Erreur avec la méthode pushState:', redirectError);
            // Méthode alternative
            window.location.href = redirectUrl;
          }
        }
      } else {
        console.error("❌ Échec de l'inscription:", result);
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
    <div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Champs obligatoires</strong> marqués d'un <span className="text-red-500">*</span> : 
              <strong>Email</strong>, 
              <strong>Nom complet</strong>, 
              <strong>Mot de passe</strong>, 
              <strong>Type de compte</strong> et 
              <strong>Conditions d'utilisation</strong>.
            </p>
          </div>
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center">
            <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {/* Type de compte */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de compte <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex space-x-4">
            <div 
              onClick={() => setUserType('client')}
              className={`p-3 border rounded-md cursor-pointer flex-1 text-center transition ${
                userType === 'client' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <FiUser className="w-5 h-5 mx-auto mb-1" />
              <div className="font-medium">Client</div>
              <div className="text-xs text-gray-500">Je souhaite embaucher</div>
            </div>
            <div 
              onClick={() => setUserType('freelance')}
              className={`p-3 border rounded-md cursor-pointer flex-1 text-center transition ${
                userType === 'freelance' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <FiBriefcase className="w-5 h-5 mx-auto mb-1" />
              <div className="font-medium">Freelance</div>
              <div className="text-xs text-gray-500">Je cherche du travail</div>
            </div>
          </div>
        </div>

        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Nom complet <span className="text-red-500">*</span>
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

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe <span className="text-red-500">*</span>
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

        {/* Acceptation des conditions */}
        <div className="flex items-center">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
            J'accepte les <a href="/conditions" className="text-indigo-600 hover:text-indigo-500">conditions d'utilisation</a> et la <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">politique de confidentialité</a>
          </label>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <span className="text-red-500">*</span> Champs obligatoires
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? 'Création du compte...' : 'Créer un compte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm; 