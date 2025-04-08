import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Dispute } from '../../../types';
import { 
  FiAlertTriangle, 
  FiSearch, 
  FiFilter, 
  FiX,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiArrowRight,
  FiHome,
  FiFileText,
  FiShoppingBag
} from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { motion } from 'framer-motion';
import Head from 'next/head';
import DisputeList from '../../../components/dashboard/DisputeList';

const DisputesPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/disputes');
      return;
    }

    const fetchDisputes = async () => {
      setLoading(true);
      try {
        // En production, remplacer par un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockDisputes: Dispute[] = [
          {
            id: 'DSP-001',
            orderId: 'order-1',
            initiatedBy: 'client-1',
            reason: 'Livraison non conforme',
            details: 'Le logo livré ne correspond pas aux couleurs demandées.',
            attachments: [],
            status: 'ouvert',
            createdAt: '2023-09-10T15:30:00Z',
            updates: [
              {
                userId: 'client-1',
                message: 'Litige ouvert',
                createdAt: '2023-09-10T15:30:00Z',
                type: 'status_change'
              }
            ]
          },
          {
            id: 'DSP-002',
            orderId: 'order-2',
            initiatedBy: 'seller-2',
            reason: 'Client non coopératif',
            details: 'Le client refuse de fournir les informations nécessaires pour terminer le projet.',
            attachments: [],
            status: 'ouvert',
            createdAt: '2023-09-09T12:15:00Z',
            updates: [
              {
                userId: 'seller-2',
                message: 'Litige ouvert',
                createdAt: '2023-09-09T12:15:00Z',
                type: 'status_change'
              }
            ]
          },
          {
            id: 'DSP-003',
            orderId: 'order-3',
            initiatedBy: 'client-3',
            reason: 'Retard excessif',
            details: 'La date limite de livraison est dépassée de 15 jours.',
            attachments: [],
            status: 'résolu_en_faveur_client',
            createdAt: '2023-09-05T09:45:00Z',
            resolvedAt: '2023-09-08T14:20:00Z',
            resolvedBy: 'admin-1',
            resolution: 'remboursement_total',
            updates: [
              {
                userId: 'client-3',
                message: 'Litige ouvert',
                createdAt: '2023-09-05T09:45:00Z',
                type: 'status_change'
              },
              {
                userId: 'admin-1',
                message: 'Litige résolu en faveur du client: Le retard est effectivement excessif et non justifié.',
                createdAt: '2023-09-08T14:20:00Z',
                type: 'resolution'
              }
            ]
          }
        ];
        
        setDisputes(mockDisputes);
      } catch (err) {
        console.error('Erreur lors du chargement des litiges:', err);
        setError('Impossible de charger la liste des litiges.');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [user, authLoading, router]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays === 1) return 'Hier';
      return `Il y a ${diffDays} jours`;
    } catch (e) {
      return '';
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'open') return dispute.status === 'ouvert';
    if (statusFilter === 'resolved') return dispute.status.startsWith('résolu_');
    return true;
  });

  const openDisputesCount = disputes.filter(d => d.status === 'ouvert').length;
  const recentlyResolvedCount = disputes.filter(d => 
    d.status.startsWith('résolu_') && 
    new Date(d.resolvedAt!).getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000
  ).length;

  // Calculate average resolution time in days
  const calculateAvgResolutionTime = () => {
    const resolvedDisputes = disputes.filter(d => d.status.startsWith('résolu_'));
    if (resolvedDisputes.length === 0) return 'N/A';
    
    const totalDays = resolvedDisputes.reduce((acc, dispute) => {
      const created = new Date(dispute.createdAt);
      const resolved = new Date(dispute.resolvedAt!);
      const diffTime = Math.abs(resolved.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    
    return (totalDays / resolvedDisputes.length).toFixed(1) + ' jours';
  };

  // Filtrer les litiges en fonction du statut et du terme de recherche
  const filteredDisputesBySearch = filteredDisputes.filter(dispute => {
    const matchesSearch = searchTerm === '' || 
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Statistiques sur les litiges
  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'ouvert').length,
    resolved: disputes.filter(d => d.status.startsWith('résolu_')).length,
    recentlyResolved: disputes.filter(d => 
      d.status.startsWith('résolu_') && 
      new Date(d.resolvedAt as string) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    avgResolutionTime: "48 heures" // Calculé normalement à partir des données réelles
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Mes litiges | Nionfar</title>
        <meta name="description" content="Gérez les litiges liés à vos commandes" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
                <FiAlertTriangle className="mr-2 h-7 w-7 text-red-500" />
                Gestion des litiges
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultez et gérez tous les litiges de la plateforme
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 md:mt-0 md:ml-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiHome className="mr-2 -ml-1 h-5 w-5" />
                Tableau de bord
              </Link>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiFileText className="mr-2 -ml-1 h-5 w-5" />
                Commandes
              </Link>
              <Link
                href="/dashboard/services"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiShoppingBag className="mr-2 -ml-1 h-5 w-5" />
                Services
              </Link>
            </div>
          </div>

          {/* Statistiques des litiges */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques des litiges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Litiges ouverts</p>
                      <p className="text-2xl font-bold text-amber-900">{stats.open}</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <FiAlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Litiges résolus</p>
                      <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiCheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Résolus récemment</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.recentlyResolved}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiClock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Temps moyen de résolution</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FiClock className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-grow">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un litige..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      statusFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setStatusFilter('open')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      statusFilter === 'open'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Ouverts
                  </button>
                  <button
                    onClick={() => setStatusFilter('resolved')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      statusFilter === 'resolved'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Résolus
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des litiges */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          ) : filteredDisputesBySearch.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun litige trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Essayez de modifier vos filtres."
                    : "Vous n'avez actuellement aucun litige."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Liste des litiges */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <DisputeList disputes={filteredDisputesBySearch} isAdmin={user?.role === 'admin'} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DisputesPage; 