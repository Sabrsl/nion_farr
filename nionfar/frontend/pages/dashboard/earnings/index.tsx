import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowDown, FiArrowUp, FiCalendar, FiCreditCard, FiDownload } from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';

// Types pour les transactions
interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'order' | 'withdrawal' | 'refund' | 'fee';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
}

// Interface pour les statistiques du tableau de bord des gains
interface EarningsStats {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnTotal: number;
  totalOrders: number;
  lastMonthEarnings: number;
  changePercentage: number;
}

const EarningsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    withdrawnTotal: 0,
    totalOrders: 0,
    lastMonthEarnings: 0,
    changePercentage: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Simuler le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées
      const mockStats: EarningsStats = {
        totalEarnings: 750000, // 750,000 FCFA
        availableBalance: 250000, // 250,000 FCFA
        pendingBalance: 150000, // 150,000 FCFA
        withdrawnTotal: 350000, // 350,000 FCFA
        totalOrders: 12,
        lastMonthEarnings: 220000, // 220,000 FCFA
        changePercentage: 15 // 15% d'augmentation
      };
      
      // Transactions simulées
      const mockTransactions: Transaction[] = [
        {
          id: 'tx-001',
          date: '2023-11-25T10:30:00',
          amount: 45000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7845',
          status: 'completed',
          orderId: 'ORD-7845'
        },
        {
          id: 'tx-002',
          date: '2023-11-20T14:15:00',
          amount: -100000,
          type: 'withdrawal',
          description: 'Retrait vers Orange Money',
          status: 'completed'
        },
        {
          id: 'tx-003',
          date: '2023-11-15T09:45:00',
          amount: 60000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7823',
          status: 'completed',
          orderId: 'ORD-7823'
        },
        {
          id: 'tx-004',
          date: '2023-11-10T16:20:00',
          amount: 75000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7810',
          status: 'completed',
          orderId: 'ORD-7810'
        },
        {
          id: 'tx-005',
          date: '2023-11-05T11:30:00',
          amount: -7500,
          type: 'fee',
          description: 'Frais de service mensuel',
          status: 'completed'
        },
        {
          id: 'tx-006',
          date: '2023-11-01T08:40:00',
          amount: 30000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7790',
          status: 'completed',
          orderId: 'ORD-7790'
        },
        {
          id: 'tx-007',
          date: '2023-10-28T13:15:00',
          amount: -150000,
          type: 'withdrawal',
          description: 'Retrait vers compte bancaire',
          status: 'completed'
        },
        {
          id: 'tx-008',
          date: '2023-10-25T10:10:00',
          amount: 65000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7775',
          status: 'completed',
          orderId: 'ORD-7775'
        },
        {
          id: 'tx-009',
          date: '2023-10-20T09:30:00',
          amount: -12000,
          type: 'refund',
          description: 'Remboursement pour la commande #ORD-7760',
          status: 'completed',
          orderId: 'ORD-7760'
        },
        {
          id: 'tx-010',
          date: '2023-10-15T15:45:00',
          amount: 85000,
          type: 'order',
          description: 'Paiement pour la commande #ORD-7745',
          status: 'completed',
          orderId: 'ORD-7745'
        }
      ];
      
      setStats(mockStats);
      setTransactions(mockTransactions);
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedPeriod]);
  
  // Formatter les montants en FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  // Formatter les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Classe CSS pour les transactions selon le type
  const getTransactionClass = (type: Transaction['type']) => {
    switch (type) {
      case 'order':
        return 'bg-green-50 text-green-800';
      case 'withdrawal':
        return 'bg-blue-50 text-blue-800';
      case 'refund':
        return 'bg-red-50 text-red-800';
      case 'fee':
        return 'bg-yellow-50 text-yellow-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };
  
  // Texte du type de transaction
  const getTransactionTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'order':
        return 'Vente';
      case 'withdrawal':
        return 'Retrait';
      case 'refund':
        return 'Remboursement';
      case 'fee':
        return 'Frais';
      default:
        return 'Transaction';
    }
  };
  
  // Changer de période
  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  };
  
  // Naviguer vers la page de détails d'une commande
  const goToOrderDetails = (orderId?: string) => {
    if (orderId) {
      router.push(`/dashboard/orders/${orderId}`);
    }
  };
  
  // Naviguer vers la page de retrait
  const goToWithdraw = () => {
    router.push('/dashboard/earnings/withdraw');
  };
  
  // Télécharger le relevé
  const downloadStatement = () => {
    // Simulation du téléchargement
    alert('Téléchargement du relevé en cours...');
    // En production, implémenter la génération et le téléchargement du PDF
  };
  
  return (
    <DashboardLayout title="Mes gains | NionFar.sn">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes gains</h1>
          <div className="flex space-x-2">
            <button
              onClick={downloadStatement}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiDownload className="mr-2" /> Télécharger le relevé
            </button>
            <button
              onClick={goToWithdraw}
              className="flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              <FiCreditCard className="mr-2" /> Effectuer un retrait
            </button>
          </div>
        </div>
        
        {/* Période */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-gray-500" />
            <span className="text-sm text-gray-600 mr-4">Période :</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-4 py-2 text-sm ${
                  selectedPeriod === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-md`}
              >
                Semaine
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-4 py-2 text-sm ${
                  selectedPeriod === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-l border-r border-gray-300`}
              >
                Mois
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-4 py-2 text-sm ${
                  selectedPeriod === 'year'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-md`}
              >
                Année
              </button>
            </div>
          </div>
        </div>
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Solde disponible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Solde disponible</h3>
            <div className="flex items-end">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.availableBalance)}</p>
            </div>
            <button
              onClick={goToWithdraw}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Retirer
            </button>
          </div>
          
          {/* Solde en attente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">En attente</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingBalance)}</p>
            <p className="mt-2 text-sm text-gray-500">Disponible dans 7 jours</p>
          </div>
          
          {/* Total retiré */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total retiré</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.withdrawnTotal)}</p>
          </div>
          
          {/* Revenus du mois */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Revenus du mois</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.lastMonthEarnings)}</p>
            <div className="mt-2 flex items-center">
              {stats.changePercentage >= 0 ? (
                <FiArrowUp className="text-green-500 mr-1" />
              ) : (
                <FiArrowDown className="text-red-500 mr-1" />
              )}
              <span className={`text-sm ${stats.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(stats.changePercentage)}% par rapport au mois précédent
              </span>
            </div>
          </div>
        </div>
        
        {/* Historique des transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 py-4 px-6">
            <h2 className="text-lg font-medium text-gray-900">Historique des transactions</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500">Chargement des transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucune transaction pour cette période.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className={transaction.orderId ? 'cursor-pointer hover:bg-gray-50' : ''}
                      onClick={() => goToOrderDetails(transaction.orderId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTransactionClass(transaction.type)}`}>
                          {getTransactionTypeText(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-blue-600'}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.status === 'completed' && <span className="text-green-600">Complété</span>}
                        {transaction.status === 'pending' && <span className="text-yellow-600">En attente</span>}
                        {transaction.status === 'failed' && <span className="text-red-600">Échoué</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EarningsPage;
