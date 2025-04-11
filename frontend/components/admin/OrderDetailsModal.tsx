import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiHash, 
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiPause,
  FiPlay,
  FiAlertTriangle,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiMessageSquare,
  FiPackage,
  FiCreditCard,
  FiInfo,
  FiList,
  FiCornerUpRight,
  FiPlusCircle
} from 'react-icons/fi/index.js';

import { OrderServiceModel as Order, Transaction } from '../../services/orderService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  transactions?: Transaction[];
  formatPrice: (amount: number) => string;
  formatDate: (date: string) => string;
  onBlockOrder?: (orderId: number) => Promise<void>;
  onSuspendOrder?: (orderId: number) => Promise<void>;
  onResumeOrder?: (orderId: number) => Promise<void>;
  onRefundOrder?: (orderId: number) => void;
  onReopenOrder?: (orderId: number) => Promise<void>;
  onUpdateNotes?: (orderId: number, notes: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  transactions = [],
  formatPrice,
  formatDate,
  onBlockOrder,
  onSuspendOrder,
  onResumeOrder,
  onRefundOrder,
  onReopenOrder,
  onUpdateNotes
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  useEffect(() => {
    if (order) {
      setAdminNotes(order.adminNotes || '');
    }
  }, [order]);
  
  if (!order) return null;
  
  // Icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <FiRefreshCw className="h-6 w-6 text-blue-500" />;
      case 'pending':
        return <FiClock className="h-6 w-6 text-yellow-500" />;
      case 'cancelled':
        return <FiXCircle className="h-6 w-6 text-red-500" />;
      case 'disputed':
        return <FiAlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'blocked':
        return <FiLock className="h-6 w-6 text-gray-500" />;
      case 'suspended':
        return <FiPause className="h-6 w-6 text-purple-500" />;
      case 'refunded':
        return <FiCornerUpRight className="h-6 w-6 text-indigo-500" />;
      default:
        return <FiInfo className="h-6 w-6 text-gray-400" />;
    }
  };
  
  // Titre de statut
  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Commande terminée';
      case 'in_progress':
        return 'Commande en cours';
      case 'pending':
        return 'Commande en attente';
      case 'cancelled':
        return 'Commande annulée';
      case 'disputed':
        return 'Commande en litige';
      case 'blocked':
        return 'Commande bloquée';
      case 'suspended':
        return 'Commande suspendue';
      case 'refunded':
        return 'Commande remboursée';
      default:
        return 'Statut inconnu';
    }
  };
  
  // Badge de statut de paiement
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
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
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Basculer l'éditeur de notes
  const toggleNotesEditor = () => {
    setShowNotesEditor(!showNotesEditor);
    if (!showNotesEditor) {
      setAdminNotes(order.adminNotes || '');
    }
  };
  
  // Sauvegarder les notes
  const saveNotes = async () => {
    if (!onUpdateNotes) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await onUpdateNotes(order.id, adminNotes);
      setShowNotesEditor(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
      setUpdateError('Une erreur est survenue lors de la sauvegarde des notes. Veuillez réessayer.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Fonction pour formater la date complète avec heure
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de la commande #${order.id}`}
      size="lg"
    >
      <div className="space-y-8 max-h-[70vh] overflow-y-auto px-1">
        {updateError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{updateError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* En-tête avec statut et montant */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            {getStatusIcon(order.status as string)}
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{getStatusTitle(order.status as string)}</h3>
              <p className="text-sm text-gray-500">Créée le {formatDateTime(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(order.amount)}
            </span>
            <div className="mt-1">
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </div>
        </div>
        
        {/* Détails principaux */}
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <h3 className="font-medium text-gray-900 mb-3">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiPackage className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Service</p>
                <p className="text-sm text-gray-900">{order.service}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiCalendar className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-sm text-gray-900">{formatDate(order.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiUser className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="text-sm text-gray-900">{order.client}</p>
                <p className="text-xs text-gray-500">ID: {order.clientId}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiUser className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Freelancer</p>
                <p className="text-sm text-gray-900">{order.freelancer}</p>
                <p className="text-xs text-gray-500">ID: {order.freelancerId}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiList className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Catégorie</p>
                <p className="text-sm text-gray-900">{order.category || 'Non spécifiée'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiClock className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Délai de livraison</p>
                <p className="text-sm text-gray-900">{order.deadline ? formatDate(order.deadline) : 'Non spécifié'}</p>
              </div>
            </div>
            
            {order.completionDate && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Date de complétion</p>
                  <p className="text-sm text-gray-900">{formatDate(order.completionDate)}</p>
                </div>
              </div>
            )}
            
            {order.deliveryDate && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiPackage className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Date de livraison</p>
                  <p className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</p>
                </div>
              </div>
            )}
            
            {order.messages !== undefined && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiMessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Messages</p>
                  <p className="text-sm text-gray-900">{order.messages}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Description et exigences */}
        {(order.description || order.requirements) && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Description et exigences</h3>
            {order.description && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-900">{order.description}</p>
                </div>
              </div>
            )}
            {order.requirements && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Exigences du client</p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-900">{order.requirements}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Raison du litige si applicable */}
        {order.disputeReason && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <FiAlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Détails du litige
            </h3>
            <div className="bg-orange-50 p-4 rounded border border-orange-100">
              <p className="text-sm text-gray-800">{order.disputeReason}</p>
            </div>
          </div>
        )}
        
        {/* Transactions liées */}
        {transactions.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Transactions liées</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{transaction.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(transaction.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDateTime(transaction.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Notes administratives */}
        {!showNotesEditor ? (
          order.adminNotes ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Notes administratives</h3>
                {onUpdateNotes && (
                  <button
                    type="button"
                    onClick={toggleNotesEditor}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Modifier
                  </button>
                )}
              </div>
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <p className="text-sm text-gray-800">{order.adminNotes}</p>
              </div>
            </div>
          ) : (
            onUpdateNotes && (
              <div>
                <button
                  type="button"
                  onClick={toggleNotesEditor}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <FiPlusCircle className="mr-1 h-4 w-4" />
                  Ajouter des notes administratives
                </button>
              </div>
            )
          )
        ) : (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Notes administratives</h3>
            <textarea
              rows={4}
              className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Saisissez vos notes ici..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              disabled={isUpdating}
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={toggleNotesEditor}
                className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isUpdating}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveNotes}
                className="inline-flex justify-center items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer avec actions */}
      <div className="mt-6 flex flex-col sm:flex-row-reverse sm:justify-between gap-3">
        <div className="flex flex-row flex-wrap justify-center sm:justify-end gap-3">
          {/* Actions conditionnelles selon le statut */}
          {order.status as string !== 'blocked' && order.status as string !== 'refunded' && onBlockOrder && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => onBlockOrder(order.id)}
              disabled={isUpdating}
            >
              <FiLock className="mr-2 -ml-1 h-4 w-4" />
              Bloquer
            </button>
          )}
          
          {order.status as string !== 'suspended' && order.status as string !== 'blocked' && order.status as string !== 'refunded' && onSuspendOrder && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={() => onSuspendOrder(order.id)}
              disabled={isUpdating}
            >
              <FiPause className="mr-2 -ml-1 h-4 w-4" />
              Suspendre
            </button>
          )}
          
          {(order.status as string === 'suspended' || order.status as string === 'blocked') && onResumeOrder && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onResumeOrder(order.id)}
              disabled={isUpdating}
            >
              <FiPlay className="mr-2 -ml-1 h-4 w-4" />
              Reprendre
            </button>
          )}
          
          {order.status as string !== 'refunded' && order.paymentStatus === 'paid' && onRefundOrder && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => onRefundOrder(order.id)}
              disabled={isUpdating}
            >
              <FiCornerUpRight className="mr-2 -ml-1 h-4 w-4" />
              Rembourser
            </button>
          )}
          
          {(order.status as string === 'cancelled' || order.status as string === 'completed') && onReopenOrder && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => onReopenOrder(order.id)}
              disabled={isUpdating}
            >
              <FiRefreshCw className="mr-2 -ml-1 h-4 w-4" />
              Rouvrir
            </button>
          )}
        </div>
        
        <div className="flex flex-row justify-center sm:justify-start gap-3 mt-3 sm:mt-0">
          <button
            type="button"
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            disabled={isUpdating}
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal; 