import React, { useState } from 'react';
import { FiRepeat, FiHelpCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface RevisionRequestFormProps {
  orderId: string;
  onRequestRevision: (message: string) => Promise<boolean>;
}

const RevisionRequestForm: React.FC<RevisionRequestFormProps> = ({ 
  orderId, 
  onRequestRevision 
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message || message.length < 10) {
      toast.error('Veuillez décrire clairement les modifications souhaitées (minimum 10 caractères).');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onRequestRevision(message);
      
      if (success) {
        setMessage('');
        toast.success('Votre demande de révision a été envoyée avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de révision:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de la demande de révision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Demander une révision
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          Expliquez clairement au vendeur les modifications que vous souhaitez apporter à la livraison.
        </p>
        
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <FiHelpCircle className="mr-1 h-4 w-4" />
            {showTips ? 'Masquer les conseils' : 'Conseils pour une demande efficace'}
          </button>
          
          {showTips && (
            <div className="mt-2 p-3 bg-indigo-50 rounded-md border border-indigo-100">
              <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
                <li>Soyez précis et détaillé dans vos demandes</li>
                <li>Utilisez des exemples ou des références si possible</li>
                <li>Faites référence à des parties spécifiques du travail</li>
                <li>Restez courtois et constructif</li>
                <li>Expliquez le "pourquoi" de vos demandes pour aider le vendeur</li>
              </ul>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="revision-message" className="block text-sm font-medium text-gray-700 mb-1">
              Détails de votre demande
            </label>
            <textarea
              id="revision-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez précisément les modifications que vous souhaitez..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length} caractères (minimum recommandé: 50)
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <p>Vous pouvez demander plusieurs révisions tant que vous n'avez pas approuvé la livraison finale.</p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || message.length < 10}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FiRepeat className="mr-2 -ml-1 h-4 w-4" />
                  Demander une révision
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevisionRequestForm; 