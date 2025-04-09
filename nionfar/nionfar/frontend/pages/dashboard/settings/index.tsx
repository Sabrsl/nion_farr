import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiLock, 
  FiGlobe, 
  FiBell, 
  FiCreditCard, 
  FiSave,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheck,
  FiX
} from 'react-icons/fi/index.js';

const SettingsPage: NextPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile'|'security'|'notification'|'payment'|'language'>('profile');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Paramètres | NionFar.sn</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-500 mb-6">Gérez votre compte et vos préférences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiUser className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-500'}`} />
                Profil
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  activeTab === 'security'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiLock className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-gray-500'}`} />
                Sécurité
              </button>
              
              <button
                onClick={() => setActiveTab('notification')}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  activeTab === 'notification'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiBell className={`mr-3 h-5 w-5 ${activeTab === 'notification' ? 'text-indigo-600' : 'text-gray-500'}`} />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  activeTab === 'payment'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiCreditCard className={`mr-3 h-5 w-5 ${activeTab === 'payment' ? 'text-indigo-600' : 'text-gray-500'}`} />
                Paiements
              </button>
              
              <button
                onClick={() => setActiveTab('language')}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  activeTab === 'language'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiGlobe className={`mr-3 h-5 w-5 ${activeTab === 'language' ? 'text-indigo-600' : 'text-gray-500'}`} />
                Langue et région
              </button>
            </nav>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            {activeTab === 'profile' && (
              <ProfileSettings handleSubmit={handleSubmit} loading={loading} />
            )}
            
            {activeTab === 'security' && (
              <SecuritySettings handleSubmit={handleSubmit} loading={loading} />
            )}
            
            {activeTab === 'notification' && (
              <NotificationSettings handleSubmit={handleSubmit} loading={loading} />
            )}
            
            {activeTab === 'payment' && (
              <PaymentSettings handleSubmit={handleSubmit} loading={loading} />
            )}
            
            {activeTab === 'language' && (
              <LanguageSettings handleSubmit={handleSubmit} loading={loading} />
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Component Props Interface
interface SettingsComponentProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

// Profile Settings Component
const ProfileSettings: React.FC<SettingsComponentProps> = ({ handleSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: 'Amadou Diop',
    email: 'amadou.diop@example.com',
    phone: '+221 77 123 45 67',
    bio: 'Designer graphique spécialisé en branding et UX/UI avec plus de 5 ans d\'expérience',
    address: 'Dakar, Sénégal'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Biographie
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Security Settings Component
const SecuritySettings: React.FC<SettingsComponentProps> = ({ handleSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sécurité du compte</h2>
      
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiShield className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">Authentification à deux facteurs</h3>
            <div className="mt-1 text-sm text-indigo-700">
              <p>L'authentification à deux facteurs ajoute une couche supplémentaire de sécurité à votre compte.</p>
              <button className="mt-2 text-indigo-600 font-medium hover:text-indigo-800">
                Activer maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères, incluant une lettre majuscule et un chiffre.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mise à jour...
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Mettre à jour le mot de passe
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings: React.FC<SettingsComponentProps> = ({ handleSubmit, loading }) => {
  const [notifications, setNotifications] = useState({
    email: {
      newOrder: true,
      messages: true,
      updates: false,
      promotions: false
    },
    push: {
      newOrder: true,
      messages: true,
      updates: true,
      promotions: false
    }
  });

  const toggleNotification = (type: 'email' | 'push', setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: !prev[type][setting as keyof typeof prev.email]
      }
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences de notification</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">Notifications par email</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nouvelles commandes</p>
                  <p className="text-xs text-gray-500">Recevoir des emails lorsque vous avez une nouvelle commande</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('email', 'newOrder')}
                  className={`${
                    notifications.email.newOrder ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.email.newOrder ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Messages</p>
                  <p className="text-xs text-gray-500">Recevoir des emails pour les nouveaux messages</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('email', 'messages')}
                  className={`${
                    notifications.email.messages ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.email.messages ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Mises à jour de la plateforme</p>
                  <p className="text-xs text-gray-500">Recevoir des emails sur les nouvelles fonctionnalités</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('email', 'updates')}
                  className={`${
                    notifications.email.updates ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.email.updates ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Promotions et actualités</p>
                  <p className="text-xs text-gray-500">Recevoir des offres promotionnelles et des actualités</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('email', 'promotions')}
                  className={`${
                    notifications.email.promotions ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.email.promotions ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Push Notifications */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">Notifications push</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nouvelles commandes</p>
                  <p className="text-xs text-gray-500">Recevoir des notifications push pour les nouvelles commandes</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('push', 'newOrder')}
                  className={`${
                    notifications.push.newOrder ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.push.newOrder ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Messages</p>
                  <p className="text-xs text-gray-500">Recevoir des notifications push pour les nouveaux messages</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('push', 'messages')}
                  className={`${
                    notifications.push.messages ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.push.messages ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Mises à jour de la plateforme</p>
                  <p className="text-xs text-gray-500">Recevoir des notifications push sur les nouvelles fonctionnalités</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('push', 'updates')}
                  className={`${
                    notifications.push.updates ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.push.updates ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Promotions et actualités</p>
                  <p className="text-xs text-gray-500">Recevoir des notifications push pour les offres promotionnelles</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('push', 'promotions')}
                  className={`${
                    notifications.push.promotions ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.push.promotions ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Enregistrer les préférences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Payment Settings Component
const PaymentSettings: React.FC<SettingsComponentProps> = ({ handleSubmit, loading }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'bank1',
      type: 'bank',
      name: 'CBAO',
      accountNumber: '•••• •••• 4567',
      isDefault: true
    },
    {
      id: 'mobile1',
      type: 'mobile',
      name: 'Orange Money',
      accountNumber: '+221 77 •••• 8901',
      isDefault: false
    }
  ]);

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'bank',
    name: '',
    accountNumber: '',
    isDefault: false
  });

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const handleAddMethod = () => {
    const id = `${newMethod.type}${Math.floor(Math.random() * 10000)}`;
    const createdMethod = {
      ...newMethod,
      id
    };
    
    setPaymentMethods(methods => {
      // Si le nouveau mode est par défaut, mettre les autres à false
      if (newMethod.isDefault) {
        return [...methods.map(m => ({ ...m, isDefault: false })), createdMethod];
      }
      return [...methods, createdMethod];
    });
    
    // Reset form
    setNewMethod({
      type: 'bank',
      name: '',
      accountNumber: '',
      isDefault: false
    });
    setShowAddMethod(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Méthodes de paiement</h2>
      
      <div className="mb-6">
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  method.type === 'bank' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  {method.type === 'bank' ? (
                    <FiCreditCard className={`h-5 w-5 ${
                      method.type === 'bank' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{method.name}</p>
                  <p className="text-xs text-gray-500">{method.accountNumber}</p>
                  {method.isDefault && (
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Par défaut
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {!method.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(method.id)}
                    className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteMethod(method.id)}
                  className="text-xs bg-white border border-red-300 rounded px-2 py-1 text-red-700 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          
          {showAddMethod ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Ajouter une nouvelle méthode</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newMethod.type}
                    onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="bank">Compte bancaire</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {newMethod.type === 'bank' ? 'Nom de la banque' : 'Service'}
                  </label>
                  <input
                    type="text"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder={newMethod.type === 'bank' ? 'Ex: CBAO, SGBS...' : 'Ex: Orange Money, Wave...'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {newMethod.type === 'bank' ? 'Numéro de compte' : 'Numéro de téléphone'}
                  </label>
                  <input
                    type="text"
                    value={newMethod.accountNumber}
                    onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder={newMethod.type === 'bank' ? '1234 5678 9012 3456' : '+221 77 123 45 67'}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultMethod"
                    checked={newMethod.isDefault}
                    onChange={(e) => setNewMethod({ ...newMethod, isDefault: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="defaultMethod" className="ml-2 block text-xs text-gray-700">
                    Définir comme méthode par défaut
                  </label>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMethod(false)}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMethod}
                    className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddMethod(true)}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 border-dashed rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <span className="mr-2">+</span> Ajouter une méthode de paiement
            </button>
          )}
        </div>
      </div>
      
      <h3 className="text-base font-medium text-gray-900 mb-3">Préférences de paiement</h3>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="automaticWithdrawal"
                name="automaticWithdrawal"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="automaticWithdrawal" className="font-medium text-gray-700">Retrait automatique</label>
              <p className="text-gray-500">Retirer automatiquement les fonds sur votre compte par défaut lorsqu'ils atteignent 50 000 FCFA</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="savePaymentInfo"
                name="savePaymentInfo"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="savePaymentInfo" className="font-medium text-gray-700">Enregistrer les informations de paiement</label>
              <p className="text-gray-500">Enregistrer automatiquement les nouvelles méthodes de paiement pour les retraits futurs</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Enregistrer les préférences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Language Settings Component
const LanguageSettings: React.FC<SettingsComponentProps> = ({ handleSubmit, loading }) => {
  const [language, setLanguage] = useState('fr');
  const [region, setRegion] = useState('SN');
  const [dateFormat, setDateFormat] = useState('DMY');
  const [timeFormat, setTimeFormat] = useState('24');

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Langue et préférences régionales</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Langue
              </label>
              <select
                id="language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="wo">Wolof</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <select
                id="region"
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="SN">Sénégal</option>
                <option value="CI">Côte d'Ivoire</option>
                <option value="ML">Mali</option>
                <option value="CM">Cameroun</option>
                <option value="BF">Burkina Faso</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                Format de date
              </label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="DMY">JJ/MM/AAAA (31/12/2023)</option>
                <option value="MDY">MM/JJ/AAAA (12/31/2023)</option>
                <option value="YMD">AAAA/MM/JJ (2023/12/31)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-1">
                Format d'heure
              </label>
              <select
                id="timeFormat"
                name="timeFormat"
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="24">24 heures (14:30)</option>
                <option value="12">12 heures (2:30 PM)</option>
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">Devise et format de nombre</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue="XOF"
                >
                  <option value="XOF">Franc CFA BCEAO (XOF)</option>
                  <option value="XAF">Franc CFA BEAC (XAF)</option>
                  <option value="USD">Dollar américain (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="numberFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  Format de nombre
                </label>
                <select
                  id="numberFormat"
                  name="numberFormat"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue="period"
                >
                  <option value="period">1.234,56</option>
                  <option value="comma">1,234.56</option>
                  <option value="space">1 234,56</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Enregistrer les préférences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage; 