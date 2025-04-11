import React, { useState, useEffect } from 'react';
import { FiKey, FiCopy, FiCheck, FiX, FiSend } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';

interface UserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
}

const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
}) => {
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [sendByEmail, setSendByEmail] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [validityDays, setValidityDays] = useState<number>(7);

  // Générer un mot de passe aléatoire
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += chars.charAt(Math.floor(Math.random() * 26)); // Majuscule
    password += chars.charAt(26 + Math.floor(Math.random() * 26)); // Minuscule
    password += chars.charAt(52 + Math.floor(Math.random() * 10)); // Chiffre
    password += chars.charAt(62 + Math.floor(Math.random() * 8)); // Caractère spécial
    
    // Compléter avec des caractères aléatoires pour atteindre 10 caractères
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Mélanger les caractères
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    setIsCopied(false);
  };

  // Copier le mot de passe dans le presse-papier
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setIsCopied(true);
    toast.success('Mot de passe copié dans le presse-papier');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Réinitialiser le mot de passe de l'utilisateur
  const handleResetPassword = async () => {
    if (!generatedPassword) {
      toast.error('Veuillez d\'abord générer un mot de passe');
      return;
    }

    setLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel API
      // const response = await fetch('/api/admin/users/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId,
      //     password: generatedPassword,
      //     validityDays,
      //     sendEmail: sendByEmail
      //   })
      // });
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        sendByEmail 
          ? `Mot de passe réinitialisé et envoyé à ${userEmail}`
          : 'Mot de passe réinitialisé avec succès'
      );
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      toast.error('Une erreur est survenue lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // Générer le mot de passe au montage du composant
  useEffect(() => {
    if (isOpen) {
      generatePassword();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiKey className="mr-2 text-indigo-600" />
            Générer un mot de passe provisoire
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
              Email: <span className="font-semibold">{userEmail}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe généré
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="password"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={generatedPassword}
                readOnly
              />
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onClick={copyToClipboard}
                title={isCopied ? 'Copié!' : 'Copier le mot de passe'}
              >
                {isCopied ? (
                  <FiCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 text-xs text-indigo-600 hover:text-indigo-500"
              onClick={generatePassword}
            >
              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Générer un nouveau mot de passe
            </button>
          </div>

          <div>
            <label htmlFor="validity" className="block text-sm font-medium text-gray-700">
              Durée de validité (jours)
            </label>
            <input
              type="number"
              id="validity"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={validityDays}
              onChange={(e) => setValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>

          <div className="flex items-center">
            <input
              id="send-email"
              name="send-email"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={sendByEmail}
              onChange={(e) => setSendByEmail(e.target.checked)}
            />
            <label htmlFor="send-email" className="ml-2 block text-sm text-gray-900">
              Envoyer par email à l'utilisateur
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : sendByEmail ? (
                <>
                  <FiSend className="mr-2 -ml-1 h-4 w-4" />
                  Réinitialiser et envoyer
                </>
              ) : (
                <>
                  <FiKey className="mr-2 -ml-1 h-4 w-4" />
                  Réinitialiser le mot de passe
                </>
              )}
            </button>
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPasswordModal; 