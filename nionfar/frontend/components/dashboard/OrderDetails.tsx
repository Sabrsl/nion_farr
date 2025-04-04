import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '../../types';
import OrderStatusBadge from './OrderStatusBadge';
import OrderActions from './OrderActions';
import DeliverableForm from './DeliverableForm';
import RevisionRequestForm from './RevisionRequestForm';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, 
  FiCalendar, 
  FiMessageSquare, 
  FiUser, 
  FiFile,
  FiLink,
  FiChevronRight,
  FiCheckCircle
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface OrderDetailsProps {
  order: Order;
  isSeller: boolean;
  isLoading?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  order: initialOrder, 
  isSeller,
  isLoading = false,
  onStatusChange
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  // Mise à jour de l'état local de la commande
  const updateOrderStatus = (newStatus: OrderStatus) => {
    setOrder(prev => ({
      ...prev,
      status: newStatus
    }));
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Handler pour accepter une commande
  const handleAcceptOrder = async () => {
    try {
      setIsActionInProgress(true);
      // Appel API à implémenter
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateOrderStatus('en_cours');
      toast.success('La commande a été acceptée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la commande:', error);
      toast.error('Une erreur est survenue lors de l\'acceptation de la commande');
      throw error;
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handler pour refuser une commande
  const handleRejectOrder = async () => {
    try {
      setIsActionInProgress(true);
      // Appel API à implémenter
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateOrderStatus('annulée');
      toast.success('La commande a été refusée');
    } catch (error) {
      console.error('Erreur lors du refus de la commande:', error);
      toast.error('Une erreur est survenue lors du refus de la commande');
      throw error;
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handler pour livrer une commande
  const handleDeliverOrder = () => {
    setShowDeliverForm(true);
    setShowRevisionForm(false);
  };

  // Handler pour approuver une livraison
  const handleApproveDelivery = async () => {
    try {
      setIsActionInProgress(true);
      // Appel API à implémenter
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateOrderStatus('terminée');
      toast.success('La livraison a été approuvée et la commande est terminée');
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la livraison:', error);
      toast.error('Une erreur est survenue lors de l\'approbation de la livraison');
      throw error;
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handler pour ouvrir le formulaire de révision
  const handleRequestRevision = () => {
    setShowRevisionForm(true);
    setShowDeliverForm(false);
  };

  // Handler pour ouvrir un litige
  const handleOpenDispute = () => {
    toast.info('La fonctionnalité de litige sera disponible prochainement');
  };

  // Handler pour ouvrir la conversation
  const handleMessageClick = () => {
    // Navigation à implémenter
    window.location.href = `/dashboard/messages?order=${order.id}`;
  };

  // Handler pour soumettre une livraison
  const handleSubmitDelivery = async (message: string, files: File[]) => {
    try {
      setIsActionInProgress(true);
      // Appel API à implémenter
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDeliverForm(false);
      updateOrderStatus('livré');
      toast.success('Votre livraison a été envoyée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la livraison:', error);
      toast.error('Une erreur est survenue lors de la livraison');
      return false;
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handler pour soumettre une demande de révision
  const handleSubmitRevisionRequest = async (message: string) => {
    try {
      setIsActionInProgress(true);
      // Appel API à implémenter
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowRevisionForm(false);
      updateOrderStatus('en_modification');
      toast.success('Votre demande de révision a été envoyée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de révision:', error);
      toast.error('Une erreur est survenue lors de la demande de révision');
      return false;
    } finally {
      setIsActionInProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* En-tête de la commande */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{order.title}</h1>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">
                  Commande #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-gray-500 mr-3">
                  |
                </span>
                <span className="text-sm text-gray-500">
                  Créée le {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-2">Prix de la commande</div>
              <div className="text-xl font-bold text-gray-900">{formatPrice(order.price)}</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-2">Date d'échéance</div>
              <div className="flex items-center">
                <FiCalendar className="h-5 w-5 text-gray-400 mr-1.5" />
                <span className="text-lg font-medium text-gray-900">{formatDate(order.deadline)}</span>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-2">
                {isSeller ? 'Client' : 'Vendeur'}
              </div>
              <div className="flex items-center">
                <img 
                  src={isSeller ? order.client.avatar : order.service.provider?.avatar || '/img/avatars/placeholder.png'} 
                  alt={isSeller ? order.client.username : order.service.provider?.username || 'Utilisateur'} 
                  className="h-8 w-8 rounded-full mr-2"
                />
                <span className="text-lg font-medium text-gray-900">
                  {isSeller ? order.client.username : order.service.provider?.username}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <OrderActions 
            order={order} 
            currentUser={{
              id: 'current-user',
              role: isSeller ? 'freelancer' : 'client'
            }} 
            onStatusChange={(newStatus) => updateOrderStatus(newStatus as OrderStatus)} 
          />
        </div>
      </motion.div>

      {/* Détails de la commande */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Détails du service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du service</h2>
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={order.service.images[0] || "/img/services/placeholder.jpg"} 
                    alt={order.service.title} 
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">{order.service.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{order.service.description}</p>
                  <div className="flex items-center">
                    <FiClock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">Délai de livraison: {order.service.deliveryTime} jours</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/services/${order.service.slug}`}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                <FiLink className="mr-1 h-4 w-4" />
                Voir la page du service
              </Link>
            </div>
          </motion.div>

          {/* Exigences du client */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exigences du client</h2>
              <div className="prose prose-sm prose-indigo max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{order.requirements}</p>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de livraison (si applicable) */}
          <AnimatePresence>
            {showDeliverForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <DeliverableForm 
                  orderId={order.id} 
                  onSubmit={handleSubmitDelivery} 
                  isRevision={order.status === 'en_modification'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire de demande de révision (si applicable) */}
          <AnimatePresence>
            {showRevisionForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <RevisionRequestForm 
                  orderId={order.id} 
                  onRequestRevision={handleSubmitRevisionRequest} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification de succès pour les actions complétées */}
          {order.status === 'terminée' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start"
            >
              <div className="flex-shrink-0 mt-0.5">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Commande terminée avec succès</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Cette commande a été livrée et validée. Nous espérons que vous êtes satisfait du résultat !</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          {/* Résumé de la commande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Prix du service</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(order.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Frais de service</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(order.price * 0.1)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">{formatPrice(order.price * 1.1)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Métriques importantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations importantes</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Date de création</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Date d'échéance</p>
                    <p className="text-sm text-gray-500">{formatDate(order.deadline)}</p>
                  </div>
                </li>
                {order.deliveryValidationDeadline && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Date limite d'approbation</p>
                      <p className="text-sm text-gray-500">{formatDate(order.deliveryValidationDeadline)}</p>
                    </div>
                  </li>
                )}
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiMessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Messages</p>
                    <p className="text-sm text-gray-500">{order.messages} messages</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {isSeller ? 'Client' : 'Vendeur'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isSeller ? order.client.username : order.service.provider?.username}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Overlay de chargement lors des actions */}
      {isActionInProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
            <p className="text-gray-700 font-medium">Traitement en cours...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetails; 