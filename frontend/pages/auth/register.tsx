import React, { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiAlertCircle, FiCheckCircle, FiUser, FiBriefcase, FiMail, FiPhone, FiLock } from 'react-icons/fi/index.js';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

type UserRole = 'client' | 'freelance';

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

const Register: React.FC = () => {
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
  const [userType, setUserType] = useState<UserRole>('client');

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
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
    
    // Validation des critères de complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.');
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
      
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
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

  // Fonction pour vérifier le statut du backend au chargement de la page
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log("Soumission du formulaire d'inscription avec:", {
      username,
      email: email || undefined,
      phone: phone || undefined,
      password: password ? "***" : undefined,
      fullName,
      acceptTerms,
      role: userType
    });
    
    // Vérifier les conditions d'inscription
    if (!username || !password || !fullName) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }

    if (!email && !phone) {
      setError('Veuillez fournir un email ou un numéro de téléphone');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setIsLoading(false);
      return;
    }

    // Vérifier la complexité du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Mot de passe invalide');
      setIsLoading(false);
      return;
    }
    
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h2 className="text-center text-3xl font-extrabold text-indigo-600">
              NionFar<span className="text-violet-500">.sn</span>
            </h2>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Sélection du type d'utilisateur */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Je m'inscris en tant que</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
                  userType === 'client'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiUser className="text-2xl mb-2" />
                <span className="text-sm font-medium">Client</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('freelance')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
                  userType === 'freelance'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiBriefcase className="text-2xl mb-2" />
                <span className="text-sm font-medium">Freelance</span>
              </button>
            </div>
          </div>

          {/* Nom complet */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Prénom et nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="nom_utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email {!phone && <span className="text-red-500">*</span>}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone {!email && <span className="text-red-500">*</span>}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="775555555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <Link
                href="/terms"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                target="_blank"
              >
                conditions générales d'utilisation
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </div>
              ) : (
                'Créer un compte'
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          En vous inscrivant, vous acceptez notre {' '}
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
            politique de confidentialité
          </Link>
          {' '} et nos {' '}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
            conditions d'utilisation
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;