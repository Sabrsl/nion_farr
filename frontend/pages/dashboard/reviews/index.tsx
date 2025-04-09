import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiStar, FiThumbsUp, FiFlag, FiMessageSquare, FiFilter, FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi/index.js';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import reviewService from '../../../services/reviewService';
import { Review } from '../../../types';
import UserReviewBadge from '../../../components/dashboard/UserReviewBadge';

type FilterType = 'received' | 'given';
type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type SortBy = 'newest' | 'oldest' | 'highest' | 'lowest';

const ReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<FilterType>('received');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const itemsPerPage = 5;

  // Récupérer les avis en fonction du filtre
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Simuler l'ID de l'utilisateur connecté
        const currentUserId = 'current-user-id';
        const reviews = await reviewService.getUserReviews(
          currentUserId,
          filter === 'received', // Si filter === 'received', on récupère les avis reçus
          20, // limit
          1 // page
        );
        setReviews(reviews);
        setError('');
      } catch (err) {
        console.error('Erreur lors de la récupération des avis:', err);
        setError('Impossible de charger les avis. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [filter]);

  // Filtrer et trier les avis
  useEffect(() => {
    let result = [...reviews];
    
    // Filtrer par notation
    if (ratingFilter !== 'all') {
      const ratingValue = parseInt(ratingFilter);
      result = result.filter(review => 
        Math.floor(review.rating) === ratingValue
      );
    }
    
    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(review => 
        (review.title?.toLowerCase().includes(term) || '') || 
        review.content.toLowerCase().includes(term)
      );
    }
    
    // Trier les résultats
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
    
    setFilteredReviews(result);
    setCurrentPage(1); // Réinitialiser à la première page après un filtre
  }, [reviews, ratingFilter, sortBy, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Basculer l'expansion d'un avis
  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
    setReplyContent('');
  };

  // Soumettre une réponse à un avis
  const handleSubmitReply = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast.error('Veuillez entrer une réponse.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await reviewService.addReviewReply(reviewId, replyContent);
      if (result.success) {
        toast.success('Votre réponse a été envoyée avec succès.');
        setReplyContent('');
        setExpandedReview(null);
        // Rafraîchir les avis
        const currentUserId = 'current-user-id';
        const updatedReviews = await reviewService.getUserReviews(
          currentUserId,
          filter === 'received',
          20,
          1
        );
        setReviews(updatedReviews);
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
  const handleFlagReview = async (reviewId: string) => {
    try {
      const reason = prompt('Pourquoi signalez-vous cet avis?');
      if (!reason) return;

      const result = await reviewService.flagReview({
        reviewId,
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
            } w-4 h-4`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <DashboardLayout title="Évaluations | NionFar.sn">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes évaluations</h1>
          <p className="text-gray-600">
            Consultez et gérez les évaluations que vous avez reçues et celles que vous avez laissées.
          </p>
        </div>

        {/* Barre de filtre et de recherche */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Type d'avis (reçus/donnés) */}
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md ${
                  filter === 'received'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('received')}
              >
                Avis reçus
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  filter === 'given'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('given')}
              >
                Avis donnés
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher dans les avis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtres supplémentaires */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FiFilter className="h-4 w-4 mr-2" />
                Filtres
                <FiChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilterMenu ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Menu déroulant pour les filtres */}
              {showFilterMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1 px-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-3 py-1 text-xs rounded-full ${ratingFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                          onClick={() => setRatingFilter('all')}
                        >
                          Toutes
                        </button>
                        {['5', '4', '3', '2', '1'].map((rating) => (
                          <button
                            key={rating}
                            className={`px-3 py-1 text-xs rounded-full ${ratingFilter === rating ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                            onClick={() => setRatingFilter(rating as RatingFilter)}
                          >
                            {rating} {rating === '1' ? 'étoile' : 'étoiles'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                      >
                        <option value="newest">Plus récents</option>
                        <option value="oldest">Plus anciens</option>
                        <option value="highest">Meilleures notes</option>
                        <option value="lowest">Notes les plus basses</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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

        {/* État vide */}
        {!loading && !error && filteredReviews.length === 0 && (
          <EmptyState
            title="Aucun avis trouvé"
            description={
              filteredReviews.length === 0 && (searchTerm || ratingFilter !== 'all')
                ? 'Aucun avis ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                : filter === 'received'
                ? 'Vous n\'avez pas encore reçu d\'avis. Les avis apparaîtront ici lorsque des clients évalueront vos services.'
                : 'Vous n\'avez pas encore laissé d\'avis. N\'oubliez pas d\'évaluer les services que vous avez utilisés.'
            }
            actionLabel={filter === 'given' ? 'Consulter vos commandes' : undefined}
            onAction={filter === 'given' ? () => router.push('/dashboard/orders') : undefined}
          />
        )}

        {/* Liste des avis */}
        {!loading && !error && filteredReviews.length > 0 && (
          <div className="space-y-6">
            {/* Nombre de résultats */}
            <div className="text-sm text-gray-600 mb-2">
              {filteredReviews.length} avis trouvés
              {(searchTerm || ratingFilter !== 'all') && (
                <button
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                  onClick={() => {
                    setSearchTerm('');
                    setRatingFilter('all');
                    setSortBy('newest');
                  }}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {/* Affichage paginé des avis */}
            {paginatedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="font-medium text-gray-800 flex items-center">
                          {filter === 'received' ? (review.reviewer?.name || 'Client') : (review.service?.title || 'Service')}
                          {filter === 'received' && review.rating >= 4.5 && (
                            <UserReviewBadge 
                              user={review.reviewer}
                              averageRating={4.8}
                              completedOrders={25}
                              size="sm"
                              className="ml-2"
                            />
                          )}
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <div className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{review.title}</h3>
                      <div className="mb-2">{renderRatingStars(review.rating)}</div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                      {/* Bouton pour voir les détails de la commande */}
                      <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                      >
                        Voir mes commandes
                      </button>
                      {/* Bouton pour voir le service */}
                      <button
                        onClick={() => review.service?.id ? router.push(`/services/${review.service.id}`) : router.push('/services')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                      >
                        Voir le service
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{review.content}</p>

                  {/* Réponse existante (si présente) */}
                  {review.reply && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Votre réponse :
                      </p>
                      <p className="text-sm text-gray-600">{review.reply.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.reply.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      {/* Bouton "J'aime" */}
                      <button
                        className="flex items-center text-gray-500 hover:text-indigo-600"
                        aria-label="J'aime"
                      >
                        <FiThumbsUp className="mr-1" />
                        <span className="text-sm">{review.helpfulCount || 0}</span>
                      </button>
                      
                      {/* Bouton Répondre (seulement pour les avis reçus et sans réponse) */}
                      {filter === 'received' && !review.reply && (
                        <button
                          onClick={() => toggleReviewExpand(review.id)}
                          className="flex items-center text-gray-500 hover:text-indigo-600"
                          aria-label="Répondre"
                        >
                          <FiMessageSquare className="mr-1" />
                          <span className="text-sm">Répondre</span>
                        </button>
                      )}
                    </div>

                    {/* Bouton Signaler (seulement pour les avis reçus) */}
                    {filter === 'received' && (
                      <button
                        onClick={() => handleFlagReview(review.id)}
                        className="flex items-center text-gray-500 hover:text-red-500"
                        aria-label="Signaler"
                      >
                        <FiFlag className="mr-1" />
                        <span className="text-sm">Signaler</span>
                      </button>
                    )}
                  </div>

                  {/* Section de réponse (visible uniquement lorsqu'elle est développée) */}
                  <AnimatePresence>
                    {expandedReview === review.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-medium mb-2">Votre réponse</h4>
                          <textarea
                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            placeholder="Écrivez votre réponse ici..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                              onClick={() => setExpandedReview(null)}
                            >
                              Annuler
                            </button>
                            <button
                              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={submitting || !replyContent.trim()}
                            >
                              {submitting ? 'Envoi en cours...' : 'Envoyer'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 sm:px-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, filteredReviews.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredReviews.length}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Précédent</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNum = index + 1;
                        // Afficher uniquement les pages proches de la page actuelle
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                currentPage === pageNum
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } text-sm font-medium`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        // Afficher des ellipses à la place des pages éloignées
                        if (
                          (pageNum === currentPage - 2 && pageNum > 1) ||
                          (pageNum === currentPage + 2 && pageNum < totalPages)
                        ) {
                          return (
                            <span
                              key={`ellipsis-${pageNum}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Suivant</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage;