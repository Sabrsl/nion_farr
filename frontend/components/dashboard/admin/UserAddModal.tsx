import React, { useState } from 'react';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiUserCheck, FiUserPlus } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
}

const UserAddModal: React.FC<UserAddModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    role: 'client',
    status: 'active',
    password: '',
    confirmPassword: '',
    profilePicture: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
  });
  const [step, setStep] = useState(1); // 1: informations de base, 2: informations complémentaires
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return false;
    }

    const phoneRegex = /^\+?[0-9\s-]{8,15}$/;
    if (!phoneRegex.test(newUser.phone)) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!newUser.password) {
      toast.error('Veuillez définir un mot de passe');
      return false;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch('/api/admin/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newUser)
      // });
      // const data = await response.json();
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Génération de données supplémentaires pour l'utilisateur
      const completeUser = {
        ...newUser,
        id: Math.floor(Math.random() * 10000).toString(),
        created: new Date().toISOString(),
        lastLogin: null,
        verificationStatus: {
          email: false,
          phone: false,
          identity: false
        },
        statistics: {
          completedProjects: 0,
          ongoingProjects: 0,
          servicesInProduction: 0,
          reviews: 0,
          averageRating: 0,
          responseRate: 100,
          responseTime: 'N/A'
        },
        accountDetails: {
          balance: 0,
          totalEarnings: 0,
          withdrawals: 0,
          pendingPayments: 0
        }
      };
      
      // On ne transmet pas le mot de passe en clair
      const { password, confirmPassword, ...userToSend } = completeUser;
      
      onUserAdded(userToSend);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast.error('Une erreur est survenue lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-lg">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiUserPlus className="mr-2 text-indigo-600" />
            {step === 1 ? 'Ajouter un utilisateur - Étape 1/2' : 'Ajouter un utilisateur - Étape 2/2'}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {step === 1 ? (
            // Étape 1 - Informations de base
            <>
              <div className="space-y-4 pb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="john.doe@example.com"
                        value={newUser.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="+221 77 123 45 67"
                        value={newUser.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Dakar, Sénégal"
                      value={newUser.address}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    placeholder="Description de l'utilisateur..."
                    value={newUser.bio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newUser.role}
                      onChange={handleInputChange}
                    >
                      <option value="client">Client</option>
                      <option value="freelancer">Freelance</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Statut <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newUser.status}
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
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleNextStep}
                >
                  Suivant
                </button>
              </div>
            </>
          ) : (
            // Étape 2 - Informations de sécurité
            <>
              <div className="space-y-6 pb-4">
                <div className="border-b pb-4">
                  <div className="flex items-center mb-4">
                    <FiUserCheck className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="text-base font-medium text-gray-900">Informations de l'utilisateur</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom:</span>
                      <p className="font-medium">{newUser.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{newUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Téléphone:</span>
                      <p className="font-medium">{newUser.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rôle:</span>
                      <p className="font-medium capitalize">{newUser.role}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <FiShield className="h-5 w-5 text-indigo-500 mr-2" />
                    <h4 className="text-base font-medium text-gray-900">Informations de sécurité</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newUser.password}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newUser.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
                    <p>Un email sera envoyé à l'utilisateur avec ses informations de connexion.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handlePrevStep}
                >
                  Retour
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Créer l'utilisateur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserAddModal; 