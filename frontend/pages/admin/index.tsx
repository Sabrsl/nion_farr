import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/layouts/AdminLayout';
import Head from 'next/head';
import { FiUsers, FiShoppingBag, FiAlertTriangle, FiBarChart2, FiServer, FiClock } from 'react-icons/fi/index.js';
import { classNames } from '../../utils/helpers';

/**
 * Page principale du tableau de bord d'administration
 */
const AdminDashboardPage: NextPage = () => {
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, active: 0, pending: 0 },
    services: { total: 0, active: 0, pending: 0, reported: 0 },
    orders: { total: 0, active: 0, completed: 0, disputed: 0 },
    revenue: { total: 0, pending: 0, lastMonth: 0, growth: 0 },
    system: { status: 'healthy', uptime: '99.8%', issues: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulation du chargement des données
    const fetchData = async () => {
      // Dans un cas réel, on chargerait les données depuis l'API
      // const response = await fetch('/api/admin/dashboard');
      // const data = await response.json();
      
      // Données fictives pour le moment
      setTimeout(() => {
        setStats({
          users: { total: 1250, new: 47, active: 890, pending: 23 },
          services: { total: 485, active: 320, pending: 85, reported: 12 },
          orders: { total: 1876, active: 234, completed: 1520, disputed: 32 },
          revenue: { total: 15750000, pending: 2340000, lastMonth: 3420000, growth: 12.4 },
          system: { status: 'healthy', uptime: '99.8%', issues: 2 }
        });
        setLoading(false);
      }, 800);
    };
    
    fetchData();
  }, []);
  
  // Mise en forme de la monnaie en FCFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Tableau de bord | Admin NionFar</title>
      </Head>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            <div className="flex space-x-3">
              <select className="rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter" selected>Ce trimestre</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Exporter
              </button>
            </div>
          </div>
          
          {/* Cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-indigo-50">
                  <FiUsers className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-sm font-medium text-gray-500">Utilisateurs</h2>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.users.total}
                    </p>
                    <p className="ml-2 text-sm font-medium text-green-600">
                      +{stats.users.new} <span className="text-gray-500">nouveaux</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Actifs</span>
                  <span className="font-medium text-gray-900">{stats.users.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${(stats.users.active / stats.users.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-blue-50">
                  <FiShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-sm font-medium text-gray-500">Services</h2>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.services.total}
                    </p>
                    <p className="ml-2 text-sm font-medium text-yellow-600">
                      {stats.services.pending} <span className="text-gray-500">en attente</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Actifs</span>
                  <span className="font-medium text-gray-900">{stats.services.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${(stats.services.active / stats.services.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-green-50">
                  <FiClock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-sm font-medium text-gray-500">Commandes</h2>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.orders.total}
                    </p>
                    <p className="ml-2 text-sm font-medium text-orange-600">
                      {stats.orders.active} <span className="text-gray-500">en cours</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Complétées</span>
                  <span className="font-medium text-gray-900">{stats.orders.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: `${(stats.orders.completed / stats.orders.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-purple-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-sm font-medium text-gray-500">Revenus</h2>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.revenue.total)}
                    </p>
                    <p className="ml-2 text-sm font-medium text-green-600">
                      +{stats.revenue.growth}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ce mois</span>
                  <span className="font-medium text-gray-900">{formatCurrency(stats.revenue.lastMonth)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full"
                    style={{ width: `${(stats.revenue.lastMonth / (stats.revenue.total / 4)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Graphiques & données supplémentaires */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aperçu des revenus */}
            <div className="bg-white rounded-lg shadow col-span-2">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Aperçu des revenus</h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Graphique de revenus - Implémentation en attente</p>
                    <p className="text-sm">Intégration avec Chart.js ou Recharts recommandée</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alertes système */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">État du système</h3>
                <span className={classNames(
                  stats.system.status === 'healthy' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                  "px-2.5 py-0.5 rounded-full text-xs font-medium"
                )}>
                  {stats.system.status === 'healthy' ? 'Opérationnel' : 'Problèmes détectés'}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={classNames(
                      stats.system.status === 'healthy' ? "bg-green-500" : "bg-red-500",
                      "h-3 w-3 rounded-full mr-2"
                    )}></div>
                    <span className="text-sm text-gray-700">API</span>
                  </div>
                  <span className="text-sm font-medium">{stats.system.uptime}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Base de données</span>
                  </div>
                  <span className="text-sm font-medium">100%</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Stockage</span>
                  </div>
                  <span className="text-sm font-medium">98.9%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Paiements</span>
                  </div>
                  <span className="text-sm font-medium">100%</span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a href="/admin/system" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Voir les détails du système →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activités récentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Activités récentes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                    <p className="text-sm text-gray-500">Il y a 15 min</p>
                  </div>
                  <p className="text-sm text-gray-500">Amadou D. a créé un compte freelance</p>
                </div>
              </div>
              
              <div className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                    <FiShoppingBag className="h-5 w-5 text-green-600" />
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Nouveau service créé</p>
                    <p className="text-sm text-gray-500">Il y a 42 min</p>
                  </div>
                  <p className="text-sm text-gray-500">Création de logo pour entreprise - 35 000 FCFA</p>
                </div>
              </div>
              
              <div className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Paiement reçu</p>
                    <p className="text-sm text-gray-500">Il y a 1h</p>
                  </div>
                  <p className="text-sm text-gray-500">Commande #12458 - 75 000 FCFA</p>
                </div>
              </div>
              
              <div className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                    <FiAlertTriangle className="h-5 w-5 text-red-600" />
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Nouveau litige ouvert</p>
                    <p className="text-sm text-gray-500">Il y a 2h</p>
                  </div>
                  <p className="text-sm text-gray-500">Litige sur la commande #12445 - En attente de révision</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <a href="/admin/activities" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Voir toutes les activités →
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage; 