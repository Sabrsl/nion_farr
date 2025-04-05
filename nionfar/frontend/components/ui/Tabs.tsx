import React from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pill' | 'underline';
  color?: 'indigo' | 'blue' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onChange,
  className = '',
  variant = 'default',
  color = 'indigo',
  size = 'md'
}) => {
  // Assurer que l'onglet actif est valide et non désactivé
  const validTab = tabs.find(tab => tab.id === activeTab && !tab.disabled) 
    ? activeTab 
    : tabs.find(tab => !tab.disabled)?.id || tabs[0]?.id;

  // Classes de taille
  const sizeClasses = {
    sm: 'text-xs py-2 px-1',
    md: 'text-sm py-4 px-1',
    lg: 'text-base py-5 px-2'
  };

  // Générer les classes de style en fonction de la variante
  const getTabClasses = (isActive: boolean, isDisabled: boolean) => {
    // Classes de base
    const baseClasses = 'whitespace-nowrap font-medium flex items-center justify-center';
    
    // Gestion des variantes
    switch (variant) {
      case 'pill':
        return `
          ${baseClasses} 
          rounded-full transition-all duration-200
          ${isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : isActive 
              ? `bg-${color}-100 text-${color}-700`
              : `text-gray-500 hover:bg-gray-100 hover:text-gray-700`
          }
        `;
      case 'underline':
        return `
          ${baseClasses} 
          border-b-2 
          ${isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : isActive 
              ? `border-${color}-500 text-${color}-600`
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }
        `;
      default:
        return `
          ${baseClasses} 
          ${isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : isActive 
              ? `text-${color}-600`
              : 'text-gray-500 hover:text-gray-700'
          }
        `;
    }
  };

  return (
    <div className={`${className}`}>
      <div className={variant === 'pill' ? 'bg-gray-100 rounded-full p-1' : 'border-b border-gray-200'}>
        <nav 
          className={`
            flex 
            ${variant === 'pill' ? 'space-x-2' : 'space-x-8'} 
            ${sizeClasses[size]}
          `} 
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === validTab;
            const isDisabled = tab.disabled || false;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onChange(tab.id)}
                className={getTabClasses(isActive, isDisabled)}
                aria-current={isActive ? 'page' : undefined}
                disabled={isDisabled}
              >
                {/* Icône optionnelle */}
                {tab.icon && (
                  <tab.icon 
                    className={`mr-2 ${isActive ? `text-${color}-600` : 'text-gray-500'}`} 
                  />
                )}
                
                {tab.label}
                
                {/* Compteur optionnel */}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      isActive 
                        ? `bg-${color}-100 text-${color}-600`
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;