import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { 
  FiDollarSign, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiHash, 
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiMessageSquare
} from 'react-icons/fi/index.js';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  formatPrice: (amount: number) => string;
  formatDate: (date: string) => string;
  onUpdateStatus?: (id: string, status: string, notes?: string) => Promise<void>;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  formatPrice,
  formatDate,
  onUpdateStatus
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState(transaction?.adminNotes || '');
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (!transaction) return null;

  // Icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-6 w-6 text-green-500" />;
      case 'pending':
        return <FiClock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <FiRefreshCw className="h-6 w-6 text-blue-500" />;
      case 'failed':
        return <FiXCircle className="h-6 w-6 text-red-500" />;
      case 'cancelled':
        return <FiXCircle className="h-6 w-6 text-gray-500" />;
      default:
        return <FiInfo className="h-6 w-6 text-gray-400" />;
    }
  };

  // Titre de statut
  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Transaction terminée avec succès';
      case 'pending':
        return 'Transaction en attente de traitement';
      case 'processing':
        return 'Transaction en cours de traitement';
      case 'failed':
        return 'Transaction échouée';
      case 'cancelled':
        return 'Transaction annulée';
      default:
        return 'Statut inconnu';
    }
  };

  // Icône de type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <FiTrendingUp className="h-6 w-6 text-green-500" />;
      case 'payout':
        return <FiTrendingDown className="h-6 w-6 text-orange-500" />;
      case 'refund':
        return <FiRefreshCw className="h-6 w-6 text-red-500" />;
      case 'commission':
        return <FiDollarSign className="h-6 w-6 text-indigo-500" />;
      default:
        return <FiDollarSign className="h-6 w-6 text-gray-500" />;
    }
  };

  // Titre de type
  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Paiement pour une commande';
      case 'payout':
        return 'Retrait de fonds';
      case 'refund':
        return 'Remboursement d\'une commande';
      case 'commission':
        return 'Commission plateforme';
      default:
        return 'Transaction';
    }
  };

  // Classe de couleur pour le montant
  const getAmountColorClass = (type: string) => {
    switch (type) {
      case 'payment':
      case 'commission':
        return 'text-green-600';
      case 'payout':
      case 'refund':
        return 'text-red-600';
      default:
        return 'text-gray-700';
    }
  };

  // Préfixe pour le montant
  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'payment':
      case 'commission':
        return '+';
      case 'payout':
      case 'refund':
        return '-';
      default:
        return '';
    }
  };

  // Formatage d'un timestamp en date et heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Mise à jour du statut
  const handleUpdateStatus = async (newStatus: string) => {
    if (!onUpdateStatus) return;

    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await onUpdateStatus(transaction.id, newStatus, adminNotes);
      // La modal sera fermée par le parent après la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setUpdateError('Une erreur est survenue lors de la mise à jour du statut. Veuillez réessayer.');
      setIsUpdating(false);
    }
  };

  // Basculer l'éditeur de notes
  const toggleNotesEditor = () => {
    setShowNotesEditor(!showNotesEditor);
    if (!showNotesEditor) {
      setAdminNotes(transaction.adminNotes || '');
    }
  };

  // Sauvegarder les notes sans changer le statut
  const saveNotes = async () => {
    if (!onUpdateStatus) return;

    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await onUpdateStatus(transaction.id, transaction.status, adminNotes);
      setShowNotesEditor(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
      setUpdateError('Une erreur est survenue lors de la sauvegarde des notes. Veuillez réessayer.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de la transaction #${transaction.id}`}
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
            {getStatusIcon(transaction.status)}
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{getStatusTitle(transaction.status)}</h3>
              <p className="text-sm text-gray-500">{formatDateTime(transaction.date)}</p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
            <span className={`text-xl font-bold ${getAmountColorClass(transaction.type)}`}>
              {getAmountPrefix(transaction.type)}{formatPrice(transaction.amount)}
            </span>
            {transaction.fee > 0 && (
              <span className="text-sm text-gray-500 mt-1">
                Frais: {formatPrice(transaction.fee)}
              </span>
            )}
          </div>
        </div>
        
        {/* Détails principaux */}
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <h3 className="font-medium text-gray-900 mb-3">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiHash className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">ID Transaction</p>
                <p className="text-sm text-gray-900">{transaction.id}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getTypeIcon(transaction.type)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Type de transaction</p>
                <p className="text-sm text-gray-900">{getTypeTitle(transaction.type)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiUser className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                <p className="text-sm text-gray-900">{transaction.user}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiFileText className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-900">{transaction.description}</p>
              </div>
            </div>
            
            {transaction.orderId && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiFileText className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Commande liée</p>
                  <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                    #{transaction.orderId}
                  </p>
                </div>
              </div>
            )}
            
            {transaction.paymentMethod && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiCreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Méthode de paiement</p>
                  <p className="text-sm text-gray-900">{transaction.paymentMethod}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Historique de la transaction */}
        {transaction.history && transaction.history.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="font-medium text-gray-900 mb-3">Historique de la transaction</h3>
            <div className="flow-root">
              <ul className="-mb-8 min-w-[400px]">
                {transaction.history.map((event: any, eventIdx: number) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== transaction.history.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                            {event.icon || <FiClock className="h-5 w-5 text-gray-500" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-gray-500">{event.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={event.datetime}>{formatDateTime(event.datetime)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Notes et métadonnées */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="font-medium text-gray-900 mb-3">Informations supplémentaires</h3>
            <div className="bg-gray-50 rounded p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 min-w-[400px]">
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key} className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Notes administratives */}
        {!showNotesEditor ? (
          transaction.adminNotes ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Notes administratives</h3>
                {onUpdateStatus && (
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
                <p className="text-sm text-gray-800">{transaction.adminNotes}</p>
              </div>
            </div>
          ) : (
            onUpdateStatus && (
              <div>
                <button
                  type="button"
                  onClick={toggleNotesEditor}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <FiMessageSquare className="mr-1 h-4 w-4" />
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
          {transaction.status === 'pending' && onUpdateStatus && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => handleUpdateStatus('completed')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                <>
                  <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                  Approuver
                </>
              )}
            </button>
          )}
          
          {['pending', 'processing'].includes(transaction.status) && onUpdateStatus && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => handleUpdateStatus('failed')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                <>
                  <FiXCircle className="mr-2 -ml-1 h-4 w-4" />
                  Rejeter
                </>
              )}
            </button>
          )}
          
          {['pending'].includes(transaction.status) && onUpdateStatus && (
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => handleUpdateStatus('processing')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2 -ml-1 h-4 w-4" />
                  Mettre en traitement
                </>
              )}
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

export default TransactionDetailsModal; 