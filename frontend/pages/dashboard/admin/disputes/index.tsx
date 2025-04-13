import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import DisputeList from '../../../../components/dashboard/DisputeList';
import { Dispute } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { FiAlertTriangle, FiLoader, FiFilter, FiSearch } from 'react-icons/fi/index.js';

const AdminDisputesPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      router.push('/login?redirect=/dashboard/admin/disputes');
      return;
    }

    // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDisputes = async () => {
      if (!user) return;

      setIsLoadingDisputes(true);
      setError(null);

      try {
        // En production, ceci serait un appel API
        // const response = await fetch('/api/admin/disputes');
        // const data = await response.json();
        
        // Simulation de données pour la démonstration
        const mockDisputes: Dispute[] = [
          {
            id: '1',
            orderId: 'order123456',
            initiatedBy: 'user123',
            reason: 'Délai non respecté',
            details: 'Le vendeur n\'a pas livré la commande dans le délai convenu de 3 jours. Cela fait maintenant 7 jours et je n\'ai toujours pas reçu ma commande.',
            attachments: [],
            status: 'ouvert',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours avant
            updates: [
              {
                userId: 'user123',
                message: 'Litige ouvert',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'status_change'
              },
              {
                userId: 'admin123',
                message: 'Nous avons bien reçu votre demande et allons examiner ce litige.',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'comment'
              }
            ]
          },
          {
            id: '2',
            orderId: 'order789012',
            initiatedBy: 'user456',
            reason: 'Qualité insatisfaisante',
            details: 'Le service reçu ne correspond pas du tout à la description. La qualité est bien inférieure à ce qui était promis.',
            attachments: [],
            status: 'résolu_en_faveur_client',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 jours avant
            resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 jours avant
            resolvedBy: 'admin456',
            resolution: 'remboursement_total',
            updates: [
              {
                userId: 'user456',
                message: 'Litige ouvert',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'status_change'
              },
              {
                userId: 'vendor789',
                message: 'Je suis désolé pour votre insatisfaction. Pouvez-vous préciser ce qui ne va pas afin que je puisse corriger ?',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'comment'
              },
              {
                userId: 'admin456',
                message: 'Litige résolu en faveur du client: Après vérification, le service ne correspond pas aux standards promis. Un remboursement a été effectué.',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'resolution'
              }
            ]
          },
          {
            id: '3',
            orderId: 'order345678',
            initiatedBy: 'vendor321',
            reason: 'Exigences imprécises du client',
            details: 'Le client change constamment ses exigences et refuse de fournir des spécifications claires malgré mes demandes répétées.',
            attachments: [],
            status: 'ouvert',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 jours avant
            updates: [
              {
                userId: 'vendor321',
                message: 'Litige ouvert',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'status_change'
              }
            ]
          }
        ];
        
        setDisputes(mockDisputes);
      } catch (error) {
        console.error('Erreur lors de la récupération des litiges:', error);
        setError('Une erreur est survenue lors de la récupération des litiges. Veuillez réessayer.');
      } finally {
        setIsLoadingDisputes(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDisputes();
    }
  }, [user]);

  if (isLoadingDisputes || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Administration des litiges | Nionfar</title>
      </Head>
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Administration des litiges</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez les litiges ouverts par les utilisateurs pour résoudre les conflits entre vendeurs et clients.
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              {error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : isLoadingDisputes ? (
                <div className="flex justify-center items-center h-64">
                  <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Statistiques des litiges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Litiges ouverts</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {disputes.filter(d => d.status === 'ouvert').length}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Litiges résolus récemment</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">
                          {disputes.filter(d => (d.status === 'résolu_en_faveur_client' || d.status === 'résolu_en_faveur_vendeur') && new Date(d.resolvedAt!).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Temps moyen de résolution</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {disputes.filter(d => (d.status === 'résolu_en_faveur_client' || d.status === 'résolu_en_faveur_vendeur') && d.resolvedAt).length > 0 
                            ? Math.round(disputes
                                .filter(d => (d.status === 'résolu_en_faveur_client' || d.status === 'résolu_en_faveur_vendeur') && d.resolvedAt)
                                .reduce((acc, d) => acc + (new Date(d.resolvedAt!).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24), 0) / 
                                disputes.filter(d => (d.status === 'résolu_en_faveur_client' || d.status === 'résolu_en_faveur_vendeur') && d.resolvedAt).length
                              ) + ' jours'
                            : 'N/A'}
                        </dd>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtres rapides */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <button
                      onClick={() => setStatusFilter('')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        statusFilter === '' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setStatusFilter('ouvert')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        statusFilter === 'ouvert' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Litiges ouverts
                    </button>
                    <button
                      onClick={() => setStatusFilter('résolu_en_faveur_client')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        statusFilter === 'résolu_en_faveur_client' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Litiges résolus
                    </button>
                  </div>
                  
                  {/* Liste des litiges */}
                  <DisputeList 
                    disputes={statusFilter ? disputes.filter(d => d.status === statusFilter) : disputes} 
                    isAdmin={true} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AdminDisputesPage; 