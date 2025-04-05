import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../../../components/layout/Layout';
import { serviceExplorerService } from '../../../services/serviceExplorerService';
import { ServicePackages } from '../../../components/services/ServicePackages';
import { Button } from '../../../components/ui/Button';
import { FiArrowLeft, FiShoppingCart, FiClock, FiCalendar, FiShield, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import orderService from '../../../services/orderService';
import { Service } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

// Image par défaut
const DEFAULT_IMAGE = '/images/placeholder-service.jpg';

const OrderPage: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({
    additionalRequirements: '',
  });
  const [canOrder, setCanOrder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Calcul de la date de livraison estimée
  const estimatedDeliveryDate = useMemo(() => {
    if (!service?.deliveryTime) return null;
    const date = new Date();
    date.setDate(date.getDate() + service.deliveryTime);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [service?.deliveryTime]);

  // Récupération des détails du service
  useEffect(() => {
    if (!slug) return;

    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        // Utiliser le serviceExplorerService pour récupérer les détails du service
        const serviceData = await serviceExplorerService.getServiceBySlug(slug as string);
        
        if (!serviceData || !serviceData.isActive) {
          // Rediriger si le service n'existe pas ou n'est pas actif
          router.push('/services/service-unavailable');
          return;
        }
        
        setService(serviceData);
        setTotalPrice(serviceData.price);
        
        // Vérifier si l'utilisateur peut commander ce service
        if (isAuthenticated && user) {
          const canUserOrder = await orderService.checkOrderEligibility(serviceData.id, user.id);
          setCanOrder(canUserOrder);
          
          if (!canUserOrder) {
            setError("Vous ne pouvez pas commander votre propre service.");
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError("Impossible de récupérer les détails du service.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [slug, user, isAuthenticated, router]);

  // Gestion des changements des exigences additionnelles
  const handleAdditionalRequirementsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrderDetails(prev => ({
      ...prev,
      additionalRequirements: e.target.value,
    }));
  }, []);

  // Gestion des options sélectionnées
  const handleOptionSelect = useCallback((options: string[], totalAdditional: number) => {
    setSelectedOptions(options);
    if (service) {
      setTotalPrice(service.price + totalAdditional);
    }
  }, [service]);

  // Soumission de la commande
  const handleSubmitOrder = useCallback(async () => {
    if (!service || !isAuthenticated) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Créer la commande
      const orderData = {
        serviceId: service.id,
        clientId: user?.id,
        freelancerId: service.provider?.id,
        requirements: orderDetails.additionalRequirements,
        options: selectedOptions,
        totalPrice: totalPrice,
      };
      
      const result = await orderService.createOrder(orderData);
      
      if (result.success) {
        // Rediriger vers la page de confirmation
        router.push(`/orders/${result.orderId}/confirmation`);
      } else {
        setError(result.message || "Une erreur est survenue lors de la création de la commande.");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError("Une erreur est survenue lors de la création de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  }, [service, isAuthenticated, user, orderDetails, selectedOptions, totalPrice, router]);

  // Rendu pendant le chargement
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Rendu si le service n'est pas trouvé
  if (!service) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service non disponible</h1>
            <p className="text-gray-600 mb-8">Le service que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <Link 
              href="/explorer" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Explorer les services
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{`Commander: ${service.title || ''} | NionFar`}</title>
        <meta name="description" content={`Commander le service ${service.title} sur Nionfar.`} />
      </Head>
      
      <div className="bg-gray-50 py-6">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Navigation de retour */}
          <div className="flex items-center mb-6">
            <Link href={`/services/${slug}`} className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
              <FiArrowLeft className="mr-2" aria-hidden="true" />
              Retour au service
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de commande */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">Commander ce service</h1>
                </div>
                
                <div className="p-6">
                  {/* Résumé du service */}
                  <ServiceSummary service={service} />
                  
                  {/* Options supplémentaires */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnaliser votre commande</h3>
                    <ServicePackages
                      serviceId={service.id}
                      onOptionsChange={handleOptionSelect}
                    />
                  </div>
                  
                  {/* Exigences supplémentaires */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Exigences supplémentaires</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Décrivez en détail ce dont vous avez besoin pour que le prestataire puisse vous offrir le meilleur service possible.
                    </p>
                    <textarea
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Détaillez vos exigences, préférences et toute information utile pour le prestataire..."
                      value={orderDetails.additionalRequirements}
                      onChange={handleAdditionalRequirementsChange}
                      aria-label="Exigences supplémentaires"
                    ></textarea>
                  </div>
                  
                  {/* Avertissement pour connexion requise */}
                  <AnimatePresence>
                    {!isAuthenticated && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiShield className="h-5 w-5 text-amber-500" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Connexion requise</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <p>Vous devez vous connecter ou créer un compte pour commander ce service.</p>
                            </div>
                            <div className="mt-3">
                              <Link
                                href={`/login?redirect=/services/${slug}/order`}
                                className="text-sm font-medium text-amber-800 hover:text-amber-600 transition-colors"
                              >
                                Se connecter <span aria-hidden="true">&rarr;</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Message d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Récapitulatif de commande */}
            <div className="lg:col-span-1">
              <OrderSummary 
                service={service}
                totalPrice={totalPrice}
                selectedOptionsPrice={totalPrice - service.price}
                hasSelectedOptions={selectedOptions.length > 0}
                estimatedDeliveryDate={estimatedDeliveryDate}
                isAuthenticated={isAuthenticated}
                canOrder={canOrder}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitOrder}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Composant pour afficher le résumé du service
const ServiceSummary: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className="flex items-start mb-6 pb-6 border-b border-gray-200">
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg mr-4">
        <Image
          src={service.image || DEFAULT_IMAGE}
          alt={service.title}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h2>
        {service.category && typeof service.category === 'object' && 'name' in service.category && (
          <div className="text-sm text-gray-500 mb-2">
            {service.category.name}
          </div>
        )}
        <div className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Prix de base:</span> {service.price.toLocaleString()} FCFA
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Délai de livraison:</span> {service.deliveryTime} jours
        </div>
      </div>
    </div>
  );
};

// Composant pour le récapitulatif de la commande
interface OrderSummaryProps {
  service: Service;
  totalPrice: number;
  selectedOptionsPrice: number;
  hasSelectedOptions: boolean;
  estimatedDeliveryDate: string | null;
  isAuthenticated: boolean;
  canOrder: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  service,
  totalPrice,
  selectedOptionsPrice,
  hasSelectedOptions,
  estimatedDeliveryDate,
  isAuthenticated,
  canOrder,
  isSubmitting,
  onSubmit
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Récapitulatif</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Prix du service</span>
            <span className="font-medium">{service.price.toLocaleString()} FCFA</span>
          </div>
          
          {hasSelectedOptions && (
            <div className="flex justify-between">
              <span className="text-gray-600">Options supplémentaires</span>
              <span className="font-medium">{selectedOptionsPrice.toLocaleString()} FCFA</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-indigo-600">{totalPrice.toLocaleString()} FCFA</span>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            variant="primary"
            fullWidth
            startIcon={<FiShoppingCart aria-hidden="true" />}
            onClick={onSubmit}
            disabled={!isAuthenticated || !canOrder || isSubmitting}
            loading={isSubmitting}
            className="transition-all"
          >
            {isAuthenticated ? 'Commander maintenant' : 'Se connecter pour commander'}
          </Button>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-start text-xs text-gray-500">
            <FiClock className="h-4 w-4 text-gray-400 mr-2 mt-0.5" aria-hidden="true" />
            <span>Délai de livraison estimé: <strong>{service.deliveryTime ?? 0} jours</strong></span>
          </div>
          {estimatedDeliveryDate && (
            <div className="flex items-start text-xs text-gray-500">
              <FiCalendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5" aria-hidden="true" />
              <span>Date de livraison estimée: <strong>{estimatedDeliveryDate}</strong></span>
            </div>
          )}
          <div className="flex items-start text-xs text-gray-500">
            <FiShield className="h-4 w-4 text-gray-400 mr-2 mt-0.5" aria-hidden="true" />
            <span>Paiement sécurisé et garanti de satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;