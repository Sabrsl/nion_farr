import React, { useEffect, useState, useCallback } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiCreditCard,
  FiCheck,
  FiAlertTriangle,
  FiClock,
  FiArrowLeft,
  FiInfo
} from 'react-icons/fi';

// Components & Layout
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';

// Services
import { serviceExplorer } from '../../services/serviceExplorerService';
import { useAuth } from '../../contexts/AuthContext';

// Types
import { Service, User } from '../../types';

// Type personnalisé pour étendre User avec phone
interface ExtendedUser extends User {
  phone?: string;
}

// Constants
const PAYMENT_METHODS = [
  { id: 'wave', name: 'Wave', color: 'bg-blue-500', logo: 'Wave' },
  { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', logo: 'OM' },
  { id: 'card', name: 'Carte bancaire', color: 'bg-gray-700', logo: <FiCreditCard className="h-6 w-6 text-white" /> }
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['id'];

interface CheckoutPageProps {
  service: Service | null;
}

const CheckoutPage: NextPage<CheckoutPageProps> = ({ service }) => {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as ExtendedUser | null;
  
  // États du checkout
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canOrder, setCanOrder] = useState(false);
  const [cannotOrderReason, setCannotOrderReason] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Initialiser le numéro de téléphone à partir du profil utilisateur
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  // Vérifier si l'utilisateur peut commander le service
  useEffect(() => {
    if (!service || authLoading) return;
    
    const checkOrderPermission = async () => {
      if (!service) {
        setCanOrder(false);
        setCannotOrderReason("Service non disponible");
        return;
      }

      // Si l'utilisateur n'est pas connecté
      if (!isAuthenticated || !user) {
        setCanOrder(false);
        setCannotOrderReason('Connectez-vous pour commander ce service');
        
        // Rediriger vers la page de connexion seulement si l'utilisateur n'est pas en cours de chargement
        if (!authLoading) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Redirection vers login, utilisateur non authentifié');
          }
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          router.push(loginUrl);
        }
        
        setIsLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est le créateur du service
      if (service.provider?.id === user.id) {
        setCanOrder(false);
        setCannotOrderReason('Vous ne pouvez pas commander votre propre service');
        
        // Rediriger après 2 secondes
        setTimeout(() => {
          router.push('/explorer');
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      // Vérification via le service dédié
      try {
        const result = await serviceExplorer.canOrderService(service.id, user.id);
        setCanOrder(result.canOrder);
        setCannotOrderReason(result.canOrder ? null : (result.message ?? null));
      } catch (error) {
        console.error('Erreur lors de la vérification de commande:', error);
        setCanOrder(false);
        setCannotOrderReason('Une erreur est survenue lors de la vérification');
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    checkOrderPermission();
  }, [service, user, isAuthenticated, authLoading, router]);

  // Handler pour le changement de méthode de paiement
  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
  }, []);

  // Validation du numéro de téléphone
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    // Format sénégalais: +221 77/78/76/70 XXX XX XX ou numéros à 9 chiffres
    const phoneRegex = /^(\+221|00221)?[76]{1}[0-9]{8}$/;
    
    if (!phone) {
      setPhoneError('Le numéro de téléphone est requis');
      return false;
    }
    
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    
    setPhoneError('');
    return true;
  }, []);

  // Handler pour la soumission du paiement
  const handlePaymentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing || !canOrder) return;
    
    // Valider le numéro de téléphone
    const isPhoneValid = validatePhoneNumber(phoneNumber);
    if (!isPhoneValid) return;
    
    setIsProcessing(true);
    
    try {
      // Appel à l'API pour traiter le paiement
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service?.id,
          userId: user?.id,
          paymentMethod,
          phoneNumber,
          specialRequirements,
          price: service?.price,
          serviceName: service?.title,
          providerId: service?.provider?.id,
          providerName: service?.provider?.name || 'Prestataire',
          deliveryTime: service?.deliveryTime || 3
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du traitement du paiement');
      }
      
      const data = await response.json();
      
      // Rediriger vers la page de succès avec l'ID de commande retourné par l'API
      window.location.href = `/order/${data.orderId}?status=success`;
      
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      setIsProcessing(false);
      alert("Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.");
    }
  }, [isProcessing, canOrder, validatePhoneNumber, phoneNumber, service, paymentMethod, specialRequirements, user]);

  // Rendu pour le cas où le service n'existe pas
  if (!service) {
    return (
      <Layout title="Service introuvable | Nionfar">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-amber-800">Service introuvable</h3>
                <div className="mt-2 text-amber-700">
                  <p>Le service que vous essayez de commander n'existe pas ou n'est plus disponible.</p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/explorer')}
                    className="text-amber-800 border-amber-400 hover:bg-amber-100"
                  >
                    Retour à l'explorateur
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Commander ${service.title} | Nionfar`}
      description={`Finaliser votre commande pour ${service.title}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec retour */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Retour au service"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
            <span>Retour au service</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Finalisation de la commande</h1>
        </div>
        
        {/* Message d'erreur si l'utilisateur ne peut pas commander */}
        <AnimatePresence>
          {!isLoading && !canOrder && cannotOrderReason && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md mb-8"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Commande impossible</h3>
                  <div className="mt-2 text-red-700">
                    <p>{cannotOrderReason}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* State de chargement */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Contenu principal en deux colonnes */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne de gauche : Détails de la commande */}
            <div className="md:col-span-2 space-y-8">
              {/* Service commandé */}
              <ServiceDetailsCard service={service} />
              
              {/* Formulaire de paiement */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h2>
                  
                  <form onSubmit={handlePaymentSubmit} noValidate>
                    {/* Méthodes de paiement */}
                    <div className="mb-6">
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 mb-2">
                          Choisissez un mode de paiement
                        </legend>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {PAYMENT_METHODS.map((method) => (
                            <PaymentMethodOption
                              key={method.id}
                              method={method}
                              selectedMethod={paymentMethod}
                              onSelect={handlePaymentMethodChange}
                            />
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    
                    {/* Numéro de téléphone */}
                    <div className="mb-6">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone {paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange' ? 'Orange Money' : 'de contact'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (phoneError) validatePhoneNumber(e.target.value);
                        }}
                        className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 ${
                          phoneError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+221 77 123 45 67"
                        required
                        aria-invalid={!!phoneError}
                        aria-describedby={phoneError ? "phone-error" : undefined}
                      />
                      {phoneError && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    
                    {/* Instructions spéciales */}
                    <div className="mb-6">
                      <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions spéciales (optionnel)
                      </label>
                      <textarea
                        id="requirements"
                        value={specialRequirements}
                        onChange={(e) => setSpecialRequirements(e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5"
                        placeholder="Détails spécifiques pour votre commande..."
                      />
                    </div>
                    
                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={isLoading || isProcessing || !canOrder}
                        aria-busy={isProcessing}
                        className={`
                          w-full flex items-center justify-center px-6 py-3 rounded-md text-white font-medium
                          ${isProcessing ? 'bg-gray-400 cursor-wait' : canOrder ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}
                          transition-colors shadow-sm
                        `}
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <FiShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />
                            Payer et commander
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite : Résumé de la commande */}
            <div className="md:col-span-1">
              <OrderSummary service={service} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Composant pour les détails du service
const ServiceDetailsCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du service</h2>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative">
            <Image
              src={service.image || '/images/placeholder-service.jpg'}
              alt={service.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="font-medium text-gray-900">{service.title}</h3>
            
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <FiClock className="mr-1 h-4 w-4" aria-hidden="true" />
              <span>Livraison en {service.deliveryTime} jours</span>
            </div>
            
            {service.provider && (
              <div className="mt-3 flex items-center">
                <Avatar
                  src={service.provider.avatar}
                  alt={service.provider.name || "Vendeur"}
                  size="sm"
                />
                <span className="ml-2 text-sm text-gray-600">{service.provider.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les options de paiement
interface PaymentMethodOptionProps {
  method: typeof PAYMENT_METHODS[number];
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({ 
  method, 
  selectedMethod, 
  onSelect 
}) => {
  const isSelected = selectedMethod === method.id;
  
  return (
    <div 
      className={`
        border rounded-lg p-4 flex flex-col items-center cursor-pointer
        ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}
        transition-colors
      `}
      onClick={() => onSelect(method.id as PaymentMethod)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(method.id as PaymentMethod);
          e.preventDefault();
        }
      }}
    >
      <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mb-2`}>
        {typeof method.logo === 'string' ? (
          <span className="text-white font-bold">{method.logo}</span>
        ) : (
          method.logo
        )}
      </div>
      <span className="text-sm font-medium">{method.name}</span>
    </div>
  );
};

// Composant pour le résumé de la commande
const OrderSummary: React.FC<{ service: Service }> = ({ service }) => {
  // Calcul du prix total et des frais
  const calculServiceFee = (price: number) => {
    // Pour l'exemple, pas de frais
    return 0;
  };
  
  const serviceFee = calculServiceFee(service.price);
  const totalPrice = service.price + serviceFee;
  
  return (
    <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden sticky top-24">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Prix du service</span>
            <span className="font-medium">{service.price.toLocaleString()} FCFA</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Frais de service</span>
            <span className="font-medium">{serviceFee.toLocaleString()} FCFA</span>
          </div>
          
          <div className="border-t border-gray-200 pt-4 flex justify-between">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-indigo-600 font-bold">{totalPrice.toLocaleString()} FCFA</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-xs text-gray-500">
            <FiClock className="mr-1 h-4 w-4 text-gray-400" aria-hidden="true" />
            <span>Livraison estimée: {service.deliveryTime} jours</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <FiCheck className="mr-1 h-4 w-4 text-gray-400" aria-hidden="true" />
            <span>Paiement sécurisé</span>
          </div>
          
          <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="ml-2 text-xs text-indigo-700">
                <p>Votre paiement ne sera débité qu'une fois la commande acceptée par le prestataire.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Récupération des données côté serveur
export const getServerSideProps: GetServerSideProps<CheckoutPageProps> = async (context) => {
  const { serviceId } = context.params || {};
  
  // Récupérer les données depuis l'API
  let service: Service | null = null;
  
  if (typeof serviceId === 'string') {
    // Rechercher par ID
    service = await serviceExplorer.getServiceById(serviceId);
  }
  
  return {
    props: {
      service
    }
  };
};

export default CheckoutPage;