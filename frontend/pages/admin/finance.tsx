import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/layouts/AdminLayout';
import Head from 'next/head';
import { 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiFilter, 
  FiDownload,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiCreditCard,
  FiRefreshCw,
  FiFileText,
  FiPieChart,
  FiBarChart2,
  FiClock,
  FiActivity
} from 'react-icons/fi/index.js';

// Import des composants personnalisés
import FinancialSummary from '../../components/admin/FinancialSummary';
import TransactionFilters from '../../components/admin/TransactionFilters';
import TransactionDetailsModal from '../../components/admin/TransactionDetailsModal';
import FinancialReportGenerator from '../../components/admin/FinancialReportGenerator';
import AuditTrail from '../../components/admin/AuditTrail';

// Import du service finance
import financeService, { 
  Transaction, 
  TransactionFilters as Filters, 
  ReportOptions 
} from '../../services/FinanceService';

/**
 * Combine plusieurs classes CSS conditionnelles en une seule chaîne
 */
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Page d'administration des finances
 */
const AdminFinancePage: NextPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // États pour les modales
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // États pour les filtres avancés
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    dateRange: 'month',
    userType: 'all',
    paymentMethod: 'all',
    page: 1,
    limit: itemsPerPage
  });
  
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    commissions: 0,
    growth: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    failedTransactions: 0,
    pendingTransactions: 0
  });
  
  useEffect(() => {
    // Charger les données financières au montage du composant
    fetchFinanceData();
  }, [currentPage, appliedFilters, searchTerm]);

  // Fonction pour charger les données
  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Récupérer le résumé financier
      const summaryData = await financeService.getFinancialSummary(appliedFilters.dateRange);
      setSummary(summaryData);
      
      // Récupérer les transactions avec filtres
      const { transactions: transactionsData, total } = await financeService.getTransactions({
        ...appliedFilters,
        searchTerm,
        page: currentPage
      });
      
      setTransactions(transactionsData);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Style pour le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Terminé</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'processing':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">En cours</span>;
      case 'failed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Échoué</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Annulé</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Style pour l'icône de type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <FiTrendingUp className="h-5 w-5 text-green-500" />;
      case 'payout':
        return <FiTrendingDown className="h-5 w-5 text-orange-500" />;
      case 'refund':
        return <FiRefreshCw className="h-5 w-5 text-red-500" />;
      case 'commission':
        return <FiDollarSign className="h-5 w-5 text-indigo-500" />;
      default:
        return <FiDollarSign className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Nom du type
  const getTypeName = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Paiement';
      case 'payout':
        return 'Retrait';
      case 'refund':
        return 'Remboursement';
      case 'commission':
        return 'Commission';
      default:
        return type;
    }
  };
  
  // Ouverture de la modal de détails de transaction
  const openTransactionDetails = async (transaction: Transaction) => {
    try {
      // Si on veut charger plus de détails depuis l'API
      // const fullTransaction = await financeService.getTransactionById(transaction.id);
      // setSelectedTransaction(fullTransaction);
      setSelectedTransaction(transaction);
      setIsTransactionModalOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la transaction:', error);
      // Afficher une notification d'erreur ici
    }
  };
  
  // Fermeture de la modal de détails de transaction
  const closeTransactionDetails = () => {
    setIsTransactionModalOpen(false);
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 300);
  };
  
  // Ouverture de la modal de génération de rapport
  const openReportGenerator = () => {
    setIsReportModalOpen(true);
  };
  
  // Fermeture de la modal de génération de rapport
  const closeReportGenerator = () => {
    setIsReportModalOpen(false);
  };
  
  // Appliquer les filtres
  const handleApplyFilters = (filters: Filters) => {
    setAppliedFilters({...filters, page: 1, limit: itemsPerPage});
    setCurrentPage(1); // Retour à la première page après filtrage
  };
  
  // Génération de rapport
  const handleGenerateReport = async (options: ReportOptions): Promise<void> => {
    try {
      const result = await financeService.generateReport(options);
      // Déclencher le téléchargement du rapport
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  };
  
  // Gestionnaire d'exportation
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const result = await financeService.exportTransactions(format, appliedFilters);
      
      // Déclencher le téléchargement
      if (result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = `transactions_${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer l'URL de l'objet blob
        setTimeout(() => {
          window.URL.revokeObjectURL(result.url);
        }, 100);
      }
    } catch (error) {
      console.error(`Erreur lors de l'exportation des transactions en ${format}:`, error);
      // Afficher une notification d'erreur ici
    }
  };
  
  // Mise à jour du statut d'une transaction
  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const updatedTransaction = await financeService.updateTransactionStatus(id, status, notes);
      
      // Mettre à jour la transaction dans la liste
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => tx.id === id ? updatedTransaction : tx)
      );
      
      // Mettre à jour la transaction sélectionnée si elle est ouverte
      if (selectedTransaction && selectedTransaction.id === id) {
        setSelectedTransaction(updatedTransaction);
      }
      
      // Rafraîchir les données pour mettre à jour les statistiques
      fetchFinanceData();
      
      // Fermer la modal
      closeTransactionDetails();
      
      // Afficher une notification de succès
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de la transaction ${id}:`, error);
      // Afficher une notification d'erreur
    }
  };
  
  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setAppliedFilters(prev => ({...prev, page}));
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Finances | Admin NionFar</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des finances</h1>
          
          <div className="flex flex-wrap gap-3">
            <button 
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={openReportGenerator}
            >
              <FiFileText className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Générer un rapport
            </button>
            
            <div className="relative inline-block text-left w-full sm:w-auto">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => handleExport('excel')}
              >
                <FiDownload className="-ml-1 mr-2 h-5 w-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>
        
        {/* Résumé financier */}
        <FinancialSummary
          data={summary}
          formatPrice={formatPrice}
          period={appliedFilters.dateRange === 'all' ? 'Toutes périodes' : 
                 appliedFilters.dateRange === 'today' ? "Aujourd'hui" :
                 appliedFilters.dateRange === 'week' ? 'Cette semaine' :
                 appliedFilters.dateRange === 'month' ? 'Ce mois' : 'Cette année'}
        />
        
        {/* Filtres avancés */}
        <TransactionFilters
          onApplyFilters={handleApplyFilters}
          initialFilters={appliedFilters}
        />
        
        {/* Barre de recherche simple */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-96">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher par ID, description, utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {totalItems} transaction{totalItems !== 1 ? 's' : ''} trouvée{totalItems !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Tableau des transactions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <FiSearch className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune transaction ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="relative px-2 sm:px-6 py-3">
                      <span className="sr-only">Voir</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openTransactionDetails(transaction)}
                    >
                      <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 max-w-[80px] sm:max-w-none truncate">
                        {transaction.id}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          {getTypeIcon(transaction.type)}
                          <span className="ml-1 hidden sm:inline">{getTypeName(transaction.type)}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {transaction.user}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <span className={transaction.type === 'refund' || transaction.type === 'payout' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'refund' || transaction.type === 'payout' ? '-' : '+'}{formatPrice(transaction.amount)}
                        </span>
                        {transaction.fee > 0 && (
                          <div className="text-xs text-gray-500 hidden sm:block">
                            Frais: {formatPrice(transaction.fee)}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTransactionDetails(transaction);
                          }}
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={classNames(
                    "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white",
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  )}
                >
                  Précédent
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={classNames(
                    "ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white",
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  )}
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur <span className="font-medium">{totalItems}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={classNames(
                        "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500",
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      )}
                    >
                      <span className="sr-only">Précédent</span>
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Pages visibles */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={classNames(
                            "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                            currentPage === pageNumber
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={classNames(
                        "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500",
                        currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      )}
                    >
                      <span className="sr-only">Suivant</span>
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Journal d'audit des transactions */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Journal d'audit des transactions</h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiActivity className="mr-1 h-4 w-4" />
              Toutes les actions liées aux transactions sont tracées
            </div>
          </div>
          
          <AuditTrail 
            entityType="transaction"
            limit={15}
            formatDate={formatDate}
          />
        </div>
      </div>
      
      {/* Modal de détails de transaction */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isTransactionModalOpen}
          onClose={closeTransactionDetails}
          transaction={selectedTransaction}
          formatPrice={formatPrice}
          formatDate={formatDate}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {/* Modal de génération de rapport */}
      <FinancialReportGenerator
        isOpen={isReportModalOpen}
        onClose={closeReportGenerator}
        onGenerate={handleGenerateReport}
      />
    </AdminLayout>
  );
};

export default AdminFinancePage; 