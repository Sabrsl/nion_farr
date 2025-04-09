import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiShoppingBag, 
  FiMessageSquare, 
  FiStar, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiBell,
  FiUser,
  FiChevronDown,
  FiCreditCard,
  FiFileText,
  FiAlertTriangle,
  FiHelpCircle,
  FiBriefcase,
  FiDollarSign,
  FiPlusCircle
} from 'react-icons/fi/index.js';
import { IconType } from 'react-icons';
import { authService } from '../../services/authService';

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
  badge?: number;
}

interface FreelanceDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const FreelanceDashboardLayout: React.FC<FreelanceDashboardLayoutProps> = ({ 
  children, 
  title = 'Tableau de Bord Freelance | NionFar.sn'
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

  // Navigation pour le freelance
  const navItems: NavItem[] = [
    { name: 'Tableau de bord', href: '/dashboard/freelance', icon: FiHome },
    { name: 'Mes commandes', href: '/dashboard/freelance/orders', icon: FiShoppingBag, badge: 2 },
    { name: 'Mes services', href: '/dashboard/freelance/services', icon: FiBriefcase },
    { name: 'Messagerie', href: '/dashboard/freelance/messages', icon: FiMessageSquare, badge: 3 },
    { name: 'Mes avis', href: '/dashboard/freelance/reviews', icon: FiStar },
    { name: 'Litiges', href: '/dashboard/freelance/disputes', icon: FiAlertTriangle },
    { name: 'Mes gains', href: '/dashboard/freelance/earnings', icon: FiDollarSign },
    { name: 'Retrait', href: '/dashboard/freelance/withdraw', icon: FiCreditCard },
    { name: 'Profil', href: '/dashboard/freelance/profile', icon: FiUser },
    { name: 'Paramètres', href: '/dashboard/freelance/settings', icon: FiSettings },
    { name: 'Centre d\'aide', href: '/dashboard/freelance/support', icon: FiHelpCircle },
  ];

  return (
    <div className="min-h-screen flex">
      <Head>
        <title>{title}</title>
      </Head>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 lg:relative
          ${isMobile ? 'w-72' : 'w-16 group hover:w-72'} 
          flex-shrink-0 bg-white shadow-lg
          ${sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex items-center h-16 px-3 lg:px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">
              <span className="lg:group-hover:hidden">N<span className="text-violet-500">F</span></span>
              <span className="hidden lg:group-hover:inline">NionFar<span className="text-violet-500">.sn</span></span>
            </span>
          </Link>
          <button 
            className="ml-auto p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="py-4 px-3 lg:px-4 h-[calc(100%-4rem)] overflow-y-auto">
          {/* User info - simplified */}
          <div className="mb-6 mt-2">
            <div className="flex items-center">
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              </div>
              <div className="ml-3 lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                <p className="text-sm font-medium text-gray-900">Amadou Diop</p>
                <p className="text-xs text-gray-500">Freelance - Niveau 2</p>
              </div>
            </div>

            {/* Informations sur les revenus */}
            <div className="hidden lg:block lg:opacity-0 lg:group-hover:opacity-100 mt-4">
              <div className="flex items-center justify-between bg-indigo-50 p-2 rounded-lg">
                <div className="text-sm">
                  <p className="text-gray-500 text-xs">Solde disponible</p>
                  <p className="font-semibold text-gray-900">120 000 FCFA</p>
                </div>
                <Link 
                  href="/dashboard/freelance/withdraw" 
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Retirer →
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-lg py-2 text-sm font-medium
                  ${isActive(item.href) 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="min-w-[40px] flex justify-center items-center">
                  <item.icon
                    className={`h-5 w-5
                      ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-500 group-hover:text-indigo-500'}`}
                  />
                </div>
                <span className="lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap truncate">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="ml-auto mr-4 lg:mr-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bouton pour ajouter un nouveau service */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/dashboard/freelance/services/new"
              className="flex items-center rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <div className="min-w-[40px] flex justify-center items-center py-2">
                <FiPlusCircle className="w-5 h-5" />
              </div>
              <span className="lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap truncate pr-3 py-2">
                Nouveau service
              </span>
            </Link>
          </div>
          
          {/* Logout button */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              className="group flex items-center rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
              onClick={() => {
                router.push('/logout');
              }}
            >
              <div className="min-w-[40px] flex justify-center items-center">
                <FiLogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500" />
              </div>
              <span className="lg:opacity-0 lg:group-hover:opacity-100">
                Déconnexion
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="bg-white flex items-center justify-between h-16 border-b border-gray-200 px-4">
          <div className="lg:hidden">
            <button
              type="button"
              className="text-gray-700 p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <div className="relative">
              <button
                className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Nouvelle commande reçue</p>
                      <p className="text-xs text-gray-500 mt-1">Logo professionnel - il y a 2 heures</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Message reçu de Fatou Diallo</p>
                      <p className="text-xs text-gray-500 mt-1">Site web e-commerce - il y a 5 heures</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Nouvel avis reçu</p>
                      <p className="text-xs text-gray-500 mt-1">5 étoiles pour votre service de design logo - il y a 1 jour</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <Link href="/dashboard/freelance/notifications" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-sm rounded-full focus:outline-none"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <span className="sr-only">Ouvrir le menu utilisateur</span>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FiUser className="h-5 w-5" />
                </div>
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Amadou Diop</p>
                    <p className="text-xs text-gray-500 mt-1">amadou.diop@example.com</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/freelance/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </Link>
                    <Link href="/dashboard/freelance/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </Link>
                    <Link href="/dashboard/freelance/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Aide et support
                    </Link>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        router.push('/logout');
                      }}
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default FreelanceDashboardLayout; 