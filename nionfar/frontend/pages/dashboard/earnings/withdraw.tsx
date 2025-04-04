import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useSecurityCheck } from '../../../hooks/useSecurityCheck';

const WithdrawPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'mock-user-id';
  
  // Utiliser le hook de sécurité
  const { 
    isLoading: isSecurityCheckLoading, 
    isVerified, 
    canWithdraw, 
    isSuspiciousActivity,
    identityStatus,
    activityStatus,
    checkWithdrawalEligibility
  } = useSecurityCheck(userId);
  
  const [availableBalance, setAvailableBalance] = useState(250000); // Simulé : 250 000 FCFA
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile_money'>('mobile_money');
  const [accountDetails, setAccountDetails] = useState({
    mobileOperator: 'orange_money',
    accountNumber: '',
    accountName: '',
    bankName: '',
    bankCode: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<
    'idle' | 'verifying' | 'approved' | 'denied' | 'additional_verification' | 'success'
  >('idle');
  const [withdrawalResult, setWithdrawalResult] = useState<{
    transactionId?: string;
    reasons?: string[];
    estimatedTime?: string;
  } | null>(null);
  
  // Vérifier si les champs sont valides
  const isFormValid = () => {
    if (withdrawalAmount <= 0) return false;
    if (withdrawalAmount > availableBalance) return false;
    
    if (paymentMethod === 'mobile_money') {
      return accountDetails.accountNumber.length >= 9 && accountDetails.accountName.trim() !== '';
    } else if (paymentMethod === 'bank') {
      return (
        accountDetails.accountNumber.length >= 10 &&
        accountDetails.accountName.trim() !== '' &&
        accountDetails.bankName.trim() !== ''
      );
    }
    
    return false;
  };
  
  // Gérer le changement de montant
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setWithdrawalAmount(value);
  };
  
  // Gérer le changement de méthode de paiement
  const handlePaymentMethodChange = (method: 'bank' | 'mobile_money') => {
    setPaymentMethod(method);
  };
  
  // Gérer le changement de détails du compte
  const handleAccountDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Soumettre la demande de retrait
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Veuillez remplir correctement tous les champs requis.');
      return;
    }
    
    setIsSubmitting(true);
    setWithdrawalStatus('verifying');
    
    try {
      // Vérifier l'éligibilité au retrait
      const eligibilityResult = await checkWithdrawalEligibility(withdrawalAmount);
      
      if (eligibilityResult.isEligible) {
        // Si une vérification supplémentaire est requise
        if (eligibilityResult.requiresAdditionalVerification) {
          setWithdrawalStatus('additional_verification');
          setWithdrawalResult({
            reasons: ['Retrait de montant élevé nécessitant une vérification supplémentaire.']
          });
        } else {
          // Simuler un appel API pour effectuer le retrait
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simuler une réponse réussie
          setWithdrawalStatus('success');
          setWithdrawalResult({
            transactionId: `WD-${Date.now()}`,
            estimatedTime: '24 à 48 heures'
          });
          
          // Mettre à jour le solde disponible
          setAvailableBalance(prev => prev - withdrawalAmount);
        }
      } else {
        // La demande de retrait est refusée
        setWithdrawalStatus('denied');
        setWithdrawalResult({
          reasons: eligibilityResult.reasons
        });
      }
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
      toast.error('Une erreur est survenue lors de la demande de retrait. Veuillez réessayer.');
      setWithdrawalStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Formater un montant en FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setWithdrawalAmount(0);
    setAccountDetails({
      mobileOperator: 'orange_money',
      accountNumber: '',
      accountName: '',
      bankName: '',
      bankCode: ''
    });
    setWithdrawalStatus('idle');
    setWithdrawalResult(null);
  };
  
  return (
    <DashboardLayout title="Retrait | NionFar.sn">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Retrait de fonds</h1>
          <p className="text-gray-600 mb-6">
            Retirez vos gains vers votre compte bancaire ou mobile money.
          </p>

          {/* État de vérification KYC */}
          {!isSecurityCheckLoading && identityStatus && (
            <div className={`mb-6 rounded-lg border p-4 ${
              isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                {isVerified ? (
                  <FiCheckCircle className="mt-0.5 h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <FiInfo className="mt-0.5 h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    {isVerified 
                      ? 'Votre compte est vérifié' 
                      : 'Vérification d\'identité requise'}
                  </h3>
                  {isVerified ? (
                    <p className="mt-1 text-sm text-gray-600">
                      Vous pouvez effectuer des retraits sans limitation.
                    </p>
                  ) : (
                    <div className="mt-1 text-sm text-gray-600">
                      <p className="mb-2">Vous devez compléter la vérification d'identité pour pouvoir effectuer des retraits.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {identityStatus.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                      <button
                        className="mt-3 text-yellow-800 font-medium hover:text-yellow-900"
                        onClick={() => router.push('/dashboard/settings/verification')}
                      >
                        Compléter ma vérification →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alerte d'activité suspecte */}
          {!isSecurityCheckLoading && isSuspiciousActivity && activityStatus && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <FiAlertTriangle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Activité suspecte détectée
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p className="mb-2">Nous avons détecté une activité inhabituelle sur votre compte :</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {activityStatus.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                    <p className="mt-2">Les retraits peuvent être temporairement restreints. Veuillez contacter notre support si vous pensez qu'il s'agit d'une erreur.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de retrait */}
          {withdrawalStatus === 'idle' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6 bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Solde disponible</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
                </div>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setWithdrawalAmount(availableBalance)}
                >
                  Retirer tout
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Montant du retrait */}
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Montant du retrait (FCFA)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      min="5000"
                      max={availableBalance}
                      value={withdrawalAmount || ''}
                      onChange={handleAmountChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">FCFA</span>
                    </div>
                  </div>
                  {withdrawalAmount > availableBalance && (
                    <p className="mt-2 text-sm text-red-600">
                      Le montant demandé dépasse votre solde disponible.
                    </p>
                  )}
                  {withdrawalAmount > 0 && withdrawalAmount < 5000 && (
                    <p className="mt-2 text-sm text-red-600">
                      Le montant minimum de retrait est de 5 000 FCFA.
                    </p>
                  )}
                </div>

                {/* Méthode de paiement */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-lg flex items-center justify-center ${
                        paymentMethod === 'mobile_money'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                      onClick={() => handlePaymentMethodChange('mobile_money')}
                    >
                      <span className="font-medium">Mobile Money</span>
                    </button>
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-lg flex items-center justify-center ${
                        paymentMethod === 'bank'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                      onClick={() => handlePaymentMethodChange('bank')}
                    >
                      <span className="font-medium">Virement bancaire</span>
                    </button>
                  </div>
                </div>

                {/* Détails de paiement - Mobile Money */}
                {paymentMethod === 'mobile_money' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="mobileOperator" className="block text-sm font-medium text-gray-700 mb-1">
                        Opérateur
                      </label>
                      <select
                        id="mobileOperator"
                        name="mobileOperator"
                        value={accountDetails.mobileOperator}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="orange_money">Orange Money</option>
                        <option value="free_money">Free Money</option>
                        <option value="wave">Wave</option>
                        <option value="moov">Moov Money</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de téléphone
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        id="accountNumber"
                        value={accountDetails.accountNumber}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="7X XXX XX XX"
                      />
                    </div>
                    <div>
                      <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du titulaire
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        id="accountName"
                        value={accountDetails.accountName}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Prénom et Nom"
                      />
                    </div>
                  </div>
                )}

                {/* Détails de paiement - Virement bancaire */}
                {paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la banque
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        id="bankName"
                        value={accountDetails.bankName}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de compte
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        id="accountNumber"
                        value={accountDetails.accountNumber}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du titulaire
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        id="accountName"
                        value={accountDetails.accountName}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code banque / BIC (optionnel)
                      </label>
                      <input
                        type="text"
                        name="bankCode"
                        id="bankCode"
                        value={accountDetails.bankCode}
                        onChange={handleAccountDetailsChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={!isFormValid() || !canWithdraw || isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'En cours...' : `Retirer ${withdrawalAmount ? formatCurrency(withdrawalAmount) : ''}`}
                  </button>
                  {!canWithdraw && (
                    <p className="mt-2 text-sm text-center text-red-600">
                      Vous devez compléter la vérification d'identité pour pouvoir retirer des fonds.
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* État de vérification */}
          {withdrawalStatus === 'verifying' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérification en cours</h2>
              <p className="text-gray-600">
                Nous vérifions votre demande de retrait de {formatCurrency(withdrawalAmount)}. Veuillez patienter...
              </p>
            </div>
          )}

          {/* État de succès */}
          {withdrawalStatus === 'success' && withdrawalResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">Retrait effectué avec succès</h2>
                <p className="mt-2 text-gray-600">
                  Votre demande de retrait de {formatCurrency(withdrawalAmount)} a été traitée avec succès.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Numéro de transaction</p>
                    <p className="font-medium">{withdrawalResult.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="font-medium">{formatCurrency(withdrawalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Méthode</p>
                    <p className="font-medium">
                      {paymentMethod === 'mobile_money' 
                        ? `Mobile Money (${accountDetails.mobileOperator.replace('_', ' ')})`
                        : 'Virement bancaire'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Délai estimé</p>
                    <p className="font-medium">{withdrawalResult.estimatedTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Effectuer un autre retrait
                </button>
              </div>
            </div>
          )}

          {/* État refusé */}
          {withdrawalStatus === 'denied' && withdrawalResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <FiXCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">Retrait refusé</h2>
                <p className="mt-2 text-gray-600">
                  Votre demande de retrait de {formatCurrency(withdrawalAmount)} n'a pas pu être traitée.
                </p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Raisons du refus :</h3>
                <ul className="list-disc pl-5 text-sm text-red-700">
                  {withdrawalResult.reasons?.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/settings/verification')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Compléter ma vérification
                </button>
              </div>
            </div>
          )}

          {/* Vérification supplémentaire */}
          {withdrawalStatus === 'additional_verification' && withdrawalResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                  <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">Vérification supplémentaire requise</h2>
                <p className="mt-2 text-gray-600">
                  Votre demande de retrait de {formatCurrency(withdrawalAmount)} nécessite une vérification supplémentaire.
                </p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Informations :</h3>
                <ul className="list-disc pl-5 text-sm text-yellow-700">
                  {withdrawalResult.reasons?.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                  <li>Un membre de notre équipe vous contactera dans les 24 heures pour vérifier votre identité.</li>
                  <li>Cette mesure de sécurité est nécessaire pour les transactions importantes.</li>
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/support')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Contacter le support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawPage;
