import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/layouts/AdminLayout';
import Head from 'next/head';
import { 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiChevronLeft, 
  FiChevronRight, 
  FiFilter, 
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiPause,
  FiPlay,
  FiMessageSquare,
  FiRepeat,
  FiMoreVertical,
  FiX,
  FiRefreshCw
} from 'react-icons/fi/index.js';
import { classNames } from '../../utils/helpers';
import RefundModal from '../../components/admin/RefundModal';
import RefundTransactionHistory from '../../components/admin/RefundTransactionHistory';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import OrderFilters from '../../components/admin/OrderFilters';
import { OrderStatus } from '../../types';

// Import du service pour les commandes
import orderService, { 
  OrderServiceModel as Order, 
  Transaction, 
  OrderStats,
  OrderFilterOptions,
  OrderAction
} from '../../services/orderService';

/**
 * Page d'administration des commandes
 */
const AdminOrdersPage: NextPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [isBulkActionMenuOpen, setIsBulkActionMenuOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [orderTransactions, setOrderTransactions] = useState<Transaction[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    blocked: 0,
    suspended: 0,
    disputed: 0,
    cancelled: 0,
    pendingPayment: 0,
    averageOrderValue: 0,
    totalRevenue: 0
  });
  
  useEffect(() => {
    // Chargement des données lors du montage du composant
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, selectedStatus, dateRange, searchTerm]);

  // Fonction pour récupérer les commandes
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filters: OrderFilterOptions = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        searchTerm: searchTerm || undefined,
        page: currentPage,
        limit: 10
      };

      const { orders: ordersData, total } = await orderService.getOrders(filters);
      
      setOrders(ordersData);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les statistiques
  const fetchOrderStats = async () => {
    try {
      const stats = await orderService.getOrderStats();
      setOrderStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };
  
  // Formatage de la date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non défini';
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
  
  // Gérer le blocage d'une commande
  const handleBlockOrder = async (orderId: number) => {
    try {
      await orderService.performOrderAction(orderId, {
        type: 'block',
        reason: 'Action administrative'
      });
      
      // Rafraîchir les données
      fetchOrders();
      fetchOrderStats();
      
      // Fermer le menu d'action
      setActionMenuOpen(null);
      
      // Si la commande était ouverte en détail, fermer la modal
      if (selectedOrder && selectedOrder.id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      console.error(`Erreur lors du blocage de la commande ${orderId}:`, error);
    }
  };
  
  // Gérer la suspension d'une commande
  const handleSuspendOrder = async (orderId: number) => {
    try {
      await orderService.performOrderAction(orderId, {
        type: 'suspend',
        reason: 'Action administrative'
      });
      
      // Rafraîchir les données
      fetchOrders();
      fetchOrderStats();
      
      // Fermer le menu d'action
      setActionMenuOpen(null);
      
      // Si la commande était ouverte en détail, fermer la modal
      if (selectedOrder && selectedOrder.id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      console.error(`Erreur lors de la suspension de la commande ${orderId}:`, error);
    }
  };
  
  // Gérer la reprise d'une commande
  const handleResumeOrder = async (orderId: number) => {
    try {
      const action: OrderAction = {
        type: selectedOrder?.status === ('blocked' as OrderStatus) ? 'unblock' : 'resume'
      };
      
      await orderService.performOrderAction(orderId, action);
      
      // Rafraîchir les données
      fetchOrders();
      fetchOrderStats();
      
      // Fermer le menu d'action
      setActionMenuOpen(null);
      
      // Si la commande était ouverte en détail, fermer la modal
      if (selectedOrder && selectedOrder.id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      console.error(`Erreur lors de la reprise de la commande ${orderId}:`, error);
    }
  };
  
  // Gérer la suppression d'une commande
  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      try {
        await orderService.performOrderAction(orderId, {
          type: 'delete'
        });
        
        // Rafraîchir les données
        fetchOrders();
        fetchOrderStats();
        
        // Fermer le menu d'action
        setActionMenuOpen(null);
        
        // Si la commande était ouverte en détail, fermer la modal
        if (selectedOrder && selectedOrder.id === orderId) {
          closeOrderDetails();
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression de la commande ${orderId}:`, error);
      }
    } else {
      setActionMenuOpen(null);
    }
  };
  
  // Gérer le remboursement d'une commande
  const handleRefundOrder = (orderId: number) => {
    setSelectedOrder(orders.find(order => order.id === orderId) || null);
    setIsRefundModalOpen(true);
    setActionMenuOpen(null);
  };
  
  // Finaliser le remboursement
  const handleSubmitRefund = async (orderId: number, reason: string, amount: number) => {
    try {
      await orderService.performOrderAction(orderId, {
        type: 'refund',
        reason,
        refundAmount: amount
      });
      
      // Fermer la modal de remboursement
      setIsRefundModalOpen(false);
      
      // Rafraîchir les données
      fetchOrders();
      fetchOrderStats();
      
      // Charger les nouvelles transactions si la commande était ouverte
      if (selectedOrder && selectedOrder.id === orderId && isOrderDetailsModalOpen) {
        loadOrderTransactions(orderId);
      }
    } catch (error) {
      console.error(`Erreur lors du remboursement de la commande ${orderId}:`, error);
    }
  };
  
  // Gérer la réouverture d'une commande
  const handleReopenOrder = async (orderId: number) => {
    try {
      await orderService.performOrderAction(orderId, {
        type: 'reopen'
      });
      
      // Rafraîchir les données
      fetchOrders();
      fetchOrderStats();
      
      // Fermer le menu d'action
      setActionMenuOpen(null);
      
      // Si la commande était ouverte en détail, fermer la modal
      if (selectedOrder && selectedOrder.id === orderId) {
        closeOrderDetails();
      }
    } catch (error) {
      console.error(`Erreur lors de la réouverture de la commande ${orderId}:`, error);
    }
  };
  
  // Gérer la mise à jour des notes
  const handleUpdateNotes = async (orderId: number, notes: string): Promise<void> => {
    try {
      await orderService.updateOrderNotes(orderId, notes);
      
      // Rafraîchir les données
      fetchOrders();
      
      // Mettre à jour la commande sélectionnée si elle est affichée
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          adminNotes: notes
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des notes pour la commande ${orderId}:`, error);
    }
  };
  
  // Toggle du menu d'actions
  const toggleActionMenu = (orderId: number) => {
    setActionMenuOpen(actionMenuOpen === orderId ? null : orderId);
  };
  
  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Terminée</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'in_progress':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">En cours</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Annulée</span>;
      case 'disputed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">En litige</span>;
      case 'blocked':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Bloquée</span>;
      case 'suspended':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Suspendue</span>;
      case 'refunded':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Remboursée</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Obtenir le badge de statut de paiement
  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Payé</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'refunded':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Remboursé</span>;
      case 'partial':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Partiel</span>;
      case 'held':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Retenu</span>;
      case 'failed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Échoué</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{paymentStatus}</span>;
    }
  };
  
  // Ouvrir le modal de détails de commande
  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
    
    // Charger les transactions liées
    await loadOrderTransactions(order.id);
  };
  
  // Fermer le modal de détails de commande
  const closeOrderDetails = () => {
    setIsOrderDetailsModalOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 300);
  };
  
  // Fermer la modal de remboursement
  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
    setTimeout(() => {
      // Ne pas réinitialiser selectedOrder si le modal de détails est ouvert
      if (!isOrderDetailsModalOpen) {
        setSelectedOrder(null);
      }
    }, 300);
  };
  
  // Exporter des commandes
  const exportOrders = async (format: 'csv' | 'excel') => {
    try {
      const filters: OrderFilterOptions = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        searchTerm: searchTerm || undefined
      };
      
      const result = await orderService.exportOrders(format, filters);
      
      if (result.url) {
        // Créer un lien et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = result.url;
        link.download = `commandes_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer l'URL de l'objet blob
        setTimeout(() => {
          window.URL.revokeObjectURL(result.url);
        }, 100);
      }
    } catch (error) {
      console.error(`Erreur lors de l'exportation des commandes en ${format}:`, error);
    } finally {
      setActionMenuOpen(null);
    }
  };
  
  // Sélectionner ou désélectionner une commande
  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };
  
  // Sélectionner ou désélectionner toutes les commandes
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };
  
  // Effectuer une action groupée
  const handleBulkAction = async (action: 'block' | 'suspend' | 'delete' | 'export') => {
    if (selectedOrders.length === 0) return;
    
    setIsBulkActionMenuOpen(false);
    
    if (action === 'export') {
      exportOrders('excel');
      return;
    }
    
    let confirmMessage = '';
    switch (action) {
      case 'block':
        confirmMessage = `Êtes-vous sûr de vouloir bloquer les ${selectedOrders.length} commandes sélectionnées ?`;
        break;
      case 'suspend':
        confirmMessage = `Êtes-vous sûr de vouloir suspendre les ${selectedOrders.length} commandes sélectionnées ?`;
        break;
      case 'delete':
        confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement les ${selectedOrders.length} commandes sélectionnées ? Cette action est irréversible.`;
        break;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await orderService.performBulkAction(selectedOrders, {
          type: action
        });
        
        // Rafraîchir les données
        fetchOrders();
        fetchOrderStats();
        
        // Réinitialiser la sélection
        setSelectedOrders([]);
        
        // Fermer les modals ouverts
        if (isOrderDetailsModalOpen && selectedOrder && selectedOrders.includes(selectedOrder.id)) {
          closeOrderDetails();
        }
      } catch (error) {
        console.error(`Erreur lors de l'action groupée ${action}:`, error);
      }
    }
  };
  
  // Appliquer les filtres avancés
  const handleApplyFilters = (filters: OrderFilterOptions) => {
    // Mettre à jour les filtres principaux
    setSelectedStatus(filters.status || 'all');
    setDateRange(filters.dateRange || 'all');
    setCurrentPage(1);
    
    // Récupérer les commandes avec les nouveaux filtres
    fetchOrders();
  };
  
  // Charger les transactions liées à une commande
  const loadOrderTransactions = async (orderId: number) => {
    try {
      const transactions = await orderService.getOrderTransactions(orderId);
      setOrderTransactions(transactions);
    } catch (error) {
      console.error(`Erreur lors du chargement des transactions pour la commande ${orderId}:`, error);
      setOrderTransactions([]);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestion des commandes | Admin NionFar</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des commandes</h1>
          
          <div className="flex flex-wrap gap-3">
            <button 
              type="button" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setActionMenuOpen(actionMenuOpen === -1 ? null : -1)}
            >
              <FiDownload className="-ml-1 mr-2 h-4 w-4" />
              Exporter
            </button>
            {actionMenuOpen === -1 && (
              <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    exportOrders('csv');
                    setActionMenuOpen(null);
                  }}
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Exporter en CSV
                </button>
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    exportOrders('excel');
                    setActionMenuOpen(null);
                  }}
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Exporter en Excel
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistiques des commandes */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <FiDollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total des commandes</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{orderStats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiCheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Commandes terminées</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{orderStats.completed}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FiClock className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Commandes en cours</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{orderStats.inProgress}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <FiAlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Commandes en litige</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{orderStats.disputed}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <FiDollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenu total</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{formatPrice(orderStats.totalRevenue)}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtres avancés */}
        <OrderFilters onApplyFilters={handleApplyFilters} />
        
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
                placeholder="Rechercher par ID, client, freelancer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {totalItems} commande{totalItems !== 1 ? 's' : ''} trouvée{totalItems !== 1 ? 's' : ''}
            {selectedOrders.length > 0 && (
              <span className="ml-2 text-indigo-600">
                ({selectedOrders.length} sélectionnée{selectedOrders.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {selectedOrders.length > 0 && (
              <div className="relative">
                <button 
                  type="button" 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsBulkActionMenuOpen(!isBulkActionMenuOpen)}
                >
                  Actions groupées
                </button>
                {isBulkActionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleBulkAction('block')}
                    >
                      <FiLock className="mr-2 h-4 w-4" />
                      Bloquer
                    </button>
                    <button
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleBulkAction('suspend')}
                    >
                      <FiPause className="mr-2 h-4 w-4" />
                      Suspendre
                    </button>
                    <button
                      className="flex w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <FiTrash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </button>
                    <button
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleBulkAction('export')}
                    >
                      <FiDownload className="mr-2 h-4 w-4" />
                      Exporter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Liste des commandes */}
        <div className="bg-white shadow-sm overflow-hidden rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <FiSearch className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune commande ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 w-8">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Freelancer
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paiement
                    </th>
                    <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="relative px-2 sm:px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={classNames(
                        "hover:bg-gray-50 cursor-pointer",
                        selectedOrders.includes(order.id) ? "bg-indigo-50" : ""
                      )}
                    >
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" onClick={() => openOrderDetails(order)}>
                        #{order.id}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" onClick={() => openOrderDetails(order)}>
                        {order.service}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => openOrderDetails(order)}>
                        {order.client}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => openOrderDetails(order)}>
                        {order.freelancer}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900" onClick={() => openOrderDetails(order)}>
                        {formatPrice(order.amount)}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap" onClick={() => openOrderDetails(order)}>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-6 py-4 whitespace-nowrap" onClick={() => openOrderDetails(order)}>
                        {getPaymentBadge(order.paymentStatus)}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => openOrderDetails(order)}>
                        {formatDate(order.date)}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionMenu(order.id);
                          }}
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>
                        {actionMenuOpen === order.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                            <button
                              className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                openOrderDetails(order);
                                setActionMenuOpen(null);
                              }}
                            >
                              <FiEye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </button>
                            {order.status !== ('blocked' as OrderStatus) && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleBlockOrder(order.id)}
                              >
                                <FiLock className="mr-2 h-4 w-4" />
                                Bloquer
                              </button>
                            )}
                            {order.status === ('blocked' as OrderStatus) && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleResumeOrder(order.id)}
                              >
                                <FiUnlock className="mr-2 h-4 w-4" />
                                Débloquer
                              </button>
                            )}
                            {order.status !== ('suspended' as OrderStatus) && order.status !== ('blocked' as OrderStatus) && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleSuspendOrder(order.id)}
                              >
                                <FiPause className="mr-2 h-4 w-4" />
                                Suspendre
                              </button>
                            )}
                            {order.status === ('suspended' as OrderStatus) && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleResumeOrder(order.id)}
                              >
                                <FiPlay className="mr-2 h-4 w-4" />
                                Reprendre
                              </button>
                            )}
                            {order.status !== ('refunded' as OrderStatus) && order.paymentStatus === 'paid' && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleRefundOrder(order.id)}
                              >
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                Rembourser
                              </button>
                            )}
                            {(order.status === ('cancelled' as OrderStatus) || order.status === ('completed' as OrderStatus)) && (
                              <button
                                className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleReopenOrder(order.id)}
                              >
                                <FiRepeat className="mr-2 h-4 w-4" />
                                Rouvrir
                              </button>
                            )}
                            <button
                              className="flex w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {orders.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={classNames(
                    "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white",
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  )}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                    Affichage de <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> à <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> sur <span className="font-medium">{totalItems}</span> commandes
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                          onClick={() => setCurrentPage(pageNumber)}
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
      </div>
      
      {/* Modal de détails de commande */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isOrderDetailsModalOpen}
          onClose={closeOrderDetails}
          order={selectedOrder}
          transactions={orderTransactions}
          formatPrice={formatPrice}
          formatDate={formatDate}
          onBlockOrder={handleBlockOrder}
          onSuspendOrder={handleSuspendOrder}
          onResumeOrder={handleResumeOrder}
          onRefundOrder={handleRefundOrder}
          onReopenOrder={handleReopenOrder}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
      
      {/* Modal de remboursement */}
      {selectedOrder && (
        <RefundModal
          isOpen={isRefundModalOpen}
          onClose={closeRefundModal}
          order={selectedOrder}
          onRefund={handleSubmitRefund}
          formatPrice={formatPrice}
        />
      )}
      
      {/* Historique des transactions pour les remboursements */}
      {selectedOrder && orderTransactions.length > 0 && (
        <RefundTransactionHistory
          orderId={selectedOrder.id}
          transactions={orderTransactions}
          formatPrice={formatPrice}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage; 