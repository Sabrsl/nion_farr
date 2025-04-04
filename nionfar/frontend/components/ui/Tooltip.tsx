import React, { ReactNode, useState } from 'react';

type TooltipProps = {
  children: ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
};

export const Tooltip = ({ 
  children, 
  content, 
  position = 'top'
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Calculer la position du tooltip en fonction du paramètre
  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-1';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-1';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-1';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1';
    }
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded whitespace-nowrap ${getPositionStyle()}`}
          style={{ pointerEvents: 'none' }}
        >
          {content}
          
          {/* Petite flèche pour indiquer la direction */}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
              position === 'top' ? 'top-full -translate-x-1/2 left-1/2 -mt-1' :
              position === 'right' ? 'right-full -translate-y-1/2 top-1/2 -mr-1' :
              position === 'bottom' ? 'bottom-full -translate-x-1/2 left-1/2 -mb-1' :
              'left-full -translate-y-1/2 top-1/2 -ml-1'
            }`}
          />
        </div>
      )}
    </div>
  );
}; 