import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiMessageSquare,
  FiAlertTriangle,
  FiDollarSign,
  FiCheckSquare
} from 'react-icons/fi/index.js';

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * Combine plusieurs classes CSS conditionnelles en une seule chaîne
 */
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Mise en page pour les pages d'administration
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: FiHome },
    { name: 'Utilisateurs', href: '/admin/users', icon: FiUsers },
    { name: 'Services', href: '/admin/services', icon: FiShoppingBag },
    { name: 'Validation Services', href: '/admin/service-validation', icon: FiCheckSquare },
    { name: 'Commandes', href: '/admin/orders', icon: FiClock },
    { name: 'Messages', href: '/admin/messages', icon: FiMessageSquare },
    { name: 'Rapports', href: '/admin/reports', icon: FiBarChart2 },
    { name: 'Finances', href: '/admin/finance', icon: FiDollarSign },
    { name: 'Litiges', href: '/admin/disputes', icon: FiAlertTriangle },
    { name: 'Performances', href: '/admin/performance', icon: FiBarChart2 },
    { name: 'Paramètres', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        className={classNames(
          sidebarOpen ? 'fixed inset-0 flex z-40 md:hidden' : 'hidden',
        )}
        aria-modal="true"
      >
        <div
          className={classNames(
            sidebarOpen ? 'fixed inset-0 bg-gray-600 bg-opacity-75' : 'hidden',
          )}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-indigo-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer la navigation</span>
              <FiX className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-white text-xl font-semibold">NionFar Admin</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={classNames(
                    router.pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600',
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                  )}
                >
                  <item.icon 
                    className={classNames(
                      router.pathname === item.href
                        ? 'text-indigo-100'
                        : 'text-indigo-300 group-hover:text-indigo-100',
                      'mr-4 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">Admin NionFar</p>
                  <p className="text-sm font-medium text-indigo-200 group-hover:text-white">
                    Se déconnecter
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-700">
              <span className="text-white text-xl font-semibold">NionFar Admin</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-indigo-700 space-y-1">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={classNames(
                      router.pathname === item.href
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon 
                      className={classNames(
                        router.pathname === item.href
                          ? 'text-indigo-100'
                          : 'text-indigo-300 group-hover:text-indigo-100',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4 bg-indigo-700">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      A
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Admin NionFar</p>
                    <a 
                      href="#" 
                      className="text-xs font-medium text-indigo-200 group-hover:text-white flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        // Action de déconnexion
                      }}
                    >
                      <FiLogOut className="mr-1 h-4 w-4" />
                      Se déconnecter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la navigation</span>
            <FiMenu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Panneau d'administration
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Voir les notifications</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              
              <button
                type="button"
                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Aide</span>
                <FiHelpCircle className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 