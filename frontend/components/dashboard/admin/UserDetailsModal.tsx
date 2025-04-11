import React, { useState, useEffect } from 'react';
import { FiUser, FiX, FiEdit2, FiSave, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiCreditCard, FiPieChart } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onStatusChange?: (userId: string, newStatus: string) => void;
  userData?: any;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userId,
  onStatusChange,
  userData
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails();
    }
  }, [isOpen, userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch(`/api/admin/users/${userId}`);
      // const data = await response.json();
      
      // Simulation d'un délai et de données utilisateur
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Utiliser les données utilisateur fournies ou générer des données fictives
      let mockUser;
      
      if (userData) {
        // Si les données utilisateur sont fournies, compléter avec des données fictives pour les champs manquants
        mockUser = {
          id: userId,
          name: userData.name || `Utilisateur ${userId}`,
          email: userData.email || `user${userId}@example.com`,
          phone: userData.phone || `+221 77 ${Math.floor(100000 + Math.random() * 900000)}`,
          address: userData.address || 'Dakar, Sénégal',
          role: userData.role || 'client',
          status: userData.status || 'active',
          createdAt: userData.created || new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          lastLogin: userData.lastLogin || new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          profilePicture: userData.profilePicture || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
          bio: userData.bio || 'Professionnel avec expérience dans son domaine.',
          skills: userData.skills || ['HTML', 'CSS', 'JavaScript'].slice(0, Math.floor(Math.random() * 3) + 1),
          verificationStatus: userData.verificationStatus || {
            email: Math.random() > 0.2,
            phone: Math.random() > 0.3,
            identity: Math.random() > 0.4
          },
          accountDetails: userData.accountDetails || {
            balance: Math.floor(Math.random() * 1000000),
            totalEarnings: Math.floor(Math.random() * 2000000),
            withdrawals: Math.floor(Math.random() * 1500000),
            pendingPayments: Math.floor(Math.random() * 500000)
          },
          statistics: userData.statistics || {
            completedProjects: Math.floor(Math.random() * 50),
            ongoingProjects: Math.floor(Math.random() * 5),
            servicesInProduction: Math.floor(Math.random() * 10),
            reviews: Math.floor(Math.random() * 40),
            averageRating: (3 + Math.random() * 2).toFixed(1),
            responseRate: Math.floor(75 + Math.random() * 25),
            responseTime: `${Math.floor(1 + Math.random() * 24)} heures`
          },
          documents: userData.documents || [
            { id: 'doc1', type: 'ID', status: Math.random() > 0.3 ? 'verified' : 'pending', date: new Date(Date.now() - Math.random() * 15768000000).toISOString() },
            { id: 'doc2', type: 'Diplôme', status: Math.random() > 0.4 ? 'verified' : 'pending', date: new Date(Date.now() - Math.random() * 15768000000).toISOString() }
          ]
        };
      } else {
        // Données complètement fictives si aucune donnée utilisateur n'est fournie
        mockUser = {
          id: userId,
          name: `Utilisateur ${userId}`,
          email: `user${userId}@example.com`,
          phone: `+221 77 ${Math.floor(100000 + Math.random() * 900000)}`,
          address: 'Dakar, Sénégal',
          role: ['client', 'freelancer', 'admin'][Math.floor(Math.random() * 3)],
          status: 'active',
          createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          lastLogin: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          profilePicture: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
          bio: 'Professionnel avec expérience dans son domaine. Disponible pour diverses prestations.',
          skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 5) + 1),
          verificationStatus: {
            email: Math.random() > 0.2,
            phone: Math.random() > 0.3,
            identity: Math.random() > 0.4
          },
          accountDetails: {
            balance: Math.floor(Math.random() * 1000000),
            totalEarnings: Math.floor(Math.random() * 2000000),
            withdrawals: Math.floor(Math.random() * 1500000),
            pendingPayments: Math.floor(Math.random() * 500000)
          },
          statistics: {
            completedProjects: Math.floor(Math.random() * 50),
            ongoingProjects: Math.floor(Math.random() * 5),
            servicesInProduction: Math.floor(Math.random() * 10),
            reviews: Math.floor(Math.random() * 40),
            averageRating: (3 + Math.random() * 2).toFixed(1),
            responseRate: Math.floor(75 + Math.random() * 25),
            responseTime: `${Math.floor(1 + Math.random() * 24)} heures`
          },
          documents: [
            { id: 'doc1', type: 'ID', status: Math.random() > 0.3 ? 'verified' : 'pending', date: new Date(Date.now() - Math.random() * 15768000000).toISOString() },
            { id: 'doc2', type: 'Diplôme', status: Math.random() > 0.4 ? 'verified' : 'pending', date: new Date(Date.now() - Math.random() * 15768000000).toISOString() }
          ]
        };
      }
      
      setUser(mockUser);
      setEditedUser(JSON.parse(JSON.stringify(mockUser))); // Clone pour l'édition
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des détails utilisateur:', error);
      toast.error('Une erreur est survenue lors du chargement des détails utilisateur');
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch(`/api/admin/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedUser)
      // });
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(editedUser);
      setEditMode(false);
      toast.success('Les modifications ont été enregistrées avec succès');
      
      // Si le statut a changé, notifier le composant parent
      if (user.status !== editedUser.status && onStatusChange) {
        onStatusChange(userId, editedUser.status);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des modifications:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement des modifications');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(JSON.parse(JSON.stringify(user))); // Restaurer l'état original
    setEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Obtenir le badge de rôle
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Administrateur
          </span>
        );
      case 'freelancer':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Freelance
          </span>
        );
      case 'client':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Client
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {role}
          </span>
        );
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
      case 'inactive':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactif</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'suspended':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Suspendu</span>;
      case 'blocked':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Bloqué</span>;
      case 'disabled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Désactivé</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Formatage de date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiUser className="mr-2 text-indigo-600" />
            Détails de l'utilisateur
          </h3>
          <div className="flex items-center space-x-2">
            {!editMode ? (
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
                onClick={() => setEditMode(true)}
              >
                <FiEdit2 className="h-5 w-5 mr-1" />
                Modifier
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                  onClick={handleCancelEdit}
                >
                  <FiX className="h-5 w-5 mr-1" />
                  Annuler
                </button>
                <button
                  type="button"
                  className="text-green-600 hover:text-green-800 flex items-center"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <svg className="animate-spin h-5 w-5 mr-1 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FiSave className="h-5 w-5 mr-1" />
                  )}
                  Enregistrer
                </button>
              </>
            )}
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* En-tête du profil */}
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={editedUser.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <FiMail className="mr-1" /> {user.email}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <FiPhone className="mr-1" /> {user.phone}
                    </div>
                  </>
                )}
              </div>
              <div className="flex-shrink-0 border-l pl-4 hidden md:block">
                <div className="text-sm text-gray-500">Membre depuis</div>
                <div className="font-medium flex items-center">
                  <FiCalendar className="mr-1 text-indigo-500" /> {formatDate(user.createdAt)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Dernière connexion</div>
                <div className="font-medium flex items-center">
                  <FiCalendar className="mr-1 text-indigo-500" /> {formatDate(user.lastLogin)}
                </div>
              </div>
            </div>

            {/* Onglets pour les informations détaillées */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                  {editMode ? (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Adresse
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Rôle
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.role}
                          onChange={handleInputChange}
                        >
                          <option value="client">Client</option>
                          <option value="freelancer">Freelance</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Statut
                        </label>
                        <select
                          id="status"
                          name="status"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.status}
                          onChange={handleInputChange}
                        >
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="pending">En attente</option>
                          <option value="suspended">Suspendu</option>
                          <option value="blocked">Bloqué</option>
                          <option value="disabled">Désactivé</option>
                          <option value="warning">Avertissement</option>
                          <option value="payment_hold">Paiements bloqués</option>
                          <option value="ban">Bannissement définitif</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Biographie
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={editedUser.bio || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-500">Adresse:</span> 
                        <span className="ml-2 text-gray-800 flex items-center">
                          <FiMapPin className="mr-1" /> {user.address}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Rôle:</span> 
                        <span className="ml-2">{getRoleBadge(user.role)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Statut:</span> 
                        <span className="ml-2">{getStatusBadge(user.status)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Bio:</span> 
                        <p className="mt-1 text-gray-800">{user.bio || 'Aucune biographie disponible.'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Statistiques */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiPieChart className="mr-2 text-indigo-500" />
                    Statistiques
                  </h3>
                  {user.statistics && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Projets terminés</div>
                        <div className="text-lg font-semibold">{user.statistics.completedProjects}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Projets en cours</div>
                        <div className="text-lg font-semibold">{user.statistics.ongoingProjects}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Services en production</div>
                        <div className="text-lg font-semibold">{user.statistics.servicesInProduction}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Avis clients</div>
                        <div className="text-lg font-semibold">{user.statistics.reviews}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Note moyenne</div>
                        <div className="text-lg font-semibold">{user.statistics.averageRating}/5</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Taux de réponse</div>
                        <div className="text-lg font-semibold">{user.statistics.responseRate}%</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Temps de réponse</div>
                        <div className="text-lg font-semibold">{user.statistics.responseTime}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Finances */}
                {user.accountDetails && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FiCreditCard className="mr-2 text-indigo-500" />
                      Finances
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Solde actuel</div>
                        <div className="text-lg font-semibold">{user.accountDetails.balance.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Gains totaux</div>
                        <div className="text-lg font-semibold">{user.accountDetails.totalEarnings.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Retraits effectués</div>
                        <div className="text-lg font-semibold">{user.accountDetails.withdrawals.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Paiements en attente</div>
                        <div className="text-lg font-semibold">{user.accountDetails.pendingPayments.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vérifications */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiShield className="mr-2 text-indigo-500" />
                    Statut de vérification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Email</div>
                      {user.verificationStatus?.email ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Vérifié
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Non vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Téléphone</div>
                      {user.verificationStatus?.phone ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Vérifié
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Non vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Identité</div>
                      {user.verificationStatus?.identity ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Vérifiée
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Non vérifiée
                        </span>
                      )}
                    </div>
                  </div>

                  {user.documents && user.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Documents soumis</h4>
                      <ul className="divide-y divide-gray-200">
                        {user.documents.map((doc: any) => (
                          <li key={doc.id} className="py-2">
                            <div className="flex justify-between">
                              <div className="text-sm">{doc.type}</div>
                              <div className="text-xs">
                                {doc.status === 'verified' ? (
                                  <span className="text-green-600">Vérifié le {formatDate(doc.date)}</span>
                                ) : (
                                  <span className="text-yellow-600">En attente</span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                Fermer
              </button>
              {!editMode && (
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setEditMode(true)}
                >
                  <FiEdit2 className="mr-2 h-4 w-4" />
                  Modifier
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal; 