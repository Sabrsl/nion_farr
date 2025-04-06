import React, { useState } from 'react';
import { FiStar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Order, User, Review } from '../../types';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';

interface ReviewFormProps {
  order: Order;
  currentUser: User;
  onReviewSubmitted?: (review: Review) => void;
  isClientReview?: boolean; // Si true, c'est le client qui note le vendeur; si false, c'est le vendeur qui note le client
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  order,
  currentUser,
  onReviewSubmitted,
  isClientReview = true
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [contentWarning, setContentWarning] = useState<string | null>(null);

  // Déterminer le destinataire du review (client ou prestataire)
  const recipientId = isClientReview 
    ? (order as any).service?.provider?.id || 'provider-id'
    : (order as any).client?.id || 'client-id';

  // Vérifier le contenu pour détecter les termes inappropriés
  const checkContent = async () => {
    if (!content || content.length < 10) return;
    
    try {
      const result = await reviewService.checkInappropriateContent(content);
      if (result.isInappropriate) {
        setContentWarning(`Votre avis contient du contenu potentiellement inapproprié: ${result.reasons.join(', ')}`);
      } else {
        setContentWarning(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du contenu:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez attribuer une note');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Veuillez ajouter un titre à votre avis');
      return;
    }
    
    if (!content.trim() || content.length < 20) {
      toast.error('Veuillez rédiger un commentaire d\'au moins 20 caractères');
      return;
    }
    
    if (contentWarning) {
      const confirmSubmit = window.confirm('Votre avis contient du contenu potentiellement inapproprié. Voulez-vous quand même le soumettre?');
      if (!confirmSubmit) return;
    }
    
    setSubmitting(true);
    setFeedbackMessage(null);
    
    try {
      const result = await reviewService.submitReview({
        orderId: order.id,
        reviewerId: currentUser.id,
        recipientId,
        serviceId: (order as any).service?.id || order.serviceId,
        rating,
        title,
        content,
        isPublic
      });
      
      if (result.success && result.review) {
        setFeedbackMessage({
          type: 'success',
          message: 'Votre avis a été soumis avec succès !'
        });
        
        if (onReviewSubmitted) {
          onReviewSubmitted(result.review);
        }
        
        // Réinitialiser le formulaire
        setRating(0);
        setTitle('');
        setContent('');
      } else {
        setFeedbackMessage({
          type: 'error',
          message: result.message || 'Une erreur est survenue lors de la soumission de votre avis'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      setFeedbackMessage({
        type: 'error',
        message: 'Une erreur est survenue lors de la soumission de votre avis'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isClientReview 
            ? 'Évaluer votre expérience avec ce vendeur' 
            : 'Évaluer votre expérience avec ce client'}
        </h2>
        <p className="text-gray-600">
          Votre avis aide notre communauté à prendre des décisions éclairées.
          {isPublic && ' Il sera visible publiquement sur le profil du vendeur.'}
        </p>
      </div>
      
      {feedbackMessage && (
        <div 
          className={`p-4 mb-6 rounded-lg ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex">
            {feedbackMessage.type === 'success' ? (
              <FiCheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            )}
            <span>{feedbackMessage.message}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Notation par étoiles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="focus:outline-none transition-colors"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <FiStar 
                  className={`h-8 w-8 ${
                    (hoveredRating ? value <= hoveredRating : value <= rating) 
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
            <span className="ml-2 text-gray-700">
              {rating > 0 ? `${rating}/5` : 'Cliquez pour noter'}
            </span>
          </div>
        </div>
        
        {/* Titre de l'avis */}
        <div className="mb-4">
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de votre avis
          </label>
          <input
            type="text"
            id="review-title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Résumez votre expérience en une phrase"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        
        {/* Contenu de l'avis */}
        <div className="mb-4">
          <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
            Votre commentaire détaillé
          </label>
          <textarea
            id="review-content"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Partagez les détails de votre expérience avec ce vendeur"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.length > 20) {
                checkContent();
              } else {
                setContentWarning(null);
              }
            }}
            onBlur={checkContent}
            minLength={20}
            maxLength={1000}
            required
          />
          
          {contentWarning && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              <FiAlertCircle className="inline-block mr-1" />
              {contentWarning}
            </div>
          )}
          
          <p className="mt-1 text-sm text-gray-500">
            Minimum 20 caractères, maximum 1000 caractères. Évitez les insultes, les informations personnelles et tout contenu inapproprié.
          </p>
        </div>
        
        {/* Visibilité de l'avis */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="is-public"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="is-public" className="ml-2 block text-sm text-gray-700">
              Rendre cet avis public
            </label>
          </div>
          <p className="mt-1 ml-6 text-xs text-gray-500">
            Si décoché, votre avis ne sera visible que par vous et l'administrateur du site.
          </p>
        </div>
        
        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={submitting || rating === 0 || !title.trim() || !content.trim() || content.length < 20}
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre votre avis'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 