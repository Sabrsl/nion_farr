import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

interface RatingProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
  color?: string;
  showValue?: boolean;
  allowReset?: boolean;
  ariaLabel?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value: controlledValue,
  size = 'md',
  max = 5,
  onChange,
  readOnly = false,
  className = '',
  color = 'amber',
  showValue = false,
  allowReset = false,
  ariaLabel = 'Rating'
}) => {
  // Stato interno pour le mode non contrôlé
  const [internalValue, setInternalValue] = useState(controlledValue || 0);
  const [hoverValue, setHoverValue] = useState(0);

  // Valeur effective (contrôlée ou non contrôlée)
  const effectiveValue = controlledValue !== undefined 
    ? controlledValue 
    : internalValue;

  // Définir la taille des étoiles selon le prop size
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-6 w-6';
      case 'md':
      default: return 'h-4 w-4';
    }
  };

  // Crée un tableau d'étoiles avec la valeur arrondie au 0.5 près
  const roundedValue = Math.round((hoverValue || effectiveValue) * 2) / 2;
  const stars = [];

  for (let i = 1; i <= max; i++) {
    // Déterminer le type d'étoile à afficher
    let starType: 'full' | 'half' | 'empty';
    
    if (i <= Math.floor(roundedValue)) {
      starType = 'full';
    } else if (i - 0.5 === Math.floor(roundedValue) && roundedValue % 1 !== 0) {
      starType = 'half';
    } else {
      starType = 'empty';
    }

    stars.push({ value: i, type: starType });
  }

  // Gérer le clic sur une étoile
  const handleStarClick = (starValue: number) => {
    if (readOnly) return;

    // Gestion du reset
    const newValue = allowReset && effectiveValue === starValue ? 0 : starValue;

    // Mise à jour de la valeur
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    // Appel du callback onChange
    if (onChange) {
      onChange(newValue);
    }
  };

  // Styles dynamiques pour la couleur
  const getColorClasses = (type: 'full' | 'half' | 'empty') => {
    const colorMap = {
      full: `text-${color}-500 fill-${color}-500`,
      half: `text-${color}-500 fill-gradient-lr-${color}`,
      empty: 'text-gray-300'
    };
    return colorMap[type];
  };

  return (
    <div 
      className={`flex items-center ${className}`} 
      role="group" 
      aria-label={ariaLabel}
    >
      <div className="flex">
        {stars.map((star, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(star.value)}
            onMouseEnter={() => !readOnly && setHoverValue(star.value)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            disabled={readOnly}
            className={`
              ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform focus:outline-none mr-0.5 group
            `}
            aria-label={`${star.value} stars`}
          >
            <FiStar 
              className={`
                ${getStarSize()} 
                ${getColorClasses(star.type)}
                ${!readOnly && 'group-hover:opacity-80'}
              `}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {effectiveValue.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
};

export default Rating;

// Exemple de configuration de dégradé pour le remplissage à moitié
const tailwindConfig = `
// Dans votre fichier de configuration Tailwind
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'gradient-lr-amber': 'linear-gradient(to right, #f59e0b 50%, #e5e7eb 50%)',
        'gradient-lr-blue': 'linear-gradient(to right, #3b82f6 50%, #e5e7eb 50%)',
        // Ajoutez d'autres dégradés selon vos besoins
      }
    }
  }
}
`;