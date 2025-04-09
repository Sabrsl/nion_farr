import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';
import withdrawalService from '../../services/withdrawalService';
import { useAuth } from '../../contexts/AuthContext';
import { Fragment } from 'react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: 'bank_transfer' | 'mobile_money', accountDetails: {
    type: string;
    number: string;
    name: string;
  }) => Promise<void>;
  availableBalance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  availableBalance
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'mobile_money'>('mobile_money');
  const [accountType, setAccountType] = useState<string>('Orange Money');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [errors, setErrors] = useState<{
    amount?: string;
    accountNumber?: string;
    accountName?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [eligibilityMessage, setEligibilityMessage] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && user?.id) {
      checkEligibility();
    }
  }, [isOpen, user?.id]);
  
  const checkEligibility = async () => {
    if (!user?.id) return;
    
    try {
      const eligibilityCheck = await withdrawalService.checkWithdrawalEligibility(user.id);
      setIsEligible(eligibilityCheck.eligible);
      if (!eligibilityCheck.eligible) {
        setEligibilityMessage(eligibilityCheck.reason || 'Vous n\'êtes pas éligible pour effectuer un retrait actuellement');
      } else {
        setEligibilityMessage(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'éligibilité:', error);
      setIsEligible(false);
      setEligibilityMessage('Impossible de vérifier l\'éligibilité au retrait. Veuillez réessayer plus tard.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      amount?: string;
      accountNumber?: string;
      accountName?: string;
    } = {};
    
    // Validation du montant
    if (!amount) {
      newErrors.amount = 'Le montant est requis';
    } else {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Veuillez entrer un montant valide';
      } else if (numAmount > availableBalance) {
        newErrors.amount = 'Le montant ne peut pas dépasser votre solde disponible';
      } else if (numAmount < 2000) {
        newErrors.amount = 'Le montant minimum de retrait est de 2 000 FCFA';
      }
    }
    
    // Validation du numéro de compte
    if (!accountNumber) {
      newErrors.accountNumber = 'Le numéro de compte est requis';
    } else if (paymentMethod === 'mobile_money' && !/^\d{9}$/.test(accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'Veuillez entrer un numéro de téléphone valide (9 chiffres)';
    }
    
    // Validation du nom du compte
    if (!accountName) {
      newErrors.accountName = 'Le nom du compte est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEligible) {
      toast.error(eligibilityMessage || 'Vous n\'êtes pas éligible pour effectuer un retrait actuellement');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      const withdrawalResult = await withdrawalService.onWithdrawalRequested(
        user.id,
        Number(amount),
        paymentMethod,
        {
          type: accountType,
          number: accountNumber,
          name: accountName
        }
      );
      
      if (withdrawalResult.success) {
        // Appeler le callback pour mettre à jour l'interface
        await onWithdraw(Number(amount), paymentMethod, {
          type: accountType,
          number: accountNumber,
          name: accountName
        });
        
        // Réinitialiser le formulaire
        setAmount('');
        setAccountNumber('');
        onClose();
        
        toast.success('Votre demande de retrait a été soumise avec succès');
      } else {
        toast.error(withdrawalResult.message || 'Une erreur est survenue lors de la demande de retrait');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
      toast.error('Une erreur est survenue lors de la demande de retrait');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountTypeChange = (type: string) => {
    setAccountType(type);
    // Réinitialiser le numéro de compte si on change de type
    setAccountNumber('');
    // Ajuster la méthode de paiement en fonction du type
    if (['Orange Money', 'Wave', 'Free Money'].includes(type)) {
      setPaymentMethod('mobile_money');
    } else {
      setPaymentMethod('bank_transfer');
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* Centrer la modale */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Retrait de fonds
                </Dialog.Title>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              {!isEligible && eligibilityMessage && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                  <FiAlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">{eligibilityMessage}</p>
                </div>
              )}
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Solde disponible:</span> {new Intl.NumberFormat('fr-SN', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(availableBalance)}
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Montant à retirer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="amount"
                      className={`block w-full pl-3 pr-12 py-2 border ${errors.amount ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Montant en FCFA"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={isSubmitting || !isEligible}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">FCFA</span>
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Orange Money', 'Wave', 'CBAO'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={`p-2 border rounded-lg text-sm ${
                          accountType === method 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } transition duration-150`}
                        onClick={() => handleAccountTypeChange(method)}
                        disabled={isSubmitting || !isEligible}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    {paymentMethod === 'mobile_money' ? 'Numéro de téléphone' : 'Numéro de compte'}
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    className={`block w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder={paymentMethod === 'mobile_money' ? '77 123 45 67' : 'SN123456789'}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    disabled={isSubmitting || !isEligible}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du titulaire
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    className={`block w-full px-3 py-2 border ${errors.accountName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Nom complet du titulaire"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={isSubmitting || !isEligible}
                  />
                  {errors.accountName && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
                  )}
                </div>
                
                <div className="p-3 mb-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <FiAlertCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      Les retraits sont traités dans un délai de 24 à 48 heures ouvrables. Le montant minimum de retrait est de 2 000 FCFA.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !isEligible}
                  >
                    {isSubmitting ? 'Traitement...' : 'Demander le retrait'}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WithdrawalModal; 