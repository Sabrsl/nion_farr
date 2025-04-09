import React, { useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiStar, FiClock } from 'react-icons/fi/index.js';
import Image from 'next/image';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  viewType: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

// Loader pour les images externes
const imageLoader = ({ src }: { src: string }) => {
  return src;
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewType,
  isFavorite,
  onToggleFavorite
}) => {
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    price,
    rating = 0,
    totalReviews = 0,
    deliveryTime = 1,
    provider,
    description
  } = service;

  const images = (service as any).images;
  const slug = (service as any).slug || id;

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = images && images.length > 0 ? images[0] : '/placeholder-service.jpg';

  // Pour la vue liste, utiliser un conteneur flex-row
  if (viewType === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col sm:flex-row">
        {/* Image section - plus petit en vue liste */}
        <div className="relative w-full sm:w-1/3 h-48 sm:h-auto flex-shrink-0">
          <a href={`/services/${slug || id}`}>
            <div className="w-full h-full">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-opacity hover:opacity-90"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-sm">Image non disponible</span>
                </div>
              )}
            </div>
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <FiHeart
              className={`w-5 h-5 ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Content section - plus large en vue liste */}
        <div className="p-4 flex flex-col sm:w-2/3">
          {/* Provider info */}
          {provider && (
            <div className="flex items-center mb-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 mr-2">
                {provider.avatar ? (
                  <img
                    src={provider.avatar}
                    alt={(provider as any).username || provider.name || 'Freelance'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/40x40/6366f1/ffffff?text=${((provider as any).username || provider.name || 'F').charAt(0).toUpperCase()}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                    {((provider as any).username || provider.name || 'F').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {(provider as any).username || provider.name || 'Freelance'}
              </span>
            </div>
          )}

          {/* Title - plus grand en vue liste */}
          <a href={`/services/${slug || id}`}>
            <h3 className="font-medium text-gray-900 mb-2 hover:text-indigo-600 transition-colors text-lg line-clamp-1 sm:line-clamp-2">
              {title}
            </h3>
          </a>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400 mr-1">
              <FiStar className={`w-4 h-4 ${rating >= 1 ? 'fill-yellow-400' : ''}`} />
              <FiStar className={`w-4 h-4 ${rating >= 2 ? 'fill-yellow-400' : ''}`} />
              <FiStar className={`w-4 h-4 ${rating >= 3 ? 'fill-yellow-400' : ''}`} />
              <FiStar className={`w-4 h-4 ${rating >= 4 ? 'fill-yellow-400' : ''}`} />
              <FiStar className={`w-4 h-4 ${rating >= 5 ? 'fill-yellow-400' : ''}`} />
            </div>
            <span className="text-xs text-gray-500">
              {rating.toFixed(1)} ({totalReviews} avis)
            </span>
          </div>

          {/* Description - visible uniquement en vue liste */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 hidden sm:block">
            {description || "Ce service ne contient pas de description."}
          </p>

          {/* Bottom section */}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
            {/* Delivery time */}
            <div className="flex items-center text-gray-500 text-sm">
              <FiClock className="w-4 h-4 mr-1" />
              <span>{deliveryTime} jours</span>
            </div>

            {/* Price */}
            <div className="font-semibold text-gray-900">
              {Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                maximumFractionDigits: 0,
              }).format(price)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grid par défaut
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      {/* Image section - plus grande en vue grille */}
      <div className="relative h-48 sm:h-40 md:h-48">
        <a href={`/services/${slug || id}`}>
          <div className="w-full h-full">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-opacity hover:opacity-90"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-sm">Image non disponible</span>
              </div>
            )}
          </div>
        </a>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <FiHeart
            className={`w-5 h-5 ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Content section */}
      <div className="p-4 flex flex-col">
        {/* Provider info */}
        {provider && (
          <div className="flex items-center mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 mr-2">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={(provider as any).username || provider.name || 'Freelance'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/40x40/6366f1/ffffff?text=${((provider as any).username || provider.name || 'F').charAt(0).toUpperCase()}`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                  {((provider as any).username || provider.name || 'F').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {(provider as any).username || provider.name || 'Freelance'}
            </span>
          </div>
        )}

        {/* Title */}
        <a href={`/services/${slug || id}`}>
          <h3 className="font-medium text-gray-900 mb-1 hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </a>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            <FiStar className={`w-4 h-4 ${rating >= 1 ? 'fill-yellow-400' : ''}`} />
            <FiStar className={`w-4 h-4 ${rating >= 2 ? 'fill-yellow-400' : ''}`} />
            <FiStar className={`w-4 h-4 ${rating >= 3 ? 'fill-yellow-400' : ''}`} />
            <FiStar className={`w-4 h-4 ${rating >= 4 ? 'fill-yellow-400' : ''}`} />
            <FiStar className={`w-4 h-4 ${rating >= 5 ? 'fill-yellow-400' : ''}`} />
          </div>
          <span className="text-xs text-gray-500">
            {rating.toFixed(1)} ({totalReviews} avis)
          </span>
        </div>

        {/* Bottom section */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          {/* Delivery time */}
          <div className="flex items-center text-gray-500 text-sm">
            <FiClock className="w-4 h-4 mr-1" />
            <span>{deliveryTime} jours</span>
          </div>

          {/* Price */}
          <div className="font-semibold text-gray-900">
            {Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              maximumFractionDigits: 0,
            }).format(price)}
          </div>
        </div>
      </div>
    </div>
  );
}; 