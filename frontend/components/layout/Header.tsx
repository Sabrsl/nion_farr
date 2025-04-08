import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiShoppingBag, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loginPath, setLoginPath] = useState('/auth/login');
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshAuthState } = useAuth();

  // Effet spécifique pour forcer le rafraîchissement après une connexion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier l'URL pour le paramètre forceReload
      const hasForceReload = window.location.search.includes('forceReload=true');
      
      if (hasForceReload) {
        console.log('Header: Détection d\'un rechargement forcé après connexion');
        
        // Forcer un rafraîchissement immédiat de l'état
        refreshAuthState?.();
        
        // Forcer plusieurs rafraîchissements pour s'assurer de la mise à jour
        setTimeout(() => refreshAuthState?.(), 100);
        setTimeout(() => refreshAuthState?.(), 500);
        
        // Nettoyage de l'URL (optionnel)
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [refreshAuthState]);

  // Rafraîchir l'état d'authentification au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshAuthState?.();
    }
  }, [refreshAuthState]);

  // Rafraîchir l'état d'authentification à chaque changement d'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshAuthState?.();
    }
  }, [router.asPath, refreshAuthState]);

  // Créer un lien de connexion dynamique qui inclut la page actuelle comme redirect
  useEffect(() => {
    // Ne s'exécute que côté client et après initialisation du router
    if (typeof window !== 'undefined' && router.isReady) {
      // Capture exacte du chemin actuel via router
      const currentPath = router.asPath;
      
      // Ne pas ajouter de redirection pour les pages d'authentification
      if (currentPath.includes('/auth/') || currentPath.includes('/logout')) {
        setLoginPath('/auth/login');
        return;
      }
      
      // Sécurité : vérifier que le chemin n'est pas vide
      if (!currentPath || currentPath === '/') {
        setLoginPath('/auth/login?redirect=%2F');
        return;
      }
      
      // Créer l'URL de connexion avec redirection
      setLoginPath(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [router.asPath, router.isReady]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors d'un changement de route
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Fermer le menu utilisateur lors d'un clic à l'extérieur
  useEffect(() => {
    if (!isUserMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-menu-button') && !target.closest('#user-menu-dropdown')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  // Vérifier si le lien est actif
  const isActive = (path: string) => {
    return router.pathname === path || router.asPath.startsWith(path);
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    console.log('Déconnexion en cours...');
    try {
      // D'abord essayer de nettoyer les données locales
      if (logout) {
        await logout();
      } else {
        // Sinon, nettoyer manuellement
        localStorage.removeItem('nionfarUser');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      
      // Redirection forcée - c'est ce qui manquait
      console.log('Redirection directe vers la page d\'accueil');
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, essayer de rediriger
      window.location.href = '/';
    }
  };

  // Fonction pour forcer le rafraîchissement de l'état d'authentification
  const handleRefreshAuth = () => {
    refreshAuthState?.();
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrollPosition > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold ${
              scrollPosition > 50 
                ? 'text-indigo-600' 
                : 'text-white'
            }`}>
              NionFar<span className={`${scrollPosition > 50 ? 'text-violet-500' : 'text-indigo-300'}`}>.sn</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link 
              href="/explorer" 
              className={`text-sm font-medium ${
                isActive('/explorer')
                  ? scrollPosition > 50 ? 'text-indigo-600' : 'text-indigo-300'
                  : scrollPosition > 50 ? 'text-gray-800' : 'text-white'
              } hover:text-indigo-500 transition-colors`}
            >
              Explorer
            </Link>
            <Link 
              href="/comment-ca-marche" 
              className={`text-sm font-medium ${
                isActive('/comment-ca-marche')
                  ? scrollPosition > 50 ? 'text-indigo-600' : 'text-indigo-300'
                  : scrollPosition > 50 ? 'text-gray-800' : 'text-white'
              } hover:text-indigo-500 transition-colors`}
            >
              Comment ça marche
            </Link>
            <Link 
              href="/devenir-freelance" 
              className={`text-sm font-medium ${
                isActive('/devenir-freelance')
                  ? scrollPosition > 50 ? 'text-indigo-600' : 'text-indigo-300'
                  : scrollPosition > 50 ? 'text-gray-800' : 'text-white'
              } hover:text-indigo-500 transition-colors`}
            >
              Devenir freelance
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium ${
                isActive('/contact')
                  ? scrollPosition > 50 ? 'text-indigo-600' : 'text-indigo-300'
                  : scrollPosition > 50 ? 'text-gray-800' : 'text-white'
              } hover:text-indigo-500 transition-colors`}
            >
              Contact
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-6 relative z-10">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="user-menu-button"
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <Avatar
                    src={(user as any).avatar}
                    alt={(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                    size="sm"
                  />
                  <span className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'}`}>
                    {(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                  </span>
                </button>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div
                    id="user-menu-dropdown"
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}</p>
                      {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                    </div>
                    {user.role === 'freelance' && (
                      <Link
                        href="/dashboard/freelance"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiUser className="mr-2 h-4 w-4 text-indigo-400" />
                        Tableau de bord
                      </Link>
                    )}
                    {user.role === 'client' && (
                      <Link
                        href="/dashboard/client"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiUser className="mr-2 h-4 w-4 text-indigo-400" />
                        Tableau de bord
                      </Link>
                    )}
                    <Link
                      href="/dashboard/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiShoppingBag className="mr-2 h-4 w-4 text-indigo-400" />
                      Mes commandes
                    </Link>
                    <Link
                      href="/dashboard/messages"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiMessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
                      Messages
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings className="mr-2 h-4 w-4 text-indigo-400" />
                      Paramètres
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href={loginPath}
                  className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/register" 
                  className={`${
                    scrollPosition > 50 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-indigo-600'
                  } text-sm font-medium px-5 py-2.5 rounded-full hover:bg-indigo-700 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/25 relative z-20`}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <FiX className={`w-6 h-6 ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'}`} />
            ) : (
              <FiMenu className={`w-6 h-6 ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/explorer" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              Explorer
            </Link>
            <Link href="/comment-ca-marche" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              Comment ça marche
            </Link>
            <Link href="/devenir-freelance" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              Devenir freelance
            </Link>
            <Link href="/contact" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              Contact
            </Link>
            
            {isAuthenticated && user ? (
              <div className="pt-4 mt-4 border-t border-gray-100">
                {user.role === 'freelance' && (
                  <Link href="/dashboard/freelance" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Tableau de bord
                  </Link>
                )}
                {user.role === 'client' && (
                  <Link href="/dashboard/client" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Tableau de bord
                  </Link>
                )}
                <Link href="/dashboard/orders" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Mes commandes
                </Link>
                <Link href="/dashboard/messages" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Messages
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link href={loginPath} className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Connexion
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 mt-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 