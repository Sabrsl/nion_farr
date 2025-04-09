import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi/index.js';
import { Tab } from '@headlessui/react';

interface PackageOption {
  id: string;
  title: string;
  description: string;
  price: number;
  isSelected?: boolean;
}

interface ServicePackagesProps {
  serviceId: string;
  onOptionsChange?: (selectedOptionIds: string[], totalAdditional: number) => void;
  initialOptions?: PackageOption[];
  className?: string;
}

export const ServicePackages: React.FC<ServicePackagesProps> = ({ 
  serviceId,
  onOptionsChange,
  initialOptions,
  className = ''
}) => {
  // Données pour les options supplémentaires
  const [options, setOptions] = useState<PackageOption[]>(
    initialOptions || [
      {
        id: 'option1',
        title: 'Livraison express (24h)',
        description: 'Recevez votre commande en 24h au lieu du délai standard',
        price: 5000,
        isSelected: false
      },
      {
        id: 'option2',
        title: 'Fichiers sources inclus',
        description: 'Recevez les fichiers sources modifiables en plus de la livraison standard',
        price: 3000,
        isSelected: false
      },
      {
        id: 'option3',
        title: 'Révisions supplémentaires',
        description: '3 révisions supplémentaires en plus des révisions standard incluses',
        price: 2500,
        isSelected: false
      },
      {
        id: 'option4',
        title: 'Support premium',
        description: 'Assistance prioritaire et support technique pendant 30 jours après livraison',
        price: 4000,
        isSelected: false
      }
    ]
  );

  // Calculer le montant total des options supplémentaires
  const calculateTotal = useCallback((options: PackageOption[]) => {
    return options.reduce((sum, option) => 
      option.isSelected ? sum + option.price : sum, 0
    );
  }, []);

  const [totalAdditional, setTotalAdditional] = useState(() => 
    calculateTotal(options)
  );

  // Mettre à jour le parent quand les options sélectionnées changent
  useEffect(() => {
    if (onOptionsChange) {
      const selectedOptionIds = options
        .filter(option => option.isSelected)
        .map(option => option.id);
      
      onOptionsChange(selectedOptionIds, totalAdditional);
    }
  }, [options, totalAdditional, onOptionsChange]);

  // Gestion du basculement des options
  const toggleOption = useCallback((optionId: string) => {
    setOptions(prevOptions => {
      const updatedOptions = prevOptions.map(option => 
        option.id === optionId 
          ? { ...option, isSelected: !option.isSelected } 
          : option
      );
      
      // Mettre à jour le total directement ici pour garantir la cohérence
      setTotalAdditional(calculateTotal(updatedOptions));
      
      return updatedOptions;
    });
  }, [calculateTotal]);

  // Rendu des options
  const renderOption = (option: PackageOption) => (
    <div 
      key={option.id}
      className={`p-6 transition-colors ${option.isSelected ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
      data-option-id={option.id}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900">{option.title}</h4>
            <span className="ml-2 text-sm text-indigo-600 font-semibold">
              +{option.price.toLocaleString()} FCFA
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
        </div>
        <button
          onClick={() => toggleOption(option.id)}
          className={`ml-4 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
            option.isSelected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
          aria-label={option.isSelected ? "Désélectionner l'option" : "Sélectionner l'option"}
        >
          {option.isSelected ? (
            <FiCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <FiPlus className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );

  // Rendu du résumé des options sélectionnées
  const renderSummary = () => {
    if (totalAdditional <= 0) return null;
    
    const selectedOptions = options.filter(option => option.isSelected);
    
    return (
      <div className="bg-white p-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Options sélectionnées :</span>
          <span className="text-indigo-600 font-semibold">+{totalAdditional.toLocaleString()} FCFA</span>
        </div>
        
        <div className="space-y-2">
          {selectedOptions.map(option => (
            <div key={option.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <FiCheck className="h-4 w-4 text-indigo-600 mr-2" aria-hidden="true" />
                <span>{option.title}</span>
              </div>
              <button
                onClick={() => toggleOption(option.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                aria-label={`Supprimer ${option.title}`}
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Tab.Group>
      <div className={`bg-gray-50 rounded-xl overflow-hidden border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Options supplémentaires</h3>
          <p className="text-gray-600 text-sm">
            Personnalisez votre commande avec ces options additionnelles
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {options.map(renderOption)}
        </div>
        
        {/* Summary */}
        {renderSummary()}
      </div>
    </Tab.Group>
  );
};