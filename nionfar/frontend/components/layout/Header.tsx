import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Vérifier si le lien est actif
  const isActive = (path: string) => {
    return router.pathname === path || router.asPath.startsWith(path);
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
            <Link 
              href="/login" 
              className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
            >
              Connexion
            </Link>
            <Link 
              href={isActive('/devenir-freelance') ? "/register?type=freelance" : "/register"} 
              className={`${
                scrollPosition > 50 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-indigo-600'
              } text-sm font-medium px-5 py-2.5 rounded-full hover:bg-indigo-700 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/25 relative z-20`}
            >
              Inscription
            </Link>
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
            <Link href="/explorer" className={`block px-3 py-2 rounded-lg ${isActive('/explorer') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              Explorer
            </Link>
            <Link href="/comment-ca-marche" className={`block px-3 py-2 rounded-lg ${isActive('/comment-ca-marche') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              Comment ça marche
            </Link>
            <Link href="/devenir-freelance" className={`block px-3 py-2 rounded-lg ${isActive('/devenir-freelance') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              Devenir freelance
            </Link>
            <Link href="/contact" className={`block px-3 py-2 rounded-lg ${isActive('/contact') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              Contact
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link href="/login" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Connexion
              </Link>
              <Link href={isActive('/devenir-freelance') ? "/register?type=freelance" : "/register"} className="block px-3 py-2 mt-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 