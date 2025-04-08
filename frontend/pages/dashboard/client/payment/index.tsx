import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiArrowLeft, 
  FiCreditCard, 
  FiShieldOff, 
  FiSmartphone,
  FiCheck,
  FiInfo
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import ClientDashboardLayout from '../../../../components/dashboard/ClientDashboardLayout';

interface PaymentInfo {
  phoneNumber: string;
  method: 'wave' | 'orange_money' | 'free_money';
}

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    phoneNumber: '',
    method: 'wave'
  });
  
  // Données ficives de la commande (dans un cas réel, viendrait de l'API ou des paramètres URL)
  const orderDetails = {
    serviceTitle: 'Conception de logo professionnel',
    sellerName: 'Amadou Diop',
    basePrice: 25000,
    deliveryTime: 3,
    serviceFee: 1250, // 5% du prix de base
    totalPrice: 26250 // Prix de base + frais de service
  };

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };

  // Mise à jour des informations de paiement
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Accepter uniquement les chiffres
      const phoneValue = value.replace(/\D/g, '');
      setPaymentInfo((prev) => ({ ...prev, [name]: phoneValue }));
    } else {
      setPaymentInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gestion du choix de la méthode de paiement
  const handleMethodChange = (method: PaymentInfo['method']) => {
    setPaymentInfo((prev) => ({ ...prev, method }));
  };

  // Vérifier si les champs sont valides
  const isPhoneNumberValid = () => {
    return paymentInfo.phoneNumber.length === 9 || paymentInfo.phoneNumber.length === 10;
  };

  // Soumettre le paiement
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPhoneNumberValid()) {
      alert('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    
    setIsLoading(true);
    
    // Simulation d'un appel API pour traiter le paiement
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Si le paiement est réussi, rediriger vers la page de confirmation
      router.push('/dashboard/client/payment/success');
    } catch (error) {
      console.error('Erreur lors du paiement', error);
      setIsLoading(false);
    }
  };

  return (
    <ClientDashboardLayout title="Paiement | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1200px] mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <Link 
            href="/dashboard/client"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Paiement de votre commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Choisissez votre méthode de paiement</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => handleMethodChange('wave')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentInfo.method === 'wave' 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="w-16 h-16 mb-3 relative">
                    <Image 
                      src="/images/wave-logo.png" 
                      alt="Wave" 
                      width={64} 
                      height={64}
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Wave</span>
                  {paymentInfo.method === 'wave' && (
                    <div className="absolute top-2 right-2 text-indigo-600">
                      <FiCheck className="h-5 w-5" />
                    </div>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMethodChange('orange_money')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentInfo.method === 'orange_money' 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="w-16 h-16 mb-3 relative">
                    <Image 
                      src="/images/orange-money-logo.png" 
                      alt="Orange Money" 
                      width={64} 
                      height={64}
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Orange Money</span>
                  {paymentInfo.method === 'orange_money' && (
                    <div className="absolute top-2 right-2 text-indigo-600">
                      <FiCheck className="h-5 w-5" />
                    </div>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMethodChange('free_money')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentInfo.method === 'free_money' 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="w-16 h-16 mb-3 relative">
                    <Image 
                      src="/images/free-money-logo.png" 
                      alt="Free Money" 
                      width={64} 
                      height={64}
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Free Money</span>
                  {paymentInfo.method === 'free_money' && (
                    <div className="absolute top-2 right-2 text-indigo-600">
                      <FiCheck className="h-5 w-5" />
                    </div>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmitPayment}>
                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSmartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={paymentInfo.phoneNumber}
                      onChange={handlePaymentInfoChange}
                      placeholder="77 123 45 67"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        !isPhoneNumberValid() && paymentInfo.phoneNumber.length > 0 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    />
                  </div>
                  {!isPhoneNumberValid() && paymentInfo.phoneNumber.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      Veuillez entrer un numéro de téléphone valide (9 ou 10 chiffres)
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Entrez le numéro de téléphone associé à votre compte mobile money.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Comment ça marche</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>1. Après avoir cliqué sur "Payer maintenant", vous recevrez un SMS avec un code de validation.</p>
                        <p>2. Confirmez la transaction en validant le montant et le code.</p>
                        <p>3. Votre commande sera validée automatiquement dès réception du paiement.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || !isPhoneNumberValid()}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <FiCreditCard className="mr-2 -ml-1 h-5 w-5" />
                        Payer maintenant ({formatCurrency(orderDetails.totalPrice)})
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FiShieldOff className="text-green-600 h-5 w-5 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Paiement sécurisé</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Votre paiement est sécurisé et le montant est conservé par NionFar jusqu'à ce que vous acceptiez la livraison. 
                Cela vous protège et garantit que vous recevez ce que vous avez commandé.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="h-8 opacity-70">
                  <Image 
                    src="/images/wave-logo.png" 
                    alt="Wave" 
                    width={80} 
                    height={32}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
                <div className="h-8 opacity-70">
                  <Image 
                    src="/images/orange-money-logo.png" 
                    alt="Orange Money" 
                    width={80} 
                    height={32}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
                <div className="h-8 opacity-70">
                  <Image 
                    src="/images/free-money-logo.png" 
                    alt="Free Money" 
                    width={80} 
                    height={32}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
                <div className="h-8 opacity-70">
                  <Image 
                    src="/images/dxpay-logo.png" 
                    alt="DxPay" 
                    width={80} 
                    height={32}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de la commande</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-md font-medium text-gray-900 mb-2">{orderDetails.serviceTitle}</h3>
                <p className="text-sm text-gray-600 mb-2">Vendeur: {orderDetails.sellerName}</p>
                <p className="text-sm text-gray-600">Délai de livraison: {orderDetails.deliveryTime} jour{orderDetails.deliveryTime > 1 ? 's' : ''}</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prix du service</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frais de service (5%)</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.serviceFee)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-base font-semibold text-gray-900">{formatCurrency(orderDetails.totalPrice)}</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-500">
                  En procédant au paiement, vous acceptez les Conditions Générales d'Utilisation de NionFar.sn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default CheckoutPage; 