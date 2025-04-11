import React, { useState } from 'react';
import { FiSave, FiSettings, FiBell, FiLock, FiGlobe, FiUsers, FiDollarSign } from 'react-icons/fi/index.js';
import AdminLayout from '../../components/layouts/AdminLayout';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const AdminSettingsPage: React.FC = () => {
  // Sections de paramètres
  const settingSections: SettingSection[] = [
    {
      id: 'general',
      title: 'Paramètres Généraux',
      icon: <FiSettings className="text-gray-500" />,
      description: 'Configuration générale de la plateforme'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <FiBell className="text-gray-500" />,
      description: 'Gérer les notifications et alertes'
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: <FiLock className="text-gray-500" />,
      description: 'Paramètres de sécurité et d\'authentification'
    },
    {
      id: 'localization',
      title: 'Localisation',
      icon: <FiGlobe className="text-gray-500" />,
      description: 'Paramètres régionaux et linguistiques'
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: <FiUsers className="text-gray-500" />,
      description: 'Configuration des rôles et permissions'
    },
    {
      id: 'payments',
      title: 'Paiements',
      icon: <FiDollarSign className="text-gray-500" />,
      description: 'Configuration des paiements et commissions'
    }
  ];
  
  // État actif pour la section sélectionnée
  const [activeSection, setActiveSection] = useState('general');
  
  // Paramètres généraux
  const [siteName, setSiteName] = useState('NionFar');
  const [siteDescription, setSiteDescription] = useState('Plateforme freelance pour les talents sénégalais');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@nionfar.sn');
  const [defaultLanguage, setDefaultLanguage] = useState('fr');
  const [defaultCurrency, setDefaultCurrency] = useState('XOF');
  const [defaultTimeZone, setDefaultTimeZone] = useState('Africa/Dakar');
  
  // Paramètres de paiement
  const [commissionRate, setCommissionRate] = useState(10);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(5000);
  const [paymentGateways, setPaymentGateways] = useState({
    waveMoney: true,
    orangeMoney: true,
    freeMoney: false,
    payPal: false,
    stripe: false
  });
  
  // Paramètres de sécurité
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordLength, setPasswordLength] = useState(8);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  
  const handleSaveSettings = () => {
    // Simuler la sauvegarde des paramètres
    alert('Paramètres sauvegardés avec succès!');
  };
  
  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div>
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-1">
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                  Nom du site
                </label>
                <input
                  type="text"
                  id="site-name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
                  Description du site
                </label>
                <textarea
                  id="site-description"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                  Email d'administration
                </label>
                <input
                  type="email"
                  id="admin-email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <div className="flex items-center">
                  <input
                    id="maintenance-mode"
                    name="maintenance-mode"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                  />
                  <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
                    Mode maintenance
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Lorsque activé, seuls les administrateurs peuvent accéder au site.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'payments':
        return (
          <div>
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-1">
                <label htmlFor="commission-rate" className="block text-sm font-medium text-gray-700">
                  Taux de commission (%)
                </label>
                <input
                  type="number"
                  id="commission-rate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="min-withdrawal" className="block text-sm font-medium text-gray-700">
                  Montant minimum de retrait (XOF)
                </label>
                <input
                  type="number"
                  id="min-withdrawal"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={minWithdrawalAmount}
                  onChange={(e) => setMinWithdrawalAmount(Number(e.target.value))}
                  min="0"
                />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Passerelles de paiement
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="wave-money"
                      name="wave-money"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={paymentGateways.waveMoney}
                      onChange={(e) => setPaymentGateways({...paymentGateways, waveMoney: e.target.checked})}
                    />
                    <label htmlFor="wave-money" className="ml-2 block text-sm text-gray-900">
                      Wave Money
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="orange-money"
                      name="orange-money"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={paymentGateways.orangeMoney}
                      onChange={(e) => setPaymentGateways({...paymentGateways, orangeMoney: e.target.checked})}
                    />
                    <label htmlFor="orange-money" className="ml-2 block text-sm text-gray-900">
                      Orange Money
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="free-money"
                      name="free-money"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={paymentGateways.freeMoney}
                      onChange={(e) => setPaymentGateways({...paymentGateways, freeMoney: e.target.checked})}
                    />
                    <label htmlFor="free-money" className="ml-2 block text-sm text-gray-900">
                      Free Money
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="paypal"
                      name="paypal"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={paymentGateways.payPal}
                      onChange={(e) => setPaymentGateways({...paymentGateways, payPal: e.target.checked})}
                    />
                    <label htmlFor="paypal" className="ml-2 block text-sm text-gray-900">
                      PayPal
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="stripe"
                      name="stripe"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={paymentGateways.stripe}
                      onChange={(e) => setPaymentGateways({...paymentGateways, stripe: e.target.checked})}
                    />
                    <label htmlFor="stripe" className="ml-2 block text-sm text-gray-900">
                      Stripe
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div>
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-1">
                <div className="flex items-center">
                  <input
                    id="two-factor-auth"
                    name="two-factor-auth"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                  <label htmlFor="two-factor-auth" className="ml-2 block text-sm text-gray-900">
                    Authentification à deux facteurs
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Exiger l'authentification à deux facteurs pour les comptes administrateur.
                </p>
              </div>
              
              <div className="col-span-1">
                <label htmlFor="password-length" className="block text-sm font-medium text-gray-700">
                  Longueur minimale du mot de passe
                </label>
                <input
                  type="number"
                  id="password-length"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                  min="6"
                  max="20"
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                  Délai d'expiration de session (minutes)
                </label>
                <input
                  type="number"
                  id="session-timeout"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min="5"
                  max="120"
                />
              </div>
            </div>
          </div>
        );
        
      case 'localization':
        return (
          <div>
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-1">
                <label htmlFor="default-language" className="block text-sm font-medium text-gray-700">
                  Langue par défaut
                </label>
                <select
                  id="default-language"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="wo">Wolof</option>
                </select>
              </div>
              
              <div className="col-span-1">
                <label htmlFor="default-currency" className="block text-sm font-medium text-gray-700">
                  Devise par défaut
                </label>
                <select
                  id="default-currency"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>
              
              <div className="col-span-1">
                <label htmlFor="default-timezone" className="block text-sm font-medium text-gray-700">
                  Fuseau horaire par défaut
                </label>
                <select
                  id="default-timezone"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={defaultTimeZone}
                  onChange={(e) => setDefaultTimeZone(e.target.value)}
                >
                  <option value="Africa/Dakar">Dakar (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      // Ajouter d'autres sections au besoin
      default:
        return (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">Sélectionnez une section de paramètres</p>
          </div>
        );
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Paramètres</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar de navigation */}
          <div className="col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Sections</h2>
            </div>
            <nav className="p-4 space-y-1">
              {settingSections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === section.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Contenu des paramètres */}
          <div className="col-span-1 md:col-span-3 bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {settingSections.find(s => s.id === activeSection)?.title || 'Paramètres'}
              </h2>
              <p className="text-sm text-gray-500">
                {settingSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            
            <div className="p-6">
              {renderSettingsContent()}
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSaveSettings}
                >
                  <FiSave className="mr-2 -ml-1 h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage; 