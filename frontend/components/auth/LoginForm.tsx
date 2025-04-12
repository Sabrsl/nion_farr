import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi/index.js';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';

interface LoginFormProps {
  redirectUrl?: string;
}

const LoginForm = ({ redirectUrl }: LoginFormProps) => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Effacer les erreurs quand l'utilisateur modifie les champs
    if (errorMessage && (name === 'emailOrPhone' || name === 'password')) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Validation de base côté client
    if (!credentials.emailOrPhone.trim()) {
      setErrorMessage('Veuillez entrer votre email ou numéro de téléphone');
      setIsLoading(false);
      return;
    }

    if (!credentials.password) {
      setErrorMessage('Veuillez entrer votre mot de passe');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.login(credentials, true, redirectUrl);
      
      if (!response.success) {
        // Si l'erreur est liée à la connexion réseau et que c'est la première tentative
        if ((response.error?.includes('réseau') || response.error?.includes('serveur')) && retryAttempt === 0) {
          // Incrémenter le compteur de tentatives
          setRetryAttempt(1);
          
          // Attendre 2 secondes avant de réessayer
          setTimeout(async () => {
            console.log("🔄 Nouvelle tentative de connexion automatique...");
            try {
              const retryResponse = await authService.login(credentials, true, redirectUrl);
              
              if (!retryResponse.success) {
                setErrorMessage(retryResponse.error || 'Échec de la connexion après nouvelle tentative');
              }
            } catch (retryError) {
              console.error('Erreur lors de la nouvelle tentative:', retryError);
              setErrorMessage('Échec de la connexion après nouvelle tentative');
            } finally {
              setIsLoading(false);
            }
          }, 2000);
          
          // Mettre à jour le message d'erreur pour informer l'utilisateur
          setErrorMessage('Problème de connexion, nouvelle tentative en cours...');
          return;
        }
        
        // Afficher l'erreur
        setErrorMessage(response.error || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrorMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className={`mb-6 border-l-4 rounded-md p-3 sm:p-4 flex items-start ${
            errorMessage.includes('tentative en cours') 
              ? 'bg-blue-50 border-blue-400 text-blue-700' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            <svg className={`h-5 w-5 ${errorMessage.includes('tentative en cours') ? 'text-blue-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      <div>
        <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
          Email ou téléphone
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="emailOrPhone"
            name="emailOrPhone"
            type="text"
            autoComplete="email"
            required
            value={credentials.emailOrPhone}
            onChange={handleChange}
            className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
            placeholder="votre@email.com ou +221XXXXXXXXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={credentials.password}
            onChange={handleChange}
            className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
            placeholder="••••••••"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-150"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>

        <div className="text-sm">
          <a href="/mot-de-passe-oublie" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Mot de passe oublié?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <FiLogIn className={`h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors ${isLoading ? 'animate-pulse' : ''}`} />
          </span>
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm; 