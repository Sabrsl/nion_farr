import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiAlertTriangle, FiClock, FiDownload, FiMessageSquare, FiArrowRight } from 'react-icons/fi';

// Components & Layout
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';

// Types
type OrderStatus = 'success' | 'pending' | 'failed';

interface OrderPageProps {
  orderId: string;
  status: OrderStatus;
}

// Configuration pour les différents statuts
const STATUS_CONFIG = {
  success: {
    title: 'Commande confirmée !',
    message: 'Votre commande a bien été enregistrée. Le prestataire sera notifié et prendra contact avec vous prochainement.',
    icon: <FiCheck className="h-12 w-12 text-green-500" aria-hidden="true" />,
    bgColor: 'bg-green-50',
    iconBgColor: 'bg-green-100',
    textColor: 'text-green-800',
    textColorMessage: 'text-green-700',
    borderColor: 'border-green-200'
  },
  pending: {
    title: 'Commande en attente',
    message: 'Votre commande est en attente de confirmation. Nous vous tiendrons informé de son évolution.',
    icon: <FiClock className="h-12 w-12 text-yellow-500" aria-hidden="true" />,
    bgColor: 'bg-yellow-50',
    iconBgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    textColorMessage: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  failed: {
    title: 'Échec de la commande',
    message: 'Un problème est survenu lors du traitement de votre commande. Veuillez réessayer ou contacter notre support.',
    icon: <FiAlertTriangle className="h-12 w-12 text-red-500" aria-hidden="true" />,
    bgColor: 'bg-red-50',
    iconBgColor: 'bg-red-100',
    textColor: 'text-red-800',
    textColorMessage: 'text-red-700',
    borderColor: 'border-red-200'
  }
};

const OrderPage: NextPage<OrderPageProps> = ({ orderId, status }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  
  // Config pour le statut actuel
  const config = STATUS_CONFIG[status];
  
  // Gérer la redirection automatique vers le tableau de bord
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard/orders');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [status, router]);
  
  // Handlers pour les différentes actions
  const handleViewOrder = useCallback(() => {
    router.push('/dashboard/orders');
  }, [router]);
  
  const handleExploreServices = useCallback(() => {
    router.push('/explorer');
  }, [router]);
  
  const handleGoToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);
  
  const handleRetry = useCallback(() => {
    router.back();
  }, [router]);
  
  const handleContactSupport = useCallback(() => {
    router.push('/contact');
  }, [router]);
  
  // Animations pour les éléments
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Layout
      title={`${config.title} | Nionfar`}
      description="État de votre commande sur Nionfar"
    >
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div 
          className={`${config.bgColor} rounded-lg shadow-sm p-8`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center text-center">
            <motion.div 
              className={`p-4 ${config.iconBgColor} rounded-full mb-6`}
              variants={itemVariants}
            >
              {config.icon}
            </motion.div>
            
            <motion.h1 
              className={`text-2xl font-bold ${config.textColor} mb-4`}
              variants={itemVariants}
            >
              {config.title}
            </motion.h1>
            
            <motion.p 
              className={`${config.textColorMessage} mb-6 max-w-md`}
              variants={itemVariants}
            >
              {config.message}
            </motion.p>
            
            {/* Numéro de commande */}
            <motion.div 
              className="flex items-center justify-center w-full bg-white rounded-md py-3 px-4 mb-8 border border-gray-200"
              variants={itemVariants}
            >
              <span className="text-gray-500 mr-2">Commande n°:</span>
              <span className="font-medium text-gray-900">{orderId}</span>
            </motion.div>
            
            {/* Actions selon le status */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md"
              variants={itemVariants}
            >
              {status === 'success' && (
                <>
                  <Button 
                    variant="primary"
                    onClick={handleViewOrder}
                    className="w-full"
                    aria-label="Voir ma commande"
                  >
                    Voir ma commande
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleExploreServices}
                    className="w-full"
                    aria-label="Explorer les services"
                  >
                    Explorer les services
                  </Button>
                </>
              )}
              
              {status === 'pending' && (
                <>
                  <Button 
                    variant="primary"
                    onClick={handleViewOrder}
                    className="w-full"
                    aria-label="Vérifier le statut de la commande"
                  >
                    Vérifier le statut
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleGoToDashboard}
                    className="w-full"
                    aria-label="Aller au tableau de bord"
                  >
                    Tableau de bord
                  </Button>
                </>
              )}
              
              {status === 'failed' && (
                <>
                  <Button 
                    variant="primary"
                    onClick={handleRetry}
                    className="w-full"
                    aria-label="Réessayer la commande"
                  >
                    Réessayer
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleContactSupport}
                    className="w-full flex items-center justify-center"
                    aria-label="Contacter le support"
                  >
                    <FiMessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                    Contacter le support
                  </Button>
                </>
              )}
            </motion.div>
            
            {/* Compte à rebours pour redirection */}
            <AnimatePresence>
              {status === 'success' && countdown > 0 && (
                <motion.p 
                  className="text-sm text-gray-500 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="countdown"
                >
                  Redirection vers vos commandes dans <span className="font-medium">{countdown}</span> secondes
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Instructions pour les prochaines étapes - uniquement en cas de succès */}
            {status === 'success' && (
              <NextStepsGuide />
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

// Composant pour les étapes suivantes
const NextStepsGuide: React.FC = () => {
  const steps = [
    {
      id: 1,
      text: "Le prestataire sera informé de votre commande et la traitera dans les plus brefs délais."
    },
    {
      id: 2,
      text: "Vous pourrez échanger directement avec le prestataire via la messagerie pour préciser vos besoins."
    },
    {
      id: 3,
      text: "Une fois le service livré, vous pourrez valider la livraison et laisser un avis sur votre expérience."
    }
  ];

  return (
    <motion.div 
      className="mt-10 w-full max-w-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Et maintenant ?
        </h2>
        
        <ul className="space-y-4">
          {steps.map((step) => (
            <motion.li 
              key={step.id}
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + step.id * 0.2 }}
            >
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-800">{step.id}</span>
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-500">
                {step.text}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export const getServerSideProps: GetServerSideProps<OrderPageProps> = async (context) => {
  const { orderId } = context.params || {};
  const { status = 'success' } = context.query || {};
  
  // Validation du statut
  let validStatus: OrderStatus = 'success'; // Par défaut
  
  if (status === 'pending' || status === 'failed') {
    validStatus = status;
  }
  
  // À terme, vous pourriez vérifier la commande dans votre base de données
  // et déterminer son vrai statut
  
  if (!orderId || typeof orderId !== 'string') {
    return {
      notFound: true // Retourne une 404 si l'ID de commande n'est pas valide
    };
  }
  
  return {
    props: {
      orderId,
      status: validStatus
    }
  };
};

export default OrderPage;