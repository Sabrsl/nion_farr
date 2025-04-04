import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Dispute, Order } from '../../../../types';
import DisputeStatus from '../../../../components/dashboard/DisputeStatus';
import DisputeResolutionForm from '../../../../components/dashboard/DisputeResolutionForm';
import DisputeLogViewer from '../../../../components/dashboard/DisputeLogViewer';
import disputeService from '../../../../services/disputeService';
import orderService from '../../../../services/orderService';
import disputeLogService from '../../../../services/disputeLogService';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { toast } from 'react-toastify';
import { FiMessageCircle, FiRefreshCw, FiDownload } from 'react-icons/fi';

const DisputeDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    async function fetchDisputeDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Simuler une requête API pour récupérer le litige
        const disputeResponse = await disputeService.getDisputeById(id as string);
        setDispute(disputeResponse);
        
        // Récupérer les détails de la commande associée
        if (disputeResponse.orderId) {
          const orderResponse = await orderService.getOrderById(disputeResponse.orderId);
          setOrder(orderResponse);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails du litige:', err);
        setError('Impossible de charger les détails du litige');
      } finally {
        setLoading(false);
      }
    }

    fetchDisputeDetails();
  }, [id]);

  const handleRefreshSummary = async () => {
    if (!dispute || !order) return;
    
    try {
      const summary = await disputeLogService.generateDisputeSummary(dispute, order);
      
      // Mettre à jour le résumé dans le litige (dans une vraie implémentation, cela déclencherait un appel API)
      setDispute({
        ...dispute,
        summary
      });
      
      toast.success('Résumé mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du résumé:', err);
      toast.error('Impossible de mettre à jour le résumé');
    }
  };

  const handleExportLogs = async () => {
    if (!dispute) return;
    
    try {
      const logs = await disputeLogService.getDisputeLogs(dispute.id);
      
      // Préparer les données pour l'export
      const exportData = {
        dispute: {
          id: dispute.id,
          orderId: dispute.orderId,
          status: dispute.status,
          createdAt: dispute.createdAt,
          resolvedAt: dispute.resolvedAt,
          resolution: dispute.resolution
        },
        logs,
        summary: dispute.summary,
        exportedAt: new Date().toISOString()
      };
      
      // Créer un fichier JSON à télécharger
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // Créer un lien de téléchargement et cliquer dessus
      const exportFileDefaultName = `litige-${dispute.id}-export.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Journal exporté avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'export des logs:', err);
      toast.error('Impossible d\'exporter le journal');
    }
  };

  const handleDisputeResolved = async () => {
    // Recharger les données après la résolution
    router.reload();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dispute || !order) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error || 'Erreur lors du chargement des données'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Détails du litige {dispute.id}
          </h1>
          <DisputeStatus status={dispute.status} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Informations générales
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID du litige</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dispute.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Commande associée</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date d'ouverture</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(dispute.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dispute.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Client</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.client.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vendeur</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.service.provider.name}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Raison du litige</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dispute.reason}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Détails</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {dispute.details}
                    </dd>
                  </div>
                  {dispute.attachments && dispute.attachments.length > 0 && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Pièces jointes</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="space-y-2">
                          {dispute.attachments.map((url, index) => (
                            <li key={index}>
                              <a 
                                href={url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500"
                              >
                                Pièce jointe {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {dispute.resolution && (
                    <>
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Résolution</dt>
                        <dd className="mt-1 text-sm text-gray-900">{dispute.resolution}</dd>
                      </div>
                      {dispute.resolutionReason && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Commentaire de résolution</dt>
                          <dd className="mt-1 text-sm text-gray-900">{dispute.resolutionReason}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Historique des messages
                </h3>
                <button
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  onClick={() => setShowLogs(!showLogs)}
                >
                  <FiMessageCircle className="mr-1" />
                  {showLogs ? 'Masquer journal' : 'Voir journal détaillé'}
                </button>
              </div>
              <div className="p-6">
                {dispute.updates && dispute.updates.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {dispute.updates.map((update, index) => (
                      <li key={index} className="py-4">
                        <div className="flex space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {update.type === 'comment' ? 'Commentaire' : 
                                 update.type === 'status_change' ? 'Changement de statut' : 
                                 'Résolution'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(update.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {update.message}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    Aucun message dans ce litige
                  </p>
                )}
              </div>
            </div>
            
            {showLogs && (
              <div className="mb-6">
                <div className="flex justify-end mb-3 space-x-2">
                  <button
                    onClick={handleRefreshSummary}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Actualiser le résumé
                  </button>
                  <button
                    onClick={handleExportLogs}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Exporter le journal
                  </button>
                </div>
                <DisputeLogViewer dispute={dispute} orderId={order.id} />
              </div>
            )}
          </div>
          
          <div>
            <DisputeResolutionForm dispute={dispute} onResolved={handleDisputeResolved} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DisputeDetailsPage; 