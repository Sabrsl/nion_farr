import React, { useState } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Contexte pour partager l'état des onglets entre les composants
const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: '',
  setActiveTab: () => {},
});

// Composant principal Tabs
export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Composant pour les déclencheurs d'onglets
export const TabsTrigger: React.FC<TabTriggerProps> = ({ value, children, className = '' }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  
  const isActive = activeTab === value;
  
  const activeClass = isActive
    ? 'border-blue-500 text-blue-600 font-medium'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  
  return (
    <button
      type="button"
      className={`px-4 py-2 border-b-2 transition-colors ${activeClass} ${className}`}
      onClick={() => setActiveTab(value)}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

// Composant pour le contenu des onglets
export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const { activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div
      role="tabpanel"
      data-state={activeTab === value ? 'active' : 'inactive'}
      className={className}
    >
      {children}
    </div>
  );
};

// Liste des onglets
export const TabsList: React.FC<{ className?: string, children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div 
      role="tablist" 
      className={`flex border-b border-gray-200 mb-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
}; 