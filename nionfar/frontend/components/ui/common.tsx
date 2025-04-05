import React, { memo } from 'react';
import { FiLoader, FiAlertTriangle, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import classNames from 'classnames';

// ==================== Spinner Component ====================
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  label?: string;
}

export const Spinner = memo<SpinnerProps>(({
  size = 'medium',
  color = 'text-indigo-600',
  className = '',
  label = 'Chargement',
}) => {
  const SIZE_CLASSES = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };
  
  return (
    <div className={classNames('flex items-center justify-center', className)} role="status">
      <FiLoader className={classNames('animate-spin', SIZE_CLASSES[size], color)} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
});

Spinner.displayName = 'Spinner';

// ==================== Alert Component ====================
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
  dismissible?: boolean;
}

export const Alert = memo<AlertProps>(({
  type,
  title,
  message,
  onClose,
  className = '',
  dismissible = !!onClose,
}) => {
  const STYLES = {
    info: {
      container: 'bg-blue-50 border-blue-300',
      icon: <FiInfo className="h-5 w-5 text-blue-500" aria-hidden="true" />,
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500'
    },
    success: {
      container: 'bg-green-50 border-green-300',
      icon: <FiCheck className="h-5 w-5 text-green-500" aria-hidden="true" />,
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'text-green-500 hover:bg-green-100 focus:ring-green-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-300',
      icon: <FiInfo className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500'
    },
    error: {
      container: 'bg-red-50 border-red-300',
      icon: <FiAlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />,
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-500 hover:bg-red-100 focus:ring-red-500'
    }
  };
  
  return (
    <div 
      className={classNames('rounded-md border p-4', STYLES[type].container, className)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {STYLES[type].icon}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={classNames('text-sm font-medium', STYLES[type].title)}>{title}</h3>}
          <div className={classNames('mt-2 text-sm', STYLES[type].message)}>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
        
        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={classNames(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'transition-colors',
                  STYLES[type].button
                )}
                onClick={onClose}
                aria-label="Fermer"
              >
                <span className="sr-only">Fermer</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

// ==================== Tabs Component ====================
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

export const Tabs = memo<TabsProps>(({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '',
  variant = 'default',
  fullWidth = false
}) => {
  // Style variants for the tabs
  const getTabStyles = (tab: Tab, isActive: boolean) => {
    const baseStyles = 'flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
    const disabledStyles = tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    if (variant === 'pills') {
      return classNames(
        baseStyles,
        'rounded-md px-3 py-2 text-sm font-medium',
        disabledStyles,
        isActive 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      );
    }
    
    if (variant === 'underline') {
      return classNames(
        baseStyles,
        'px-1 py-4 text-sm font-medium border-b-2',
        disabledStyles,
        isActive 
          ? 'text-indigo-600 border-indigo-600' 
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      );
    }
    
    // Default variant
    return classNames(
      baseStyles,
      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
      disabledStyles,
      isActive
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    );
  };
  
  return (
    <div className={classNames(
      variant === 'default' && 'border-b border-gray-200', 
      className
    )}>
      <nav 
        className={classNames(
          'flex', 
          variant === 'default' && 'space-x-8 px-6',
          variant === 'pills' && 'space-x-2 p-1',
          variant === 'underline' && 'space-x-6',
          fullWidth && 'w-full'
        )} 
        aria-label="Tabs"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={classNames(
              getTabStyles(tab, activeTab === tab.id),
              fullWidth && 'flex-1 justify-center'
            )}
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
});

Tabs.displayName = 'Tabs';

// TabPanel component to work with Tabs
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel = memo<TabPanelProps>(({
  id,
  activeTab,
  children,
  className = ''
}) => {
  const isActive = activeTab === id;
  
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isActive}
      className={classNames(
        'focus:outline-none',
        { 'hidden': !isActive },
        className
      )}
    >
      {isActive && children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';