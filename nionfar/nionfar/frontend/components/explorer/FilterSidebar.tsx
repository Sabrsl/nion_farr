import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiStar, FiX } from 'react-icons/fi/index.js';
import { RangeSlider } from '../ui/RangeSlider';

interface FilterSidebarProps {
  isMobileFilterOpen: boolean;
  closeMobileFilter: () => void;
  onFilterChange: (filters: any) => void;
  categories: any[];
  subCategories?: any[];
}

export const FilterSidebar = ({
  isMobileFilterOpen,
  closeMobileFilter,
  onFilterChange,
  categories,
  subCategories = [],
}: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'categories',
    'price',
    'rating',
    'deliveryTime',
  ]);
  const [priceRange, setPriceRange] = useState([1000, 100000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    let newSelectedCategories;
    if (selectedCategories.includes(categoryId)) {
      newSelectedCategories = selectedCategories.filter((id) => id !== categoryId);
    } else {
      newSelectedCategories = [...selectedCategories, categoryId];
    }
    setSelectedCategories(newSelectedCategories);
    onFilterChange({ ...filters, categories: newSelectedCategories });
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    onFilterChange({ ...filters, minRating: rating });
  };

  const handleDeliveryTimeChange = (time: string) => {
    setSelectedDeliveryTime(time === selectedDeliveryTime ? null : time);
    onFilterChange({ ...filters, deliveryTime: time === selectedDeliveryTime ? null : time });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({ ...filters, minPrice: values[0], maxPrice: values[1] });
  };

  const filters = {
    categories: selectedCategories,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: selectedRating,
    deliveryTime: selectedDeliveryTime,
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([1000, 100000]);
    setSelectedRating(0);
    setSelectedDeliveryTime(null);
    onFilterChange({
      categories: [],
      minPrice: 1000,
      maxPrice: 100000,
      minRating: 0,
      deliveryTime: null,
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileFilter}
        ></div>
      )}

      {/* Mobile Filter */}
      <div 
        className={`
          fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:relative lg:inset-auto lg:transform-none lg:z-0 lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-24
        `}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white z-10 lg:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          <button onClick={closeMobileFilter} className="text-gray-400 hover:text-gray-500 p-2">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Content - Scrollable */}
        <div className="h-[calc(100%-60px)] overflow-y-auto pb-20 lg:h-auto lg:overflow-visible">
          <div className="p-4 lg:pt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Réinitialiser
              </button>
            </div>

            {/* Catégories */}
            <div className="border-b border-gray-200 py-4">
              <button
                onClick={() => toggleSection('categories')}
                className="flex justify-between items-center w-full text-left font-medium text-gray-900"
              >
                <span>Catégories</span>
                {expandedSections.includes('categories') ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.includes('categories') && (
                <div className="mt-3 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center py-1">
                      <input
                        id={`category-${category.id}`}
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {category.name} ({category.count || 0})
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="border-b border-gray-200 py-4">
              <button
                onClick={() => toggleSection('price')}
                className="flex justify-between items-center w-full text-left font-medium text-gray-900"
              >
                <span>Prix</span>
                {expandedSections.includes('price') ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.includes('price') && (
                <div className="mt-4 px-2">
                  <RangeSlider
                    min={1000}
                    max={100000}
                    values={priceRange}
                    onChange={handlePriceChange}
                    formatLabel={(value) => `${value.toLocaleString()} FCFA`}
                  />
                  <div className="flex justify-between mt-3 text-sm text-gray-600">
                    <span>{priceRange[0].toLocaleString()} FCFA</span>
                    <span>{priceRange[1].toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}
            </div>

            {/* Évaluation */}
            <div className="border-b border-gray-200 py-4">
              <button
                onClick={() => toggleSection('rating')}
                className="flex justify-between items-center w-full text-left font-medium text-gray-900"
              >
                <span>Évaluation</span>
                {expandedSections.includes('rating') ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.includes('rating') && (
                <div className="mt-3 space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center py-1">
                      <input
                        id={`rating-${rating}`}
                        type="radio"
                        checked={selectedRating === rating}
                        onChange={() => handleRatingChange(rating)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="ml-3 flex items-center text-sm text-gray-700"
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FiStar
                            key={index}
                            className={`w-4 h-4 ${
                              index < rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1">& plus</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Délai de livraison */}
            <div className="border-b border-gray-200 py-4">
              <button
                onClick={() => toggleSection('deliveryTime')}
                className="flex justify-between items-center w-full text-left font-medium text-gray-900"
              >
                <span>Délai de livraison</span>
                {expandedSections.includes('deliveryTime') ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.includes('deliveryTime') && (
                <div className="mt-3 space-y-2">
                  {[
                    { id: '24h', label: "Moins de 24 heures" },
                    { id: '3d', label: "Jusqu'à 3 jours" },
                    { id: '1w', label: "Jusqu'à 1 semaine" },
                    { id: 'anytime', label: "N'importe quand" },
                  ].map((option) => (
                    <div key={option.id} className="flex items-center py-1">
                      <input
                        id={`delivery-${option.id}`}
                        type="radio"
                        checked={selectedDeliveryTime === option.id}
                        onChange={() => handleDeliveryTimeChange(option.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label
                        htmlFor={`delivery-${option.id}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton d'application pour mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg lg:hidden">
              <button
                onClick={closeMobileFilter}
                className="w-full py-3 px-6 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 