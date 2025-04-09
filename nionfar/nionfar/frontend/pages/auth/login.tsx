import React, { useState, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authService } from '../../services/authService';
import { NextPage } from 'next';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi/index.js';

// Délai de redirection après connexion réussie
const REDIRECT_DELAY = 100;

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Récupérer le paramètre de redirection de l'URL
      const { redirect } = router.query;
      const redirectUrl = typeof redirect === 'string' ? decodeURIComponent(redirect) : '/';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[LoginPage] URL de redirection après connexion:', redirectUrl);
      }

      // Valider l'email/téléphone
      if (!isValidEmailOrPhone(email)) {
        setError('Veuillez entrer un email ou un numéro de téléphone valide');
        setLoading(false);
        return;
      }

      // Valider le mot de passe
      if (password.length < 4) {
        setError('Le mot de passe doit contenir au moins 4 caractères');
        setLoading(false);
        return;
      }

      // Connexion via le service d'authentification
      const response = await authService.login(
        { emailOrPhone: email, password, rememberMe },
        true // Activer la redirection automatique
      );

      if (response.success) {
        // Authentification réussie - la redirection est gérée par le service
        setMessage('Connexion réussie! Redirection en cours...');
      } else {
        // Erreur d'authentification
        setError(response.error || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, router]);

  // Validation d'email ou de numéro de téléphone
  const isValidEmailOrPhone = (value: string): boolean => {
    return value.includes('@') || /^[0-9]{9,10}$/.test(value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* En-tête */}
        <div>
          <Link href="/" className="flex justify-center">
            <h2 className="text-center text-3xl font-extrabold text-indigo-600">
              NionFar<span className="text-violet-500">.sn</span>
            </h2>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              créez un nouveau compte
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
        
        {/* Messages de succès */}
        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{message}</h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Formulaire de connexion */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email ou téléphone
              </label>
              <input
                id="email-address"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email ou téléphone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors`}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;