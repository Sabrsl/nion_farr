import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { FiAlertTriangle, FiCheckCircle, FiDollarSign, FiLoader, FiDownload } from 'react-icons/fi/index.js';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onRefund: (orderId: number, reason: string, amount: number) => void;
  formatPrice: (amount: number) => string;
}

// Étapes du processus de remboursement
enum RefundStep {
  CONFIRMATION = 'confirmation',
  DETAILS = 'details',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}

const RefundModal: React.FC<RefundModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  onRefund,
  formatPrice 
}) => {
  const [currentStep, setCurrentStep] = useState<RefundStep>(RefundStep.CONFIRMATION);
  const [reason, setReason] = useState<string>('Annulation à la demande du client');
  const [notes, setNotes] = useState<string>('');
  const [isPartialRefund, setIsPartialRefund] = useState<boolean>(false);
  const [refundAmount, setRefundAmount] = useState<number>(order?.amount || 0);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);
  const [refundError, setRefundError] = useState<string>('');

  // Réinitialiser le formulaire lors de l'ouverture/fermeture
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(RefundStep.CONFIRMATION);
      setReason('Annulation à la demande du client');
      setNotes('');
      setIsPartialRefund(false);
      setRefundAmount(order?.amount || 0);
      setRefundError('');
    }
  }, [isOpen, order]);

  // Validation du montant de remboursement
  const isRefundAmountValid = () => {
    return refundAmount > 0 && refundAmount <= (order?.amount || 0);
  };

  // Passage à l'étape suivante
  const goToNextStep = () => {
    if (currentStep === RefundStep.CONFIRMATION) {
      setCurrentStep(RefundStep.DETAILS);
    } else if (currentStep === RefundStep.DETAILS) {
      processRefund();
    }
  };

  // Traitement du remboursement
  const processRefund = () => {
    if (!isRefundAmountValid()) {
      setRefundError('Le montant du remboursement doit être supérieur à 0 et inférieur ou égal au montant de la commande.');
      return;
    }

    setRefundLoading(true);
    setCurrentStep(RefundStep.PROCESSING);
    
    // Simuler le traitement du remboursement
    setTimeout(() => {
      try {
        onRefund(order.id, reason, refundAmount);
        setCurrentStep(RefundStep.COMPLETED);
      } catch (error) {
        setRefundError('Une erreur est survenue lors du traitement du remboursement.');
        setCurrentStep(RefundStep.DETAILS);
      } finally {
        setRefundLoading(false);
      }
    }, 2000);
  };

  // Générateur de rapport de remboursement
  const generateRefundReport = () => {
    // Dans une vraie application, cela pourrait créer un PDF ou un fichier CSV
    // Pour cette démo, on va simplement créer un objet avec les données
    const reportData = {
      orderId: order.id,
      refundId: `REF-${order.id}-${Date.now().toString().slice(-6)}`,
      clientName: order.client,
      freelancerName: order.freelancer,
      service: order.service,
      amount: refundAmount,
      currency: 'XOF',
      reason,
      notes,
      date: new Date().toISOString(),
      refundedBy: 'Admin Système',
      partialRefund: isPartialRefund,
      originalAmount: order.amount
    };
    
    // Simuler le téléchargement d'un fichier
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `refund-report-${order.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Contenu de l'étape de confirmation
  const renderConfirmationStep = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Vous êtes sur le point de rembourser la commande <strong>#{order.id}</strong>. Cette action est irréversible et entraînera les conséquences suivantes :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>La commande sera marquée comme annulée</li>
                <li>Le paiement sera remboursé au client</li>
                <li>Le freelance sera notifié de l'annulation</li>
                <li>Les fonds réservés seront libérés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Détails de la commande</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Client :</span> {order.client}
          </div>
          <div>
            <span className="text-gray-500">Freelance :</span> {order.freelancer}
          </div>
          <div>
            <span className="text-gray-500">Service :</span> {order.service}
          </div>
          <div>
            <span className="text-gray-500">Montant :</span> {formatPrice(order.amount)}
          </div>
          <div>
            <span className="text-gray-500">Date :</span> {new Date(order.date).toLocaleDateString()}
          </div>
          <div>
            <span className="text-gray-500">Statut :</span> {order.status}
          </div>
        </div>
      </div>
    </div>
  );

  // Contenu de l'étape de détails
  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Raison du remboursement
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="Annulation à la demande du client">Annulation à la demande du client</option>
          <option value="Service non conforme">Service non conforme</option>
          <option value="Retard de livraison">Retard de livraison</option>
          <option value="Problème de qualité">Problème de qualité</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes internes (optionnel)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Détails supplémentaires sur la raison du remboursement..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="partial-refund"
          checked={isPartialRefund}
          onChange={(e) => setIsPartialRefund(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="partial-refund" className="ml-2 block text-sm text-gray-900">
          Remboursement partiel
        </label>
      </div>

      {isPartialRefund && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant à rembourser
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">XOF</span>
            </div>
            <input
              type="number"
              className="w-full pl-12 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
              min={1}
              max={order.amount}
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">/ {order.amount}</span>
            </div>
          </div>
          {!isRefundAmountValid() && (
            <p className="mt-1 text-sm text-red-600">
              Le montant doit être supérieur à 0 et inférieur ou égal à {formatPrice(order.amount)}
            </p>
          )}
        </div>
      )}

      {refundError && (
        <div className="text-red-600 text-sm mt-2">{refundError}</div>
      )}
    </div>
  );

  // Contenu de l'étape de traitement
  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Traitement en cours</h3>
      <p className="text-sm text-gray-500 text-center">
        Nous traitons actuellement le remboursement de la commande #{order.id}.<br />
        Veuillez patienter...
      </p>
    </div>
  );

  // Contenu de l'étape terminée
  const renderCompletedStep = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="bg-green-100 rounded-full p-2 mb-4">
        <FiCheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Remboursement effectué</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        Le remboursement de la commande #{order.id} a été traité avec succès.<br />
        Un e-mail de confirmation a été envoyé au client et au freelance.
      </p>
      <div className="bg-gray-50 w-full p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Récapitulatif</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Montant remboursé :</span> {formatPrice(refundAmount)}
          </div>
          <div>
            <span className="text-gray-500">Raison :</span> {reason}
          </div>
          <div>
            <span className="text-gray-500">Date :</span> {new Date().toLocaleDateString()}
          </div>
          <div>
            <span className="text-gray-500">Référence :</span> REF-{order.id}-{Date.now().toString().slice(-6)}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={generateRefundReport}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <FiDownload className="mr-1 h-4 w-4" />
            Télécharger le rapport de remboursement
          </button>
        </div>
      </div>
    </div>
  );

  // Déterminer le contenu en fonction de l'étape actuelle
  const renderContent = () => {
    switch (currentStep) {
      case RefundStep.CONFIRMATION:
        return renderConfirmationStep();
      case RefundStep.DETAILS:
        return renderDetailsStep();
      case RefundStep.PROCESSING:
        return renderProcessingStep();
      case RefundStep.COMPLETED:
        return renderCompletedStep();
      default:
        return null;
    }
  };

  // Obtenir le titre de la modale en fonction de l'étape
  const getModalTitle = () => {
    switch (currentStep) {
      case RefundStep.CONFIRMATION:
        return 'Confirmer le remboursement';
      case RefundStep.DETAILS:
        return 'Détails du remboursement';
      case RefundStep.PROCESSING:
        return 'Traitement du remboursement';
      case RefundStep.COMPLETED:
        return 'Remboursement effectué';
      default:
        return 'Remboursement';
    }
  };

  // Gestion améliorée de la fermeture
  const handleClose = () => {
    // Si l'étape est "traitement", ne pas permettre la fermeture
    if (currentStep === RefundStep.PROCESSING) {
      return;
    }
    
    // Si l'étape est "terminé", permettre de fermer sans délai
    if (currentStep === RefundStep.COMPLETED) {
      onClose();
      return;
    }
    
    // Pour les autres étapes, demander confirmation avant de fermer
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce remboursement ? Les données saisies seront perdues.')) {
      onClose();
    }
  };

  // Pied de page avec les boutons d'action
  const renderFooter = () => {
    if (currentStep === RefundStep.PROCESSING) {
      return null;
    }

    if (currentStep === RefundStep.COMPLETED) {
      return (
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={generateRefundReport}
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Télécharger le rapport
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-between">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleClose}
        >
          Annuler
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={goToNextStep}
          disabled={currentStep === RefundStep.DETAILS && (!reason || (isPartialRefund && !isRefundAmountValid()))}
        >
          {currentStep === RefundStep.CONFIRMATION ? 'Continuer' : 'Confirmer le remboursement'}
        </button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
      closeOnBackdropClick={currentStep !== RefundStep.PROCESSING}
      closeOnEscape={currentStep !== RefundStep.PROCESSING}
      footer={renderFooter()}
    >
      {renderContent()}
    </Modal>
  );
};

export default RefundModal; 