import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiShoppingBag, 
  FiMessageSquare, 
  FiStar, 
  FiDollarSign, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiPlusCircle,
  FiBell,
  FiUser,
  FiChevronDown,
  FiArrowUp,
  FiPackage,
  FiCreditCard,
  FiHeart,
  FiFileText,
  FiActivity,
  FiAlertTriangle,
  FiBriefcase,
  FiAlertCircle,
  FiHelpCircle
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { authService } from '../../services/authService';
import { Avatar } from '../ui/Avatar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

// Définir l'interface pour les éléments de navigation
interface NavItem {
  name: string;
  href: string;
  icon: IconType;
  badge?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = 'Tableau de Bord | NionFar.sn',
  description
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Check initial
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path);
  };

  const navItems: NavItem[] = [
    { name: 'Tableau de bord', href: '/dashboard', icon: FiHome },
    { name: 'Mes commandes', href: '/dashboard/orders', icon: FiShoppingBag },
    { name: 'Mes services', href: '/dashboard/services', icon: FiBriefcase },
    { name: 'Messagerie', href: '/dashboard/messages', icon: FiMessageSquare, badge: 3 },
    { name: 'Évaluations', href: '/dashboard/reviews', icon: FiStar },
    { name: 'Litiges', href: '/dashboard/disputes', icon: FiAlertCircle, badge: 1 },
    { name: 'Mes gains', href: '/dashboard/earnings', icon: FiDollarSign },
    { name: 'Retrait', href: '/dashboard/earnings/withdraw', icon: FiCreditCard },
    { name: 'Paramètres', href: '/dashboard/settings', icon: FiSettings },
    { name: 'Support', href: '/dashboard/support', icon: FiHelpCircle },
  ];

  // Fonction de déconnexion
  const handleLogout = async () => {
    console.log('Tentative de déconnexion depuis DashboardLayout');
    try {
      await authService.logout();
      console.log('Déconnexion réussie, redirection...');
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Head>
        <title>{typeof title === 'string' ? title : 'Dashboard | Nionfar'}</title>
        <meta name="description" content={description || 'Tableau de bord Nionfar - Gérez vos services et commandes'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          .sidebar-transition {
            transition: width 0.4s ease-in-out, transform 0.4s ease-in-out;
          }
          
          .icon-transition {
            transition: all 0.3s ease-in-out;
          }
          
          .opacity-transition {
            transition: opacity 0.35s ease-in-out;
          }
        `}</style>
      </Head>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container with improved transitions */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 lg:static 
          sidebar-transition
          ${isMobile ? 'w-72' : 'w-16 group hover:w-72'} 
          lg:h-screen overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Actual sidebar content with fixed width - this slides inside the container */}
        <div className="h-full bg-white shadow-lg overflow-hidden w-full">
          <div className="flex items-center justify-between h-16 px-3 lg:px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                <span className="lg:group-hover:hidden">N<span className="text-violet-500">F</span></span>
                <span className="hidden lg:group-hover:inline opacity-transition">NionFar<span className="text-violet-500">.sn</span></span>
              </span>
            </Link>
            <button 
              className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-3 lg:p-4">
            {/* User info - simplified */}
            <div className="mb-6 mt-2">
              <div className="flex items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                </div>
                <div className="ml-3 lg:opacity-0 lg:group-hover:opacity-100 opacity-transition whitespace-nowrap overflow-hidden">
                  <p className="text-sm font-medium text-gray-900">Amadou Diop</p>
                  <p className="text-xs text-gray-500">Freelance - Niveau 2</p>
                </div>
              </div>

              {/* Balance card - only show on hover */}
              <div className="hidden lg:block lg:opacity-0 lg:group-hover:opacity-100 opacity-transition mt-4">
                <div className="flex items-center justify-between bg-indigo-50 p-2 rounded-lg">
                  <div className="text-sm">
                    <p className="text-gray-500 text-xs">Solde disponible</p>
                    <p className="font-semibold text-gray-900">120 000 FCFA</p>
                  </div>
                  <Link 
                    href="/dashboard/earnings/withdraw" 
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    Retirer →
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigation links - with improved spacing and transitions */}
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg py-2 text-sm font-medium icon-transition
                    ${isActive(item.href) 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="min-w-[40px] flex justify-center items-center">
                    <item.icon
                      className={`h-5 w-5 icon-transition
                        ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-500 group-hover:text-indigo-500'}`}
                    />
                  </div>
                  <span className="lg:opacity-0 lg:group-hover:opacity-100 opacity-transition whitespace-nowrap truncate">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="ml-auto bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Create service button - more compact */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                href="/dashboard/services/new"
                className="flex items-center rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <div className="min-w-[40px] flex justify-center items-center py-2">
                  <FiPlusCircle className="w-5 h-5" />
                </div>
                <span className="lg:opacity-0 lg:group-hover:opacity-100 opacity-transition whitespace-nowrap truncate pr-3 py-2">
                  Nouveau service
                </span>
              </Link>
            </div>
            
            {/* Logout button - at the bottom */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <a 
                href="/logout"
                className="flex items-center rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 icon-transition"
              >
                <div className="min-w-[40px] flex justify-center items-center">
                  <FiLogOut className="w-5 h-5 text-gray-500" />
                </div>
                <span className="lg:opacity-0 lg:group-hover:opacity-100 opacity-transition whitespace-nowrap truncate">
                  Déconnexion
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 bg-white border-b border-gray-200 shadow-sm md:px-6">
          <button
            className="p-1.5 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Logo au centre sur mobile */}
          <div className="lg:hidden flex items-center mx-auto absolute left-1/2 transform -translate-x-1/2">
            <span className="text-lg font-bold text-indigo-600">
              NionFar<span className="text-violet-500">.sn</span>
            </span>
          </div>

          <div className="flex items-center ml-auto space-x-3 sm:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                <FiBell className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <a href="#" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Nouvelle commande reçue</p>
                      <p className="text-xs text-gray-500">Conception de logo - il y a 2 heures</p>
                    </a>
                    <a href="#" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Message de Fatou Diallo</p>
                      <p className="text-xs text-gray-500">Bonjour, je voudrais savoir si... - il y a 5 heures</p>
                    </a>
                    <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Votre paiement est disponible</p>
                      <p className="text-xs text-gray-500">25,000 FCFA ajoutés à votre solde - il y a 1 jour</p>
                    </a>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <a href="/dashboard/notifications" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Voir toutes les notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 focus:outline-none"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">Amadou Diop</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mon profil
                  </Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Paramètres
                  </Link>
                  <Link href="/dashboard/services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mes services
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <a
                    href="/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </a>
                </div>
              )}
            </div>

            {/* Bouton flottant de retour en haut (mobile uniquement) */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-20 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors lg:hidden z-10"
              aria-label="Retour en haut"
            >
              <FiArrowUp className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 