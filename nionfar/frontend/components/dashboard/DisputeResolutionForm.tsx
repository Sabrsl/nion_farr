import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Dispute, ResolutionType } from '../../types';
import disputeService from '../../services/disputeService';
import { useAuth } from '../../contexts/AuthContext';
import ResolutionTypeSelector from './ResolutionTypeSelector';

interface DisputeResolutionFormProps {
  dispute: Dispute;
  onResolved: () => void;
}

const DisputeResolutionForm: React.FC<DisputeResolutionFormProps> = ({
  dispute,
  onResolved
}) => {
  const { user } = useAuth();
  const [resolution, setResolution] = useState<ResolutionType | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canResolve = 
    (dispute.status === 'ouvert' || 
     dispute.status === 'en_traitement' || 
     dispute.status === 'en_attente_de_reponse') &&
    user?.role === 'admin';

  const handleResolutionChange = (value: ResolutionType) => {
    setResolution(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Vous devez être connecté en tant qu\'administrateur pour résoudre ce litige');
      return;
    }
    
    if (!resolution) {
      setError('Veuillez sélectionner un type de résolution');
      return;
    }
    
    if (!comment.trim() || comment.length < 10) {
      setError('Veuillez ajouter un commentaire détaillé (minimum 10 caractères)');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const result = await disputeService.resolveDispute(
        dispute.id,
        user.id,
        resolution,
        comment
      );
      
      if (result.success) {
        toast.success('Le litige a été résolu avec succès');
        setResolution('');
        setComment('');
        onResolved();
      } else {
        setError(result.message || 'Une erreur est survenue lors de la résolution du litige');
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du litige:', error);
      setError('Une erreur est survenue lors de la résolution du litige');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canResolve) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Résoudre le litige</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <ResolutionTypeSelector 
            value={resolution} 
            onChange={handleResolutionChange}
            disabled={isSubmitting}
          />
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire de résolution
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Expliquez votre décision de résolution..."
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Votre commentaire sera visible par le client et le vendeur. Soyez clair et précis.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Résolution en cours...' : 'Résoudre le litige'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DisputeResolutionForm; 