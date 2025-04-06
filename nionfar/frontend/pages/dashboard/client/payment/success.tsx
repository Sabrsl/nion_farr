import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiCheck, 
  FiArrowLeft, 
  FiDownload,
  FiMessageCircle 
} from 'react-icons/fi';
import Link from 'next/link';
import ClientDashboardLayout from '../../../../components/dashboard/ClientDashboardLayout';

const PaymentSuccessPage: NextPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  // Données fictives de la commande (dans un cas réel, viendrait de l'API ou d'un state global)
  const orderDetails = {
    id: 'CMD-2023-05-18-001',
    serviceTitle: 'Conception de logo professionnel',
    sellerName: 'Amadou Diop',
    totalPrice: 26250,
    estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours à partir d'aujourd'hui
  };

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };
  
  // Formater la date en format local
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Redirection automatique après 5 secondes
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(`/dashboard/client/orders/${orderDetails.id}`);
    }
  }, [countdown, router, orderDetails.id]);

  return (
    <ClientDashboardLayout title="Paiement réussi | NionFar.sn">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
              <FiCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600">
              Votre commande <span className="font-medium">{orderDetails.id}</span> a été confirmée et le vendeur a été notifié.
            </p>
          </div>

          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la commande</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service</span>
                <span className="text-sm font-medium text-gray-900">{orderDetails.serviceTitle}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vendeur</span>
                <span className="text-sm font-medium text-gray-900">{orderDetails.sellerName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Montant payé</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.totalPrice)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Livraison estimée</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(orderDetails.estimatedDeliveryDate)}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prochaines étapes</h2>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Le vendeur va commencer à travailler sur votre commande</p>
                  <p className="text-sm text-gray-600">Vous recevrez une notification lorsque le vendeur commencera à travailler sur votre commande.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vous pouvez communiquer avec le vendeur</p>
                  <p className="text-sm text-gray-600">Utilisez notre système de messagerie pour discuter des détails ou pour demander des mises à jour.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Validez la livraison une fois satisfait</p>
                  <p className="text-sm text-gray-600">Lorsque le vendeur livre la commande, vous aurez 3 jours pour valider ou demander des modifications.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Link
              href={`/dashboard/client/orders/${orderDetails.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiCheck className="mr-2 -ml-1 h-4 w-4" />
              Voir les détails de la commande
            </Link>
            
            <Link
              href={`/dashboard/client/messages/order/${orderDetails.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiMessageCircle className="mr-2 -ml-1 h-4 w-4" />
              Contacter le vendeur
            </Link>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <FiDownload className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Vous serez redirigé vers la page de détails de la commande dans {countdown} seconde{countdown !== 1 ? 's' : ''}...
                </p>
                <p className="text-xs text-gray-500">
                  Une confirmation de commande a également été envoyée à votre adresse e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default PaymentSuccessPage; 