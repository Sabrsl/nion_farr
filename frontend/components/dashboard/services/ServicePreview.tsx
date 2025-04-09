import React from 'react';
import { FiClock, FiRepeat, FiStar, FiDollarSign, FiTag, FiUser, FiCalendar } from 'react-icons/fi/index.js';

type ServicePreviewProps = {
  formData: any;
  imageUrls: string[];
  selectedCategory: any;
};

export const ServicePreview: React.FC<ServicePreviewProps> = ({ formData, imageUrls, selectedCategory }) => {
  const {
    title,
    summary,
    description,
    price,
    deliveryTime,
    revisions,
    tags,
    hasPackages,
    packageOptions
  } = formData;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">Aperçu du service</h2>
        <p className="text-sm text-gray-500">Voici comment votre service apparaîtra aux clients</p>
      </div>

      <div className="p-4">
        {/* Images */}
        {imageUrls.length > 0 && (
          <div className="mb-5">
            <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
              <img src={imageUrls[0]} alt={title} className="object-cover w-full h-full" />
            </div>
            {imageUrls.length > 1 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {imageUrls.slice(1, 5).map((url, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md">
                    <img src={url} alt={`Image ${index + 2}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title & Category */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title || "Titre du service"}</h1>
          {selectedCategory && (
            <div className="flex items-center text-sm text-indigo-600">
              <span className="mr-2">{selectedCategory.icon}</span>
              <span>{selectedCategory.name}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-6">
          <p className="text-gray-700">
            {summary || "Résumé du service..."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <FiStar className="mr-1.5 w-4 h-4 text-amber-400" />
            <span>Nouveau</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiClock className="mr-1.5 w-4 h-4" />
            <span>{deliveryTime} jours</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiRepeat className="mr-1.5 w-4 h-4" />
            <span>{revisions === 999 ? "Révisions illimitées" : `${revisions} révisions`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiUser className="mr-1.5 w-4 h-4" />
            <span>Votre Nom</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiCalendar className="mr-1.5 w-4 h-4" />
            <span>Nouveau vendeur</span>
          </div>
        </div>

        {/* Price */}
        {!hasPackages ? (
          <div className="mb-6 flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FiDollarSign className="mr-1 w-5 h-5" />
                {price || 0} FCFA
              </h3>
              <p className="text-sm text-gray-500">Prix unique</p>
            </div>
            <button 
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              Commander maintenant
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(packageOptions).map(([key, package_]: [string, any]) => (
                <div key={key} className={`border rounded-lg p-4 ${key === 'standard' ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}>
                  <h3 className="font-semibold text-base mb-1">{package_.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{package_.description}</p>
                  <div className="font-bold text-xl mb-2">{package_.price} FCFA</div>
                  <div className="text-sm text-gray-600 mb-1">
                    <FiClock className="inline mr-1" /> {package_.deliveryTime} jours
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <FiRepeat className="inline mr-1" /> {package_.revisions === 999 ? "Révisions illimitées" : `${package_.revisions} révisions`}
                  </div>
                  <button
                    type="button"
                    className={`w-full py-2 text-center text-sm font-medium rounded-lg ${
                      key === 'standard'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {key === 'standard' ? 'Sélectionner' : 'Voir les détails'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center">
              <FiTag className="mr-1.5 w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Sample */}
        <div className="prose prose-indigo max-w-none mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Description</h3>
          <div className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
            {description ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              <p>Description détaillée du service...</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="bg-indigo-50 p-4 text-sm text-indigo-700">
        <p>Ceci est un aperçu. Le service n'a pas encore été publié.</p>
      </div>
    </div>
  );
};

export default ServicePreview; 