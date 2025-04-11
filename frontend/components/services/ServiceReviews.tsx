import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiStar, FiThumbsUp, FiThumbsDown, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi/index.js';
import { Rating } from '../ui/Rating';
import { Avatar } from '../ui/Avatar';
import axios from 'axios';

interface Review {
  id: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  likes: number;
  isHelpful?: boolean;
  reply?: {
    content: string;
    createdAt: string;
  };
}

interface ServiceReviewsProps {
  serviceId: string;
  rating: number;
  totalReviews: number;
  className?: string;
  initialReviews?: Review[];
}

export const ServiceReviews: React.FC<ServiceReviewsProps> = ({ 
  serviceId, 
  rating, 
  totalReviews,
  className = '',
  initialReviews
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Calcul des pourcentages pour la distribution des avis - mémorisé pour éviter les recalculs inutiles
  const ratingDistribution = useMemo(() => ({
    5: Math.round((totalReviews * 0.7)), // 70% sont 5 étoiles
    4: Math.round((totalReviews * 0.2)), // 20% sont 4 étoiles
    3: Math.round((totalReviews * 0.05)), // 5% sont 3 étoiles
    2: Math.round((totalReviews * 0.03)), // 3% sont 2 étoiles
    1: Math.round((totalReviews * 0.02)), // 2% sont 1 étoile
  }), [totalReviews]);

  // Formater les dates (mémorisé pour chaque review)
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  // Gérer les likes des reviews
  const handleLikeReview = useCallback((reviewId: string) => {
    setReviews(prevReviews => prevReviews.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1, isHelpful: true } 
        : review
    ));
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = useCallback((stars: number | null) => {
    setFilter(prevFilter => prevFilter === stars ? null : stars);
    setShowFilterMenu(false);
  }, []);

  // Effet pour charger les reviews
  useEffect(() => {
    // Si nous avons déjà des reviews initiales, ne pas charger
    if (initialReviews && initialReviews.length > 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données simulées
        const mockReviews: Review[] = [
          {
            id: '1',
            reviewer: {
              id: 'user1',
              name: 'Jean Dupont',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            rating: 5,
            title: 'Excellent service, très professionnel',
            content: 'J\'ai été impressionné par la qualité du travail fourni. Le freelance a été très réactif et a parfaitement compris mes besoins. Je recommande vivement !',
            createdAt: '2023-06-15T10:30:00Z',
            likes: 12,
            isHelpful: true
          },
          {
            id: '2',
            reviewer: {
              id: 'user2',
              name: 'Marie Martin',
              avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
            },
            rating: 4,
            content: 'Bon travail dans l\'ensemble, mais quelques retouches ont été nécessaires. Le prestataire a été cependant très arrangeant pour les corrections.',
            createdAt: '2023-05-20T14:15:00Z',
            likes: 3,
            reply: {
              content: 'Merci pour votre retour Marie. Je suis heureux d\'avoir pu apporter les modifications nécessaires pour vous satisfaire pleinement.',
              createdAt: '2023-05-21T09:45:00Z'
            }
          },
          {
            id: '3',
            reviewer: {
              id: 'user3',
              name: 'Thomas Bernard',
              avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
            },
            rating: 5,
            title: 'Travail impeccable et dans les délais',
            content: 'Le service était exactement ce dont j\'avais besoin. Livraison rapide et communication parfaite tout au long du processus.',
            createdAt: '2023-04-10T08:20:00Z',
            likes: 8
          },
          {
            id: '4',
            reviewer: {
              id: 'user4',
              name: 'Sophie Petit',
            },
            rating: 3,
            content: 'Service correct mais délai un peu long. Le résultat final est satisfaisant mais j\'aurais apprécié plus de réactivité.',
            createdAt: '2023-03-05T16:40:00Z',
            likes: 1,
            reply: {
              content: 'Merci pour votre retour Sophie. Je m\'excuse pour le délai et je prends note de votre remarque pour améliorer mon service à l\'avenir.',
              createdAt: '2023-03-06T10:15:00Z'
            }
          },
        ];
        
        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [serviceId, initialReviews, isLoading]);

  // Appliquer les filtres et tris
  const displayedReviews = useMemo(() => {
    let result = [...reviews];
    
    // Appliquer le filtre par étoile
    if (filter !== null) {
      result = result.filter(review => review.rating === filter);
    }
    
    // Appliquer le tri
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.likes - a.likes;
      }
    });
    
    return result;
  }, [reviews, filter, sortBy]);

  // Composant pour le résumé des évaluations
  const RatingSummary = () => (
    <div className="bg-gray-50 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center">
        <div className="text-center md:text-left md:mr-8 mb-6 md:mb-0">
          <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
          <div className="flex justify-center md:justify-start mt-2">
            <Rating value={rating} size="md" readOnly />
          </div>
          <div className="text-sm text-gray-500 mt-1">{totalReviews} avis</div>
        </div>
        
        <div className="flex-1 w-full max-w-md">
          {[5, 4, 3, 2, 1].map(stars => (
            <button
              key={stars}
              onClick={() => handleFilterChange(stars)}
              className="flex items-center w-full mb-2 group"
              aria-label={`Filtrer par ${stars} étoile${stars > 1 ? 's' : ''}`}
            >
              <div className="flex items-center w-16">
                <span className="text-sm font-medium text-gray-700 mr-1">{stars}</span>
                <FiStar className="h-4 w-4 text-amber-500 fill-amber-500" aria-hidden="true" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${filter === stars ? 'bg-indigo-600' : 'bg-amber-500'} group-hover:bg-indigo-500 transition-colors`}
                  style={{ width: `${(ratingDistribution[stars as keyof typeof ratingDistribution] / totalReviews) * 100}%` }}
                ></div>
              </div>
              <div className="w-10 text-right text-sm text-gray-500">
                {ratingDistribution[stars as keyof typeof ratingDistribution]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Composant pour les filtres et les options de tri
  const FilterAndSortControls = () => (
    <div className="flex flex-wrap justify-between items-center mb-6">
      <div className="flex items-center mb-4 sm:mb-0">
        {filter !== null && (
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center mr-2">
            {filter} étoile{filter > 1 ? 's' : ''}
            <button 
              onClick={() => setFilter(null)}
              className="ml-1.5 text-indigo-600 hover:text-indigo-800"
              aria-label="Supprimer le filtre"
            >
              <FiX className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center text-sm text-gray-700 hover:text-indigo-600"
            aria-expanded={showFilterMenu}
            aria-haspopup="true"
          >
            <FiFilter className="mr-1 h-4 w-4" aria-hidden="true" />
            Filtrer
            <FiChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
          </button>
          {showFilterMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                {[5, 4, 3, 2, 1].map(stars => (
                  <button
                    key={stars}
                    onClick={() => handleFilterChange(stars)}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filter === stars 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {stars} étoile{stars > 1 ? 's' : ''}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange(null)}
                  className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  Tous les avis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Trier par :</span>
        <button
          onClick={() => setSortBy('recent')}
          className={`px-3 py-1 text-sm rounded-md ${
            sortBy === 'recent' 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={sortBy === 'recent'}
        >
          Plus récents
        </button>
        <button
          onClick={() => setSortBy('helpful')}
          className={`px-3 py-1 text-sm rounded-md ${
            sortBy === 'helpful' 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={sortBy === 'helpful'}
        >
          Plus utiles
        </button>
      </div>
    </div>
  );

  // Composant pour un avis individuel
  const ReviewItem = ({ review }: { review: Review }) => (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start">
        <Avatar
          src={review.reviewer.avatar}
          alt={review.reviewer.name}
          size="md"
        />
        <div className="ml-4 flex-1">
          <div className="flex flex-wrap items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center mb-2">
            <Rating value={review.rating} size="sm" readOnly />
          </div>
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
          )}
          <p className="text-gray-700 mb-4">{review.content}</p>
          
          <div className="flex items-center">
            <button
              onClick={() => !review.isHelpful && handleLikeReview(review.id)}
              disabled={review.isHelpful}
              className={`flex items-center text-sm ${
                review.isHelpful 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-indigo-600'
              } transition-colors`}
              aria-label={review.isHelpful ? "Déjà marqué comme utile" : "Marquer comme utile"}
            >
              <FiThumbsUp 
                className={`mr-1 h-4 w-4 ${review.isHelpful ? 'fill-indigo-100' : ''}`} 
                aria-hidden="true" 
              />
              Utile ({review.likes})
            </button>
          </div>
          
          {/* Reply */}
          {review.reply && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-900">Réponse du vendeur</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(review.reply.createdAt)}
                </span>
              </div>
              <p className="text-gray-700">{review.reply.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Composant pour afficher quand aucun avis ne correspond au filtre
  const EmptyReviews = () => (
    <div className="text-center py-8">
      <p className="text-gray-500">Aucun avis ne correspond à votre filtre.</p>
      {filter !== null && (
        <button
          onClick={() => setFilter(null)}
          className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Voir tous les avis
        </button>
      )}
    </div>
  );

  // Rendu principal
  return (
    <div className={className}>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div>
          <RatingSummary />
          <FilterAndSortControls />
          
          {displayedReviews.length > 0 ? (
            <div className="space-y-6">
              {displayedReviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyReviews />
          )}
        </div>
      )}
    </div>
  );
};