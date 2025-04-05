import React, { useState } from 'react';
import { FiClock, FiCheckCircle, FiClipboard, FiDownload, FiAlertTriangle, FiThumbsUp, FiRepeat, FiEdit, FiMessageSquare, FiCheck, FiXCircle, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Order, OrderStatus, User } from '../../types';
import DisputeModal from './DisputeModal';
import ReviewModal from './ReviewModal';
import Link from 'next/link';

interface OrderActionsProps {
  order: Order;
  currentUser: User;
  onStatusChange?: (newStatus: string) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, currentUser, onStatusChange }) => {
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const isClient = currentUser.role === 'client';
  const isSeller = currentUser.role === 'provider';
  
  // Vérification si l'utilisateur a déjà évalué cette commande (à implémenter avec une API réelle)
  const [hasReviewed, setHasReviewed] = useState(false);
  
  // Fonction pour accepter une commande (pour les vendeurs)
  const handleAcceptOrder = async () => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onStatusChange) {
        onStatusChange('in_progress');
      }
      
      toast.success('Commande acceptée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la commande:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  // Fonction pour refuser une commande (pour les vendeurs)
  const handleRejectOrder = async () => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onStatusChange) {
        onStatusChange('cancelled');
      }
      
      toast.info('Commande refusée.');
    } catch (error) {
      console.error('Erreur lors du refus de la commande:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  // Fonction pour marquer comme terminée (pour les vendeurs)
  const handleCompleteOrder = async () => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onStatusChange) {
        onStatusChange('completed');
      }
      
      toast.success('Commande marquée comme terminée !');
    } catch (error) {
      console.error('Erreur lors de la complétion de la commande:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  // Fonction pour ouvrir le modal de litige
  const openDisputeModal = () => {
    setIsDisputeModalOpen(true);
  };
  
  // Fonction pour ouvrir le modal d'évaluation
  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };
  
  // Fonction appelée lorsqu'une évaluation est soumise
  const handleReviewSubmitted = () => {
    setHasReviewed(true);
    // Dans une application réelle, mettre à jour l'état avec une API
  };

  const handleDisputeSubmitted = () => {
    setIsDisputeModalOpen(false);
    if (onStatusChange) {
      onStatusChange('dispute');
    }
  };

  // Rendu des actions en fonction du statut de la commande et du rôle de l'utilisateur
  const renderActions = () => {
    // Utiliser des assertions de type pour éviter les erreurs de typage avec les statuts français
    const status = order.status;
    
    // Vérifie si le statut correspond à "en attente"
    const isPending = 
      status === 'pending' || 
      (status as any) === 'en_attente' || 
      (status as any) === 'en_attente_acceptation' || 
      (status as any) === 'en_attente_paiement';
    
    // Vérifie si le statut correspond à "en cours"
    const isInProgress = 
      status === 'in_progress' || 
      (status as any) === 'en_cours';
    
    // Vérifie si le statut correspond à "terminé"
    const isCompleted = 
      status === 'completed' || 
      (status as any) === 'terminé' || 
      (status as any) === 'terminée';
    
    // Vérifie si le statut correspond à "annulé"
    const isCancelled = 
      status === 'cancelled' || 
      (status as any) === 'annulé' || 
      (status as any) === 'annulée';
    
    // Vérifie si le statut correspond à "litige"
    const isDispute = 
      status === 'dispute' || 
      (status as any) === 'litige';

    if (isPending) {
      if (isSeller) {
        return (
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleAcceptOrder}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <FiCheck className="mr-2" /> Accepter la commande
            </button>
            <button
              onClick={handleRejectOrder}
              className="w-full bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 transition-colors flex items-center justify-center"
            >
              <FiXCircle className="mr-2" /> Refuser la commande
            </button>
          </div>
        );
      }
      return (
        <div className="text-sm text-gray-600">
          En attente d'acceptation par le vendeur...
        </div>
      );
    }
    
    if (isInProgress) {
      if (isSeller) {
        return (
          <div className="flex flex-col space-y-3">
            <Link href={`/dashboard/orders/${order.id}/deliver`} className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center">
              <FiDownload className="mr-2" /> Livrer la commande
            </Link>
            <button
              onClick={handleCompleteOrder}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FiCheck className="mr-2" /> Marquer comme terminée
            </button>
          </div>
        );
      }
      if (isClient) {
        return (
          <div className="flex flex-col space-y-3">
            <Link href={`/dashboard/messages?order=${order.id}`} className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center">
              <FiMessageSquare className="mr-2" /> Contacter le vendeur
            </Link>
            <button
              onClick={openDisputeModal}
              className="w-full bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 transition-colors flex items-center justify-center"
            >
              <FiAlertTriangle className="mr-2" /> Signaler un problème
            </button>
          </div>
        );
      }
      return null;
    }
    
    if (isCompleted) {
      if (isClient && !hasReviewed) {
        return (
          <div className="flex flex-col space-y-3">
            <button
              onClick={openReviewModal}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <FiStar className="mr-2" /> Évaluer cette commande
            </button>
            <Link href={`/dashboard/messages?order=${order.id}`} className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center">
              <FiMessageSquare className="mr-2" /> Contacter le vendeur
            </Link>
          </div>
        );
      }
      if (isSeller && !hasReviewed) {
        return (
          <div className="flex flex-col space-y-3">
            <button
              onClick={openReviewModal}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <FiStar className="mr-2" /> Évaluer ce client
            </button>
            <Link href={`/dashboard/messages?order=${order.id}`} className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center">
              <FiMessageSquare className="mr-2" /> Contacter le client
            </Link>
          </div>
        );
      }
      if (hasReviewed) {
        return (
          <div className="flex flex-col space-y-3">
            <div className="text-sm text-green-600 flex items-center">
              <FiCheck className="mr-2" /> Évaluation soumise
            </div>
            <Link href={`/dashboard/messages?order=${order.id}`} className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center">
              <FiMessageSquare className="mr-2" /> Contacter l'{isSeller ? 'acheteur' : 'vendeur'}
            </Link>
          </div>
        );
      }
      return null;
    }
    
    if (isCancelled) {
      return (
        <div className="text-sm text-red-600">
          Cette commande a été annulée.
        </div>
      );
    }
    
    if (isDispute) {
      return (
        <div className="flex flex-col space-y-3">
          <Link href={`/dashboard/disputes?order=${order.id}`} className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors flex items-center justify-center">
            <FiAlertTriangle className="mr-2" /> Voir le litige
          </Link>
          <Link href={`/dashboard/messages?order=${order.id}`} className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center">
            <FiMessageSquare className="mr-2" /> Contacter l'{isSeller ? 'acheteur' : 'vendeur'}
          </Link>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
      {renderActions()}
      
      {/* Modal de litige */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        orderId={order.id}
        onDisputeSubmitted={handleDisputeSubmitted}
      />
      
      {/* Modal d'évaluation */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={order}
        currentUser={currentUser}
        onReviewSubmitted={handleReviewSubmitted}
        isClientReview={isClient}
      />
    </div>
  );
};

export default OrderActions; 