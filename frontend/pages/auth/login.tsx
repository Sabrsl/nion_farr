import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authService } from '../../services/authService';
import { NextPage } from 'next';
import { FiAlertCircle, FiCheckCircle, FiWifi, FiWifiOff } from 'react-icons/fi';
import { testBackendConnectivity } from '../../src/lib/api';

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
  const [serverStatus, setServerStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [connectionTestActive, setConnectionTestActive] = useState(false);

  // Vérifier la disponibilité du serveur au chargement de la page
  useEffect(() => {
    const checkServerConnection = async () => {
      if (connectionTestActive) return;
      
      const isAvailable = await testBackendConnectivity();
      setServerStatus(isAvailable ? 'available' : 'unavailable');
    };

    checkServerConnection();
  }, [connectionTestActive]);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Vérifier d'abord si le serveur est disponible
    if (serverStatus === 'unavailable') {
      setError('Le serveur est actuellement inaccessible. Veuillez réessayer ultérieurement.');
      setLoading(false);
      return;
    }

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
        false // Désactiver la redirection automatique pour mieux contrôler l'expérience utilisateur
      );

      if (response.success) {
        // Authentification réussie - afficher un message avant la redirection
        setMessage('Connexion réussie! Redirection en cours...');
        
        // Redirection avec délai pour montrer le message de succès
        setTimeout(() => {
          // Determine redirect URL based on user role or isFreelancer flag
          let targetUrl = redirectUrl || '/';
          if (response.user) {
            if (response.user.role === 'freelance' || (response.user as any).isFreelancer) {
              targetUrl = '/dashboard';
            }
          }
          router.push(targetUrl);
        }, 1500);
      } else {
        // Erreur d'authentification
        setError(response.error || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Vérifier à nouveau la connectivité au serveur
      const isServerAvailable = await testBackendConnectivity();
      
      if (!isServerAvailable) {
        setError('Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.');
        setServerStatus('unavailable');
      } else {
        setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, router, serverStatus]);

  // Validation d'email ou de numéro de téléphone
  const isValidEmailOrPhone = (value: string): boolean => {
    // Valider un email (contient @)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+]{9,15}$/;
    
    return emailRegex.test(value) || phoneRegex.test(value);
  };
  
  // Fonction pour tester manuellement la connexion au serveur
  const testServerConnection = async () => {
    setConnectionTestActive(true);
    setServerStatus('checking');
    setMessage('Test de connexion en cours...');
    setError('');
    
    // Tester la connexion directement à l'URL de production
    try {
      const response = await fetch('https://nionfar-backend.onrender.com/api/health', {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus('available');
        setMessage(`Serveur disponible : ${data.message || 'OK'}`);
        console.log('Données du serveur:', data);
      } else {
        setServerStatus('unavailable');
        setError(`Erreur de connexion au serveur (${response.status})`);
      }
    } catch (error) {
      console.error('Erreur de test:', error);
      setServerStatus('unavailable');
      setError(`Échec de connexion au serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setConnectionTestActive(false);
    }
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

        {/* Indicateur de statut du serveur */}
        {serverStatus === 'checking' && (
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiWifi className="h-5 w-5 text-gray-400 animate-pulse" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">Vérification de la connexion au serveur...</h3>
              </div>
            </div>
          </div>
        )}
        
        {serverStatus === 'unavailable' && (
          <div className="rounded-md bg-orange-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiWifiOff className="h-5 w-5 text-orange-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Le serveur est actuellement inaccessible. La connexion pourrait ne pas fonctionner correctement.
                </h3>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={testServerConnection}
                    disabled={connectionTestActive}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {connectionTestActive ? 'Test en cours...' : 'Tester à nouveau'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
              disabled={isLoading || serverStatus === 'unavailable'}
              aria-busy={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || serverStatus === 'unavailable'
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors`}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
          
          {/* Diagnostic */}
          <div className="mt-4 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={testServerConnection}
              disabled={connectionTestActive}
              className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center"
            >
              <FiWifi className="mr-1" /> 
              {connectionTestActive ? 'Test en cours...' : 'Tester la connexion au serveur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;