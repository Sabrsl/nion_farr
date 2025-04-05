import React, { createContext, useContext, useState, useCallback, useEffect, useId, memo } from 'react';
import classNames from 'classnames';

// Types for the context
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
  orientation: 'horizontal' | 'vertical';
};

// Context for managing tabs state
const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Custom hook to consume the tabs context
const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// ==================== Tabs Component ====================
interface CustomTabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const CustomTabs = memo<CustomTabsProps>(({ 
  defaultValue, 
  value: controlledValue,
  onValueChange: controlledOnChange,
  children, 
  className = '',
  orientation = 'horizontal'
}) => {
  // Generate a unique ID for this tabs instance
  const baseId = useId().replace(/:/g, '');
  
  // State for uncontrolled component
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  // Handle value change
  const handleValueChange = useCallback((newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    controlledOnChange?.(newValue);
  }, [isControlled, controlledOnChange]);
  
  // Update uncontrolled value if defaultValue changes
  useEffect(() => {
    if (!isControlled) {
      setUncontrolledValue(defaultValue);
    }
  }, [isControlled, defaultValue]);
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, baseId, orientation }}>
      <div 
        className={classNames(
          'tabs',
          orientation === 'vertical' && 'flex',
          className
        )}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

CustomTabs.displayName = 'CustomTabs';

// ==================== TabsList Component ====================
interface CustomTabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'underline' | 'pills' | 'contained';
  fullWidth?: boolean;
}

export const CustomTabsList = memo<CustomTabsListProps>(({ 
  children, 
  className = '',
  variant = 'underline',
  fullWidth = false
}) => {
  const { orientation } = useContext(TabsContext) || { orientation: 'horizontal' };
  
  return (
    <div 
      className={classNames(
        'tabs-list',
        orientation === 'horizontal' ? 'flex' : 'flex-col',
        variant === 'underline' && 'border-b border-gray-200',
        variant === 'pills' && 'bg-gray-100 p-1 rounded-lg',
        variant === 'contained' && 'bg-white shadow-sm rounded-lg p-1 border border-gray-200',
        fullWidth && orientation === 'horizontal' && 'w-full',
        className
      )}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
});

CustomTabsList.displayName = 'CustomTabsList';

// ==================== TabsTrigger Component ====================
interface CustomTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const CustomTabsTrigger = memo<CustomTabsTriggerProps>(({ 
  value, 
  children, 
  className = '',
  disabled = false,
  icon
}) => {
  const { value: selectedValue, onValueChange, baseId } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;
  
  // Function to get variant-specific styles from parent TabsList
  const getTabStyles = () => {
    const tabsList = document.getElementById(tabId)?.closest('.tabs-list');
    if (!tabsList) return '';
    
    const variant = tabsList.classList.contains('bg-gray-100') ? 'pills' : 
                   tabsList.classList.contains('bg-white') ? 'contained' : 'underline';
                   
    if (variant === 'pills') {
      return classNames(
        'px-3 py-2 rounded-md transition-colors',
        isSelected ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-700 hover:text-gray-900',
        disabled && 'opacity-50 cursor-not-allowed'
      );
    }
    
    if (variant === 'contained') {
      return classNames(
        'px-4 py-2 transition-colors',
        isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      );
    }
    
    // Default to underline variant
    return classNames(
      'px-4 py-2 border-b-2 transition-colors',
      isSelected ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    );
  };
  
  return (
    <button
      id={tabId}
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={classNames(
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'text-sm font-medium',
        getTabStyles(),
        className
      )}
      data-state={isSelected ? 'active' : 'inactive'}
    >
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
});

CustomTabsTrigger.displayName = 'CustomTabsTrigger';

// ==================== TabsContent Component ====================
interface CustomTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const CustomTabsContent = memo<CustomTabsContentProps>(({ 
  value, 
  children, 
  className = '',
  forceMount = false
}) => {
  const { value: selectedValue, baseId } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;
  
  if (!forceMount && !isSelected) return null;
  
  return (
    <div 
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      hidden={!isSelected}
      className={classNames(
        'focus:outline-none',
        className
      )}
      data-state={isSelected ? 'active' : 'inactive'}
    >
      {(forceMount || isSelected) && children}
    </div>
  );
});

CustomTabsContent.displayName = 'CustomTabsContent';

export { useTabsContext };