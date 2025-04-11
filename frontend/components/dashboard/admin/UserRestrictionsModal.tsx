import React, { useState } from 'react';
import { FiShield, FiClock, FiX, FiAlertTriangle, FiLock, FiUserCheck, FiUserX, FiUserMinus, FiUser, FiDollarSign, FiBell, FiSlash } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';

// Modifier les types pour inclure tous les statuts demandés
type UserStatus = 'active' | 'inactive' | 'suspended' | 'blocked' | 'disabled' | 'pending' | 'warning' | 'payment_hold' | 'ban';

interface UserRestrictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentStatus: string;
}

const UserRestrictionsModal: React.FC<UserRestrictionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>((currentStatus as UserStatus) || 'active');
  const [restrictionReason, setRestrictionReason] = useState('');
  const [restrictionDuration, setRestrictionDuration] = useState(24);
  const [durationType, setDurationType] = useState<'hours' | 'days'>('hours');
  const [loading, setLoading] = useState(false);

  const handleApplyRestriction = async () => {
    if (!restrictionReason) {
      toast.error('Veuillez fournir une raison pour cette restriction');
      return;
    }

    setLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch('/api/admin/users/update-status', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId,
      //     newStatus: selectedStatus,
      //     reason: restrictionReason,
      //     duration: restrictionDuration,
      //     durationType
      //   })
      // });
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let actionLabel = '';
      switch(selectedStatus) {
        case 'active': 
          actionLabel = 'Compte activé'; 
          break;
        case 'inactive': 
          actionLabel = 'Compte désactivé'; 
          break;
        case 'suspended': 
          actionLabel = 'Compte suspendu'; 
          break;
        case 'blocked': 
          actionLabel = 'Compte bloqué'; 
          break;
        case 'disabled': 
          actionLabel = 'Compte désactivé'; 
          break;
        case 'pending': 
          actionLabel = 'Compte mis en attente'; 
          break;
        case 'warning':
          actionLabel = 'Avertissement envoyé';
          break;
        case 'payment_hold':
          actionLabel = 'Paiements bloqués';
          break;
        case 'ban':
          actionLabel = 'Compte banni';
          break;
      }
      
      toast.success(`${actionLabel} pour ${userName}`);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error('Une erreur est survenue lors de la modification du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateUser = async () => {
    setLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch(`/api/admin/users/${userId}/activate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`Le compte de ${userName} a été réactivé avec succès`);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réactivation du compte:', error);
      toast.error('Une erreur est survenue lors de la réactivation du compte');
    } finally {
      setLoading(false);
    }
  };

  const isUserRestricted = currentStatus !== 'active' && currentStatus !== 'pending';

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: UserStatus) => {
    switch(status) {
      case 'active': return <FiUserCheck className="h-5 w-5 text-green-500" />;
      case 'inactive': return <FiUserMinus className="h-5 w-5 text-gray-500" />;
      case 'suspended': return <FiUserX className="h-5 w-5 text-orange-500" />;
      case 'blocked': return <FiLock className="h-5 w-5 text-red-500" />;
      case 'disabled': return <FiUserX className="h-5 w-5 text-red-500" />;
      case 'pending': return <FiUser className="h-5 w-5 text-yellow-500" />;
      case 'warning': return <FiBell className="h-5 w-5 text-yellow-500" />;
      case 'payment_hold': return <FiDollarSign className="h-5 w-5 text-orange-500" />;
      case 'ban': return <FiSlash className="h-5 w-5 text-red-500" />;
      default: return <FiUser className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiShield className="mr-2 text-indigo-600" />
            Gestion du statut utilisateur
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Utilisateur: <span className="font-semibold">{userName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Statut actuel: <span className={`font-semibold ${
                currentStatus === 'active' ? 'text-green-600' :
                currentStatus === 'suspended' ? 'text-orange-600' :
                currentStatus === 'blocked' ? 'text-red-600' :
                currentStatus === 'disabled' ? 'text-red-600' :
                currentStatus === 'inactive' ? 'text-gray-600' : 'text-yellow-600'
              }`}>
                {currentStatus === 'active' ? 'Actif' :
                 currentStatus === 'suspended' ? 'Suspendu' :
                 currentStatus === 'blocked' ? 'Bloqué' :
                 currentStatus === 'disabled' ? 'Désactivé' :
                 currentStatus === 'inactive' ? 'Inactif' :
                 currentStatus === 'pending' ? 'En attente' : currentStatus}
              </span>
            </p>
          </div>

          {isUserRestricted ? (
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
              <div className="flex items-start">
                <FiAlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Utilisateur restreint</h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    Cet utilisateur est actuellement restreint. Vous pouvez soit modifier son statut, soit le réactiver complètement.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleReactivateUser}
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Réactiver cet utilisateur
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modifier le statut de l'utilisateur
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="active"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  checked={selectedStatus === 'active'}
                  onChange={() => setSelectedStatus('active')}
                />
                <label htmlFor="active" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiUserCheck className="mr-2 h-4 w-4 text-green-500" />
                  Actif
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="inactive"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                  checked={selectedStatus === 'inactive'}
                  onChange={() => setSelectedStatus('inactive')}
                />
                <label htmlFor="inactive" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiUserMinus className="mr-2 h-4 w-4 text-gray-500" />
                  Inactif
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="suspended"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  checked={selectedStatus === 'suspended'}
                  onChange={() => setSelectedStatus('suspended')}
                />
                <label htmlFor="suspended" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiUserX className="mr-2 h-4 w-4 text-orange-500" />
                  Suspendu
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="blocked"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={selectedStatus === 'blocked'}
                  onChange={() => setSelectedStatus('blocked')}
                />
                <label htmlFor="blocked" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiLock className="mr-2 h-4 w-4 text-red-500" />
                  Bloqué
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="disabled"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={selectedStatus === 'disabled'}
                  onChange={() => setSelectedStatus('disabled')}
                />
                <label htmlFor="disabled" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiUserX className="mr-2 h-4 w-4 text-red-500" />
                  Désactivé
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="warning"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                  checked={selectedStatus === 'warning'}
                  onChange={() => setSelectedStatus('warning')}
                />
                <label htmlFor="warning" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiBell className="mr-2 h-4 w-4 text-yellow-500" />
                  Avertissement
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="payment_hold"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  checked={selectedStatus === 'payment_hold'}
                  onChange={() => setSelectedStatus('payment_hold')}
                />
                <label htmlFor="payment_hold" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiDollarSign className="mr-2 h-4 w-4 text-orange-500" />
                  Blocage des paiements
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="ban"
                  name="user-status"
                  type="radio"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={selectedStatus === 'ban'}
                  onChange={() => setSelectedStatus('ban')}
                />
                <label htmlFor="ban" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                  <FiSlash className="mr-2 h-4 w-4 text-red-500" />
                  Bannissement définitif
                </label>
              </div>
            </div>
          </div>

          {selectedStatus !== 'active' && (
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Raison de la restriction
              </label>
              <textarea
                id="reason"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                placeholder="Expliquez la raison de cette restriction..."
              />
            </div>
          )}

          {selectedStatus !== 'active' && selectedStatus !== 'blocked' && selectedStatus !== 'disabled' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Durée
                </label>
                <input
                  type="number"
                  id="duration"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={restrictionDuration}
                  onChange={(e) => setRestrictionDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="duration-type" className="block text-sm font-medium text-gray-700">
                  Unité
                </label>
                <select
                  id="duration-type"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as 'hours' | 'days')}
                >
                  <option value="hours">Heures</option>
                  <option value="days">Jours</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 sm:mt-6 flex space-x-3">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={handleApplyRestriction}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRestrictionsModal; 