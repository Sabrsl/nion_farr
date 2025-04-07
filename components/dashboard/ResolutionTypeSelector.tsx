import React from 'react';
import { ResolutionType } from '../../types';

interface ResolutionTypeSelectorProps {
  value: ResolutionType | '';
  onChange: (value: ResolutionType) => void;
  disabled?: boolean;
}

const ResolutionTypeSelector: React.FC<ResolutionTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const resolutionOptions = [
    { value: 'remboursement_partiel', label: 'Remboursement partiel' },
    { value: 'remboursement_total', label: 'Remboursement total' },
    { value: 'livraison_corrigée', label: 'Livraison corrigée' },
    { value: 'refus_du_litige', label: 'Refus du litige (paiement au vendeur)' },
    { value: 'prolongation_délai', label: 'Prolongation de délai' },
    { value: 'arrangement_amiable', label: 'Arrangement amiable' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as ResolutionType);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="resolution-type" className="block text-sm font-medium text-gray-700">
        Type de résolution
      </label>
      <select
        id="resolution-type"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="" disabled>Sélectionnez une résolution</option>
        {resolutionOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {value === 'remboursement_partiel' && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                Précisez le pourcentage de remboursement dans le commentaire (ex: "Remboursement de 50% car...").
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolutionTypeSelector; 