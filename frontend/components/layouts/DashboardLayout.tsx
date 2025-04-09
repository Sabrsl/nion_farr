import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiShoppingBag, 
  FiDollarSign, 
  FiSettings, 
  FiClock, 
  FiMessageSquare, 
  FiAlertTriangle, 
  FiMenu, 
  FiX, 
  FiUser,
  FiLogOut
} from 'react-icons/fi/index.js';
import { useAuth } from '../../contexts/AuthContext';
import { classNames } from '../../utils/helpers';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: FiHome },
    { name: 'Services', href: '/dashboard/services', icon: FiShoppingBag },
    { name: 'Commandes', href: '/dashboard/orders', icon: FiClock },
    { name: 'Messages', href: '/dashboard/messages', icon: FiMessageSquare },
    { name: 'Litiges', href: '/dashboard/disputes', icon: FiAlertTriangle },
    { name: 'Revenus', href: '/dashboard/earnings', icon: FiDollarSign },
    { name: 'Profil', href: '/dashboard/profile', icon: FiUser },
    { name: 'Paramètres', href: '/dashboard/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    console.log('Tentative de déconnexion depuis layouts/DashboardLayout');
    try {
      await router.push('/logout');
      console.log('Redirection vers logout réussie');
    } catch (error) {
      console.error('Erreur lors de la redirection vers logout:', error);
    }
  };

  const isActive = (path: string): boolean => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={classNames(
            "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={classNames(
          "relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700 transition ease-in-out duration-300 transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/" className="text-white text-2xl font-bold cursor-pointer">
                Nionfar
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={classNames(
                    isActive(item.href)
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600',
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer'
                  )}
                >
                  <item.icon className="mr-4 h-6 w-6 text-indigo-300" />
                  {item.name}
                </Link>
              ))}
              <a 
                href="/logout" 
                className="text-white hover:bg-indigo-600 group flex items-center px-2 py-2 text-base font-medium rounded-md w-full"
              >
                <FiLogOut className="mr-4 h-6 w-6 text-indigo-300" />
                Déconnexion
              </a>
            </nav>
          </div>
          
          {user && (
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user.name || 'Utilisateur'}</p>
                  <p className="text-sm font-medium text-indigo-200">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/" className="text-white text-2xl font-bold cursor-pointer">
                Nionfar
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={classNames(
                    isActive(item.href)
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 text-indigo-300" />
                  {item.name}
                </Link>
              ))}
              <a 
                href="/logout" 
                className="text-white hover:bg-indigo-600 group flex items-center px-2 py-2 text-base font-medium rounded-md w-full"
              >
                <FiLogOut className="mr-3 h-5 w-5 text-indigo-300" />
                Déconnexion
              </a>
            </nav>
          </div>
          
          {user && (
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name || 'Utilisateur'}</p>
                  <p className="text-xs font-medium text-indigo-200">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="md:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 