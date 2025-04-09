import React from 'react';

// Interface étendue avec plus d'options
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  testId?: string;
}

/**
 * Composant EmptyState amélioré
 * Offre plus de flexibilité et d'options de personnalisation
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  onAction,
  actionLabel,
  variant = 'default',
  secondaryAction,
  testId = 'empty-state'
}) => {
  // Génération de classes CSS dynamiques basées sur la variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'text-center py-6 px-2',
          title: 'text-base font-semibold text-gray-700',
          description: 'text-xs text-gray-500 mt-1'
        };
      case 'detailed':
        return {
          container: 'text-center py-16 px-6',
          title: 'text-2xl font-bold text-gray-900 mb-4',
          description: 'text-base text-gray-600 max-w-xl mx-auto mb-8'
        };
      default:
        return {
          container: 'text-center py-12 px-4',
          title: 'text-lg font-medium text-gray-900 mb-2',
          description: 'text-sm text-gray-500 max-w-md mx-auto mb-6'
        };
    }
  };

  // Génération du style de bouton principal
  const primaryButtonClasses = 
    "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm " +
    "text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

  // Génération du style de bouton secondaire
  const secondaryButtonClasses = 
    "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm " +
    "text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-3";

  const variantClasses = getVariantClasses();

  return (
    <div 
      className={variantClasses.container} 
      data-testid={testId}
      aria-label={title}
    >
      {/* Conteneur d'icône conditionnel */}
      {icon && (
        <div className="flex justify-center mb-4 opacity-70 hover:opacity-100 transition-opacity">
          {icon}
        </div>
      )}
      
      {/* Titre */}
      <h3 className={variantClasses.title}>
        {title}
      </h3>
      
      {/* Description conditionnelle */}
      {description && (
        <p className={variantClasses.description}>
          {description}
        </p>
      )}
      
      {/* Conteneur d'actions */}
      {(onAction || secondaryAction) && (
        <div className="flex justify-center items-center mt-6">
          {/* Bouton d'action principal */}
          {onAction && actionLabel && (
            <button
              type="button"
              className={primaryButtonClasses}
              onClick={onAction}
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
          )}
          
          {/* Bouton d'action secondaire */}
          {secondaryAction && (
            <button
              type="button"
              className={secondaryButtonClasses}
              onClick={secondaryAction.onClick}
              aria-label={secondaryAction.label}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;