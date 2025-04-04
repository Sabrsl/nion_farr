import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiChevronLeft, FiEye, FiEyeOff } from 'react-icons/fi';

const Login: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Dans un vrai projet, nous appellerions l'API d'authentification ici
      console.log('Tentative de connexion avec:', { email, password, remember });
      
      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Rediriger vers le tableau de bord (dans un vrai projet, cela se ferait après authentification réussie)
      window.location.href = '/tableau-de-bord';
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrorMessage('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Pour ajouter un effet de glassmorphism au scroll
    const handleScroll = () => {
      const loginCard = document.getElementById('login-card');
      if (loginCard) {
        const scrollY = window.scrollY;
        const opacity = Math.min(0.85 + scrollY * 0.001, 0.95);
        loginCard.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-300 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
      </div>

      <Head>
        <title>Connexion | NionFar.sn</title>
        <meta name="description" content="Connectez-vous à votre compte NionFar pour accéder à vos services freelance." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="relative z-10 w-full px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-xl sm:text-2xl font-bold text-white hover:opacity-90 transition-opacity">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mr-2 text-white"
              >
                <FiChevronLeft className="inline-block" />
              </motion.span>
              <span>
                NionFar<span className="text-indigo-200">.sn</span>
              </span>
            </Link>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white"
          >
            Connectez-vous à votre compte
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-center text-sm sm:text-base text-indigo-100"
          >
            Ou{' '}
            <Link href="/register" className="font-medium text-white hover:text-indigo-200 transition-colors underline">
              créez un nouveau compte
            </Link>
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div 
            id="login-card"
            className="bg-white/85 backdrop-blur-xl py-6 sm:py-8 px-4 shadow-2xl rounded-xl sm:px-10 border border-white/20 transition-all duration-300 mx-auto w-full"
          >
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md p-3 sm:p-4 flex items-start"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                    placeholder="votre@email.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-150"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/mot-de-passe-oublie" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Mot de passe oublié?
                  </Link>
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

            <div className="mt-6 sm:mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="w-full inline-flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <svg className="h-5 w-5 mr-1 sm:mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                  <span className="truncate">Google</span>
                </a>

                <a
                  href="#"
                  className="w-full inline-flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <svg className="h-5 w-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">Facebook</span>
                </a>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas encore de compte?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Inscrivez-vous
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating features badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-md py-2 px-4 rounded-full shadow-lg text-xs text-gray-700 hidden sm:flex items-center"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        NionFar - La plateforme leader du freelancing au Sénégal
      </motion.div>
    </div>
  );
};

export default Login; 