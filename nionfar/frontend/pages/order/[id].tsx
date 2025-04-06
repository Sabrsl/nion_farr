import React, { useEffect, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheck, FiChevronRight, FiDownload, FiAlertTriangle, FiClock, FiMessageCircle, FiCreditCard } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

interface OrderPageProps {
  orderId: string;
  status?: 'success' | 'pending' | 'error';
}

const OrderPage: NextPage<OrderPageProps> = ({ orderId, status }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effet pour afficher le message de timeout après 3 secondes
  useEffect(() => {
    if (isLoading || authLoading) {
      const timeoutId = setTimeout(() => {
        const timeoutMessage = document.getElementById('timeout-message');
        if (timeoutMessage) {
          timeoutMessage.classList.remove('hidden');
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, authLoading]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        
        // Mettre un timeout pour éviter le blocage indéfini
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout lors du chargement de la commande')), 5000)
        );
        
        // Simuler l'appel API avec un délai plus court
        const fetchPromise = new Promise(resolve => setTimeout(resolve, 800));
        
        // Utiliser Promise.race pour éviter le blocage
        await Promise.race([fetchPromise, timeoutPromise]);

        // Simuler une commande pour le développement
        const mockOrder: Order = {
          id: orderId,
          title: 'Commande de service',
          serviceId: 'service-123',
          serviceName: 'Création de logo professionnel',
          providerId: 'provider-123',
          providerName: 'Amadou Diop',
          clientId: user?.id || 'unknown',
          status: status === 'success' ? 'en_attente' : 'en_attente_paiement',
          price: 25000,
          orderDate: new Date().toISOString(),
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          isPaid: status === 'success',
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          client: {
            id: user?.id || 'unknown',
            name: user?.name || 'Client',
            avatar: user?.avatar
          },
          service: {
            id: 'service-123',
            title: 'Création de logo professionnel',
            price: 25000,
            deliveryTime: 3
          }
        };

        // Mettre à jour l'état directement sans requestAnimationFrame
        setOrder(mockOrder);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Erreur lors du chargement de la commande:', error);
        setError(error.message || 'Impossible de charger les détails de la commande');
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, status, user]);

  // État de chargement
  if (isLoading || authLoading) {
    return (
      <Layout title="Chargement de la commande | NionFar">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="flex flex-col justify-center items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-gray-600 text-center">
              {status === 'success' 
                ? "Nous préparons les détails de votre commande..." 
                : "Chargement de la commande en cours..."}
            </p>
            
            {/* Message de timeout après 3 secondes */}
            <div className="mt-4 text-amber-600 text-sm text-center hidden" id="timeout-message">
              <p>Le chargement prend plus de temps que prévu.</p>
              <p>Vous pouvez <button onClick={() => window.location.reload()} className="text-indigo-600 underline">rafraîchir la page</button> ou <Link href="/" className="text-indigo-600 underline">retourner à l'accueil</Link>.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher un message mais ne pas rediriger
  if (!isAuthenticated && !isLoading && !authLoading) {
    return (
      <Layout title="Connexion requise | NionFar">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-amber-800">Commande confirmée, connectez-vous pour continuer</h3>
                <div className="mt-2 text-amber-700">
                  <p>Votre commande a été enregistrée avec succès. Pour accéder à tous les détails et suivre l'avancement, veuillez vous connecter.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Commande #{orderId}</h2>
            <p className="text-gray-600 mb-6">Statut: {status === 'success' ? 'Confirmée' : 'En attente'}</p>
            
            <div className="space-y-4">
              <Link href={`/auth/login?redirect=${encodeURIComponent(router.asPath)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Se connecter pour voir les détails
              </Link>
              
              <Link href="/auth/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Créer un compte
              </Link>
              
              <div className="text-center mt-4">
                <Link href="/"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Affichage des erreurs
  if (error || !order) {
    return (
      <Layout title="Erreur | NionFar">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-amber-800">Commande introuvable</h3>
                <div className="mt-2 text-amber-700">
                  <p>{error || "Nous n'avons pas pu trouver les détails de cette commande."}</p>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Aller au tableau de bord
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Formater les dates de manière sécurisée
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Fonction pour afficher le status de commande de façon lisible
  const getStatusDisplay = (status: string): { text: string; color: string; bgColor: string; borderColor: string; icon: JSX.Element } => {
    switch(status) {
      case 'en_attente':
        return {
          text: 'En attente de traitement',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: <FiClock className="h-8 w-8 text-amber-500" />
        };
      case 'en_attente_acceptation':
        return {
          text: 'En attente d\'acceptation',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: <FiClock className="h-8 w-8 text-amber-500" />
        };
      case 'en_attente_paiement':
        return {
          text: 'En attente de paiement',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-red-500" />
        };
      case 'en_cours':
      case 'in_progress':
        return {
          text: 'En cours de réalisation',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <FiClock className="h-8 w-8 text-blue-500" />
        };
      case 'livré':
      case 'delivered':
        return {
          text: 'Livré - En attente de validation',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: <FiDownload className="h-8 w-8 text-purple-500" />
        };
      case 'révision_demandée':
      case 'revision':
        return {
          text: 'Révision demandée',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-orange-500" />
        };
      case 'en_modification':
        return {
          text: 'En cours de modification',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          icon: <FiClock className="h-8 w-8 text-indigo-500" />
        };
      case 'terminé':
      case 'terminée':
      case 'completed':
        return {
          text: 'Commande terminée',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <FiCheck className="h-8 w-8 text-green-500" />
        };
      case 'annulé':
      case 'annulée':
      case 'cancelled':
        return {
          text: 'Commande annulée',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-red-500" />
        };
      case 'litige':
      case 'disputed':
        return {
          text: 'Litige en cours',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-red-500" />
        };
      case 'livraison_en_retard':
        return {
          text: 'Livraison en retard',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-orange-500" />
        };
      default:
        return {
          text: 'Statut inconnu',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <FiAlertTriangle className="h-8 w-8 text-gray-500" />
        };
    }
  };

  // Déterminer le statut à afficher (priorité au statut de la commande)
  const orderStatus = order.status;
  const statusDisplay = getStatusDisplay(orderStatus);

  return (
    <Layout title={`${statusDisplay.text} | NionFar`}>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Bannière de confirmation de commande pour le statut 'success' */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-start">
            <div className="flex-shrink-0">
              <FiCheck className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-green-800">Commande effectuée avec succès!</h2>
              <p className="mt-1 text-green-700">
                Votre commande #{order.id} a été enregistrée et confirmée. Le prestataire va bientôt commencer à travailler sur votre projet.
              </p>
              {!isAuthenticated && (
                <div className="mt-3">
                  <Link href={`/auth/login?redirect=/dashboard/orders`}
                    className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Se connecter pour suivre la commande
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className={`rounded-lg p-6 mb-8 ${statusDisplay.bgColor} ${statusDisplay.borderColor} border`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">{statusDisplay.icon}</div>
            <div className="ml-3">
              <h1 className={`text-lg font-medium ${statusDisplay.color}`}>{statusDisplay.text}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {status === 'success'
                  ? `Merci pour votre confiance! Votre paiement a été confirmé.`
                  : status === 'error'
                  ? 'Une erreur est survenue lors du traitement de votre commande.'
                  : 'Votre commande est en attente de confirmation.'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Détails de la commande</h2>
            <p className="mt-1 text-sm text-gray-500">
              Commande <span className="font-semibold text-indigo-600">#{order.id}</span> • Créée le {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service commandé</h3>
                <p className="mt-1 text-sm font-medium text-gray-900">{order.serviceName}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Prestataire : <span className="font-medium">{order.providerName}</span>
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Informations de livraison</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Délai de livraison estimé : <span className="font-medium">
                    {formatDate(order.deadline)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Statut actuel : <span className={`font-medium ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Résumé de paiement */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Récapitulatif du paiement</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Prix du service</p>
                    <p className="font-medium">{order.price.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frais de service (5%)</p>
                    <p className="font-medium">{Math.round(order.price * 0.05).toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Méthode de paiement</p>
                    <p className="font-medium">{status === 'success' ? 'Wave' : 'En attente de paiement'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut du paiement</p>
                    <p className="font-medium flex items-center">
                      {order.isPaid ? 
                        <><FiCheck className="h-4 w-4 text-green-500 mr-1" /> Payé</> : 
                        <><FiAlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> En attente</>
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-gray-900 font-semibold">Montant total</div>
                  <div className="text-xl font-bold text-indigo-600">
                    {(order.price * 1.05).toLocaleString()} FCFA
                  </div>
                </div>
              </div>
              {status === 'success' && (
                <div className="text-gray-700">
                  <p className="text-sm">Transaction ID</p>
                  <p className="font-medium mt-1">TRX-123456789</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Prochaines étapes</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {status === 'success' && (
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-700">
                  <span className="font-medium">Merci pour votre commande!</span> Nous avons envoyé une confirmation par email à l'adresse associée à votre compte. 
                  Vous pouvez suivre l'avancement de votre commande depuis votre tableau de bord.
                </p>
              </div>
            )}
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className={`flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full ${order.status !== 'en_attente' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {order.status !== 'en_attente' ? <FiCheck className="h-4 w-4" /> : <span className="text-sm font-medium">1</span>}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Le prestataire va examiner votre commande</p>
                  <p className="text-sm text-gray-500">
                    {order.providerName} va bientôt prendre connaissance de votre commande et commencer le travail.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <span className="text-sm font-medium">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Suivi de l'avancement</p>
                  <p className="text-sm text-gray-500">
                    Vous serez informé de l'avancement de votre commande et pourrez communiquer directement avec le prestataire.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Livraison et validation</p>
                  <p className="text-sm text-gray-500">
                    Une fois le travail terminé, le prestataire vous livrera le service pour validation. Vous pourrez demander des révisions si nécessaire.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/orders"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voir mes commandes
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/explorer"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Explorer d'autres services
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link href={`/auth/login?redirect=/dashboard/orders`}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Se connecter pour suivre mes commandes
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour à l'accueil
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, status } = context.query;
  
  if (!id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      orderId: id as string,
      status: status as string || "pending",
    },
  };
};

export default OrderPage; 