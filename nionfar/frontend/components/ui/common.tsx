import React from 'react';
import { FiLoader, FiAlertTriangle, FiInfo, FiCheck } from 'react-icons/fi';

// Interface pour les propriétés du Spinner
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

// Composant Spinner pour indiquer le chargement
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = 'text-blue-600',
  className = '',
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };
  
  return (
    <div className={`${className}`}>
      <FiLoader className={`animate-spin ${sizeClasses[size]} text-indigo-600`} />
    </div>
  );
};

// Interface pour les propriétés d'Alert
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

// Composant Alert pour afficher des messages
export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-300',
      icon: <FiInfo className="h-5 w-5 text-blue-500" />,
      title: 'text-blue-800',
      message: 'text-blue-700'
    },
    success: {
      container: 'bg-green-50 border-green-300',
      icon: <FiCheck className="h-5 w-5 text-green-500" />,
      title: 'text-green-800',
      message: 'text-green-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-300',
      icon: <FiInfo className="h-5 w-5 text-yellow-500" />,
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    error: {
      container: 'bg-red-50 border-red-300',
      icon: <FiAlertTriangle className="h-5 w-5 text-red-500" />,
      title: 'text-red-800',
      message: 'text-red-700'
    }
  };
  
  return (
    <div className={`rounded-md border p-4 ${styles[type].container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles[type].icon}
        </div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${styles[type].title}`}>{title}</h3>}
          <div className={`mt-2 text-sm ${styles[type].message}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tabs component
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Exportation de tous les composants UI communs
export default {
  Spinner,
  Alert,
  Tabs,
}; 