import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { Withdrawal } from '../../../../types';
import withdrawalService from '../../../../services/withdrawalService';
import { toast } from 'react-toastify';
import WithdrawalDetailsModal from '../../../../components/dashboard/admin/WithdrawalDetailsModal';
import WithdrawalActionModal from '../../../../components/dashboard/admin/WithdrawalActionModal';

const WithdrawalsAdminPage: NextPage = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'validate' | 'reject' | null>(null);

  // Charger les demandes de retrait
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filtrer les retraits en fonction du filtre sélectionné
  useEffect(() => {
    if (!withdrawals.length) {
      setFilteredWithdrawals([]);
      return;
    }

    if (filter === 'all') {
      setFilteredWithdrawals(withdrawals);
    } else {
      let statusFilter: string;
      switch (filter) {
        case 'pending':
          statusFilter = 'en_attente';
          break;
        case 'validated':
          statusFilter = 'validé';
          break;
        case 'rejected':
          statusFilter = 'rejeté';
          break;
        default:
          statusFilter = '';
      }

      setFilteredWithdrawals(
        withdrawals.filter(withdrawal => withdrawal.status === statusFilter)
      );
    }
  }, [withdrawals, filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      // Dans une implémentation réelle, ceci ferait un appel API
      const response = await fetch('/api/admin/withdrawals');
      const data = await response.json();
      setWithdrawals(data);
    } catch (error) {
      console.error('Erreur lors du chargement des retraits:', error);
      toast.error('Impossible de charger les demandes de retrait');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const handleAction = (withdrawal: Withdrawal, action: 'validate' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleValidateWithdrawal = async (
    withdrawalId: string,
    transactionDetails: {
      reference: string;
      processedAt: string;
      notes?: string;
    }
  ) => {
    try {
      const adminId = 'admin-123'; // Dans une app réelle, récupérer depuis le contexte d'authentification
      const result = await withdrawalService.onWithdrawalValidated(
        withdrawalId,
        adminId,
        transactionDetails
      );

      if (result.success) {
        toast.success('Retrait validé avec succès');
        // Mettre à jour la liste
        fetchWithdrawals();
      } else {
        toast.error(result.message || 'Erreur lors de la validation du retrait');
      }
    } catch (error) {
      console.error('Erreur lors de la validation du retrait:', error);
      toast.error('Une erreur est survenue lors de la validation du retrait');
    } finally {
      setShowActionModal(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      const adminId = 'admin-123'; // Dans une app réelle, récupérer depuis le contexte d'authentification
      const result = await withdrawalService.onWithdrawalRejected(
        withdrawalId,
        adminId,
        reason
      );

      if (result.success) {
        toast.success('Retrait rejeté avec succès');
        // Mettre à jour la liste
        fetchWithdrawals();
      } else {
        toast.error(result.message || 'Erreur lors du rejet du retrait');
      }
    } catch (error) {
      console.error('Erreur lors du rejet du retrait:', error);
      toast.error('Une erreur est survenue lors du rejet du retrait');
    } finally {
      setShowActionModal(false);
    }
  };

  // Formater un montant en FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  // Afficher le statut avec un badge coloré
  const renderStatus = (status: string) => {
    switch (status) {
      case 'en_attente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1 h-3 w-3" />
            En attente
          </span>
        );
      case 'validé':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1 h-3 w-3" />
            Validé
          </span>
        );
      case 'rejeté':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="mr-1 h-3 w-3" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Gestion des retraits</h1>
            <p className="mt-2 text-sm text-gray-700">
              Liste des demandes de retrait et leur statut actuel.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={fetchWithdrawals}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setFilter('validated')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === 'validated'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Validés
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rejetés
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau de retraits */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Chargement en cours...</p>
                  </div>
                ) : filteredWithdrawals.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Aucune demande de retrait trouvée</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Utilisateur
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Montant
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Méthode
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Date de demande
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Statut
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {withdrawal.id.substring(0, 8)}...
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {withdrawal.user?.name || 'Utilisateur inconnu'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(withdrawal.amount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {withdrawal.method === 'mobile_money'
                              ? 'Mobile Money'
                              : 'Virement bancaire'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(withdrawal.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {renderStatus(withdrawal.status)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleShowDetails(withdrawal)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Détails
                            </button>
                            
                            {withdrawal.status === 'en_attente' && (
                              <>
                                <button
                                  onClick={() => handleAction(withdrawal, 'validate')}
                                  className="text-green-600 hover:text-green-900 mr-4"
                                >
                                  Valider
                                </button>
                                <button
                                  onClick={() => handleAction(withdrawal, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Rejeter
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedWithdrawal && (
        <WithdrawalDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          withdrawal={selectedWithdrawal}
        />
      )}

      {/* Modal d'action (validation ou rejet) */}
      {selectedWithdrawal && actionType && (
        <WithdrawalActionModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          withdrawal={selectedWithdrawal}
          actionType={actionType}
          onValidate={handleValidateWithdrawal}
          onReject={handleRejectWithdrawal}
        />
      )}
    </DashboardLayout>
  );
};

export default WithdrawalsAdminPage; 