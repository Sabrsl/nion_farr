import React, { useMemo } from 'react';
import Image from 'next/image';
import { FiThumbsUp, FiStar, FiCheck } from 'react-icons/fi';
import { Avatar } from '../ui/Avatar';

// Définition du type Review
interface ReviewType {
  id: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  images?: string[];
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  service?: {
    id: string;
    title: string;
    slug?: string;
  };
  reply?: {
    content: string;
    createdAt: string;
  };
}

interface ReviewProps {
  review: ReviewType;
  className?: string;
}

export const Review: React.FC<ReviewProps> = ({ review, className = '' }) => {
  // Formater la date avec mémorisation pour éviter des recalculs inutiles
  const formattedDate = useMemo(() => {
    return formatDate(review.createdAt);
  }, [review.createdAt]);

  // Formater la date de réponse avec mémorisation
  const formattedReplyDate = useMemo(() => {
    if (!review.reply) return '';
    return formatDate(review.reply.createdAt);
  }, [review.reply]);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 border border-gray-200 ${className}`}>
      {/* En-tête de la review avec avatar et informations du reviewer */}
      <div className="flex items-start mb-4">
        <Avatar 
          src={review.reviewer.avatar}
          alt={review.reviewer.name}
          size="md"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      
      {/* Titre de la review (si présent) */}
      {review.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
      )}
      
      {/* Contenu de la review */}
      <p className="text-gray-700 mb-4">{review.content}</p>
      
      {/* Images jointes (si présentes) */}
      {review.images && review.images.length > 0 && (
        <ReviewImages images={review.images} />
      )}
      
      {/* Réponse du vendeur (si présente) */}
      {review.reply && (
        <div className="mt-4 pt-4 pl-4 border-t border-gray-200 ml-4">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-1 rounded-full">
              <FiCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">
                  Réponse du vendeur
                </h5>
                <span className="text-xs text-gray-500">{formattedReplyDate}</span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{review.reply.content}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Bouton "Utile" */}
      <div className="mt-3 flex justify-end">
        <button 
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          aria-label="Marquer comme utile"
        >
          <FiThumbsUp className="h-4 w-4 mr-1" />
          Utile
        </button>
      </div>
    </div>
  );
};

// Composant pour afficher les étoiles de notation
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center mt-1">
      {[...Array(5)].map((_, i) => (
        <FiStar 
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

// Composant pour afficher les images de la review
const ReviewImages: React.FC<{ images: string[] }> = ({ images }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2 mb-4">
      {images.map((image, idx) => (
        <div key={idx} className="h-20 w-20 relative rounded overflow-hidden">
          <Image
            src={image}
            alt={`Image ${idx + 1}`}
            fill
            sizes="5rem"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};