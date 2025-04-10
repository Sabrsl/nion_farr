import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiShoppingBag, FiMessageSquare, FiRefreshCw, FiSearch, FiChevronDown, FiHelpCircle, FiLogIn, FiUserPlus } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import { Container } from '../ui/common';

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginPath, setLoginPath] = useState('/auth/login');
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
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

  // Gestion du défilement avec comportement de masquage/affichage
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Mettre à jour la position de défilement
    setScrollPosition(currentScrollY);
    
    // Gérer la visibilité du header
    if (currentScrollY < 150) {
      // Toujours visible en haut de la page
      setIsVisible(true);
    } else {
      // Masquer lors du défilement vers le bas, afficher lors du défilement vers le haut
      if (currentScrollY > lastScrollY.current + 10) {
        // Défilement vers le bas - masquer le header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Défilement vers le haut - afficher le header
        setIsVisible(true);
      }
    }
    
    // Mettre à jour la position de référence
    lastScrollY.current = currentScrollY;
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fermer les menus lors d'un changement de route
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsSearchOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Fermer les menus lors d'un clic à l'extérieur
  useEffect(() => {
    if (!isUserMenuOpen && !isMenuOpen && !isSearchOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Gestion du menu utilisateur
      if (isUserMenuOpen && !target.closest('#user-menu-button') && !target.closest('#user-menu-dropdown')) {
        setIsUserMenuOpen(false);
      }
      
      // Gestion du menu mobile
      if (isMenuOpen && !target.closest('#mobile-menu-button') && !target.closest('#mobile-menu')) {
        setIsMenuOpen(false);
      }
      
      // Gestion de la recherche
      if (isSearchOpen && !target.closest('#search-container') && !target.closest('#search-button')) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen, isMenuOpen, isSearchOpen]);

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
  
  // Gestion de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorer?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  // Calculer les classes CSS - toujours la même couleur même lors du défilement
  const headerClasses = 'bg-gradient-to-r from-indigo-900 to-purple-900 backdrop-blur-sm';
  
  // Texte blanc pour tous les éléments, peu importe le défilement
  const textColorClass = 'text-white';
  
  const navLinkBaseClass = 'text-white';
  
  const navLinkActiveClass = 'text-indigo-200';

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${headerClasses} transform ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Logo - placé à l'extrémité gauche avec alignement précis */}
          <div className="flex-none">
            <Link href="/" className="flex items-center group">
              <span className={`text-2xl font-bold transition-colors duration-300 ${textColorClass} group-hover:text-indigo-200`}>
                NionFar<span className="text-indigo-200 group-hover:text-indigo-300">.sn</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop & Mobile Actions - alignement précis à droite */}
          <div className="flex items-center space-x-4 lg:space-x-6">            
            {/* Bouton "Tableau de bord" sur desktop / "Devenir vendeur" pour visiteurs */}
            {isAuthenticated && user ? (
              <Link 
                href={user.role === 'freelance' ? "/dashboard/freelance" : user.role === 'client' ? "/dashboard/client" : "/dashboard/admin"}
                className="hidden sm:inline-flex items-center justify-center text-sm font-medium h-9 px-5 transition-all duration-300 bg-white/20 text-white rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transform hover:bg-white/30 border border-white/40"
              >
                Tableau de bord
              </Link>
            ) : (
              <Link 
                href="/devenir-freelance"
                className="inline-flex items-center justify-center text-xs sm:text-sm font-medium h-8 sm:h-9 px-3 sm:px-5 transition-all duration-300 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transform hover:from-orange-600 hover:to-pink-600 border border-white/20"
              >
                Devenir vendeur
              </Link>
            )}
            
            {/* Menu utilisateur unifié: adapté à l'état d'authentification */}
            <div className="relative">
              <button
                id="user-menu-button"
                className={`flex items-center justify-center focus:outline-none ${
                  isAuthenticated && user 
                    ? 'h-10 space-x-2' 
                    : 'h-9 w-9 rounded-full bg-white/30 hover:bg-white/40 border border-white/40 backdrop-blur-sm z-10'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                aria-label={isAuthenticated ? "Menu utilisateur" : "Menu d'authentification"}
              >
                {isAuthenticated && user ? (
                  <>
                    <Avatar
                      src={(user as any).avatar}
                      alt={(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                      size="sm"
                    />
                    <span className="hidden sm:inline text-sm font-medium text-white">
                      {(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                    </span>
                    {user.role && (
                      <span className="hidden sm:flex items-center justify-center h-5 px-2 ml-1 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/30 backdrop-blur-sm">
                        {user.role === 'freelance' ? 'Freelancer' : 
                         user.role === 'client' ? 'Client' : 
                         user.role === 'admin' ? 'Admin' : 
                         'Membre'}
                      </span>
                    )}
                    <FiChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''} text-white`} />
                  </>
                ) : (
                  <FiUser className="w-4.5 h-4.5 text-white" />
                )}
              </button>
              
              {/* Menu déroulant adapté à l'état d'authentification */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    id="user-menu-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 ${
                      isAuthenticated && user ? 'w-64' : 'w-48'
                    }`}
                  >
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                            </p>
                            {user.role && (
                              <span className="inline-flex items-center justify-center h-5 px-2 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                {user.role === 'freelance' ? 'Freelancer' : 
                                 user.role === 'client' ? 'Client' : 
                                 user.role === 'admin' ? 'Admin' : 
                                 'Membre'}
                              </span>
                            )}
                          </div>
                          {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                        </div>
                        
                        <div className="py-1">
                          {user.role === 'freelance' && (
                            <Link
                              href="/dashboard/freelance"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <FiUser className="mr-2 h-4 w-4 text-indigo-400" />
                              Tableau de bord
                            </Link>
                          )}
                          {user.role === 'client' && (
                            <Link
                              href="/dashboard/client"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <FiUser className="mr-2 h-4 w-4 text-indigo-400" />
                              Tableau de bord
                            </Link>
                          )}
                          {user.role === 'admin' && (
                            <Link
                              href="/dashboard/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <FiUser className="mr-2 h-4 w-4 text-indigo-400" />
                              Administration
                            </Link>
                          )}
                          
                          <Link
                            href="/messages"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiMessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
                            Messagerie
                          </Link>
                          
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiSettings className="mr-2 h-4 w-4 text-indigo-400" />
                            Paramètres
                          </Link>
                          
                          <hr className="my-1 border-gray-100" />
                          
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                          >
                            <FiLogOut className="mr-2 h-4 w-4 text-red-500" />
                            Déconnexion
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link
                          href={loginPath}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiLogIn className="mr-2 h-4 w-4 text-indigo-400" />
                          Connexion
                        </Link>
                        
                        <Link
                          href="/auth/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiUserPlus className="mr-2 h-4 w-4 text-indigo-400" />
                          Inscription
                        </Link>
                        
                        <hr className="my-1 border-gray-100" />
                        
                        <Link
                          href="/aide"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiHelpCircle className="mr-2 h-4 w-4 text-indigo-400" />
                          Aide
                        </Link>
                        
                        <Link
                          href="/contact"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiMessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
                          Contact
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile menu button - alignement précis */}
            <button
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-full text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm"
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Container>
      
      {/* Mobile menu - largeur complète et bien aligné */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity:.0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg w-full"
          >
            <Container>
              <div className="pt-4 pb-6 space-y-4">
                <form onSubmit={handleSearch} className="flex mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des services..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                </form>
                
                {/* Bouton Devenir vendeur pour mobile - Uniquement pour visiteurs non connectés */}
                {!isAuthenticated && (
                  <div className="mb-4">
                    <Link
                      href="/devenir-freelance"
                      className="block w-full py-2 px-4 text-center font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-pink-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Devenir vendeur
                    </Link>
                  </div>
                )}
                
                {isAuthenticated && user ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                      <Avatar
                        src={(user as any).avatar}
                        alt={(user as any).firstName || (user as any).username || (user.email || 'Utilisateur')}
                        size="sm"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {(user as any).firstName || (user as any).username || 'Utilisateur'}
                        </p>
                        {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                      </div>
                    </div>
                    
                    {user.role === 'freelance' && (
                      <Link
                        href="/dashboard/freelance"
                        className="block py-2 text-base font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                    )}
                    {user.role === 'client' && (
                      <Link
                        href="/dashboard/client"
                        className="block py-2 text-base font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        href="/dashboard/admin"
                        className="block py-2 text-base font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    
                    <Link
                      href="/messages"
                      className="block py-2 text-base font-medium text-gray-900 hover:text-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Messagerie
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="block py-2 text-base font-medium text-gray-900 hover:text-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Paramètres
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left py-2 text-base font-medium text-red-600"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex py-2 items-center">
                      <FiUser className="h-5 w-5 text-indigo-500 mr-3" />
                      <p className="text-lg font-medium text-gray-900">Compte</p>
                    </div>
                    
                    <Link
                      href={loginPath}
                      className="flex items-center py-2 text-base text-gray-700 hover:text-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiLogIn className="mr-3 h-5 w-5 text-indigo-400" />
                      Connexion
                    </Link>
                    
                    <Link
                      href="/auth/register"
                      className="flex items-center py-2 text-base text-gray-700 hover:text-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUserPlus className="mr-3 h-5 w-5 text-indigo-400" />
                      Inscription
                    </Link>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <Link
                        href="/aide"
                        className="flex items-center py-2 text-base text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiHelpCircle className="mr-3 h-5 w-5 text-indigo-400" />
                        Aide
                      </Link>
                      
                      <Link
                        href="/contact"
                        className="flex items-center py-2 text-base text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiMessageSquare className="mr-3 h-5 w-5 text-indigo-400" />
                        Contact
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 