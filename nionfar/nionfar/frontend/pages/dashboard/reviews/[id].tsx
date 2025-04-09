import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { FiArrowLeft, FiStar, FiThumbsUp, FiFlag, FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi/index.js';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import { toast } from 'react-toastify';
import reviewService from '../../../services/reviewService';
import { Review } from '../../../types';

interface ReviewDetailPageProps {
  reviewId: string;
}

const ReviewDetailPage: React.FC<ReviewDetailPageProps> = ({ reviewId }) => {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Récupérer les détails de l'avis
  useEffect(() => {
    const fetchReviewDetails = async () => {
      setLoading(true);
      try {
        // Normalement, on ferait un appel à une API pour récupérer les détails de l'avis
        // Pour la démo, on va simuler un avis avec reviewService
        
        // Simuler l'ID de l'utilisateur connecté
        const currentUserId = 'current-user-id';
        const reviewsList = await reviewService.getUserReviews(currentUserId, true, 5, 1);
        
        // Trouver l'avis avec l'ID correspondant ou prendre le premier avis (pour la démo)
        const foundReview = reviewsList.find(r => r.id === reviewId) || reviewsList[0];
        
        if (foundReview) {
          setReview(foundReview);
          setError('');
        } else {
          setError('Avis introuvable.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails de l\'avis:', err);
        setError('Impossible de charger les détails de l\'avis. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) {
      fetchReviewDetails();
    }
  }, [reviewId]);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Soumettre une réponse à l'avis
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !review) {
      toast.error('Veuillez entrer une réponse.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await reviewService.addReviewReply(review.id, replyContent);
      if (result.success) {
        toast.success('Votre réponse a été envoyée avec succès.');
        setReplyContent('');
        // Normalement, on rafraîchirait l'avis avec la nouvelle réponse
        // Pour la démo, on simule cela en redirigeant vers la liste des avis
        router.push('/dashboard/reviews');
      } else {
        toast.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la réponse:', err);
      toast.error('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  // Gérer le signalement d'un avis
  const handleFlagReview = async () => {
    if (!review) return;

    try {
      const reason = prompt('Pourquoi signalez-vous cet avis?');
      if (!reason) return;

      const result = await reviewService.flagReview({
        reviewId: review.id,
        userId: 'current-user-id',
        reason
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors du signalement de l\'avis:', err);
      toast.error('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  // Rendu des étoiles pour la note
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`${
              index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            } w-5 h-5`}
          />
        ))}
        <span className="ml-2 text-lg font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec retour */}
        <div className="mb-6">
          <Link 
            href="/dashboard/reviews" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Retour aux évaluations
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Détail de l'évaluation</h1>
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center my-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Message d'erreur */}
        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Détails de l'avis */}
        {!loading && !error && review && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête de l'avis */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{review.title}</h2>
                  <div className="mb-3">{renderRatingStars(review.rating)}</div>
                </div>
                <div className="flex items-center space-x-4 mt-3 md:mt-0">
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/dashboard/orders')}
                  >
                    Voir mes commandes
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => router.push(`/services/${review.service?.id || '#'}`)}
                  >
                    Voir le service
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                <div className="flex items-center mr-6 mb-2">
                  <FiUser className="mr-1" />
                  <span>Par {review.reviewer.name}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <FiCalendar className="mr-1" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex items-center mb-2">
                  <FiThumbsUp className="mr-1" />
                  <span>{review.helpfulCount || 0} mentions J'aime</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleFlagReview}
                  className="flex items-center text-gray-500 hover:text-red-500"
                  aria-label="Signaler"
                >
                  <FiFlag className="mr-1" />
                  <span className="text-sm">Signaler</span>
                </button>
              </div>
            </div>
            
            {/* Section de réponse */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Répondre à cette évaluation</h3>
              
              <div className="mb-4">
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Écrivez votre réponse ici..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer la réponse'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  return {
    props: {
      reviewId: id,
    },
  };
};

export default ReviewDetailPage; 