import React from 'react';
import { FiStar, FiAward } from 'react-icons/fi/index.js';
import { User } from '../../types';
import { useTooltip } from '../../hooks/useTooltip';

interface UserReviewBadgeProps {
  user: User;
  averageRating?: number;
  completedOrders?: number;
  showTooltip?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserReviewBadge: React.FC<UserReviewBadgeProps> = ({
  user,
  averageRating,
  completedOrders,
  showTooltip = true,
  className = '',
  size = 'md'
}) => {
  const { tooltipRef, showTooltipText, setShowTooltipText } = useTooltip();
  
  // Utiliser les valeurs fournies, ou celles de l'utilisateur si disponibles
  const rating = averageRating || (user as any).rating || 0;
  const orders = completedOrders || (user as any).completedOrders || 0;
  
  // Déterminer si l'utilisateur est un top vendeur
  const isTopSeller = rating >= 4.5 && orders >= 20;
  
  if (!isTopSeller) return null;
  
  // Classes pour différentes tailles
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  return (
    <div className="relative inline-block">
      <div
        className={`flex items-center bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-md font-medium ${sizeClasses[size]} ${className}`}
        onMouseEnter={() => setShowTooltipText(true)}
        onMouseLeave={() => setShowTooltipText(false)}
      >
        <FiAward className={`mr-1 ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <span>Top vendeur</span>
      </div>
      
      {showTooltip && showTooltipText && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10"
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FiStar className="text-yellow-400 w-3 h-3 mr-0.5" />
              <span>{rating.toFixed(1)}/5</span>
            </div>
            <span>·</span>
            <span>{orders} commandes</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default UserReviewBadge; 