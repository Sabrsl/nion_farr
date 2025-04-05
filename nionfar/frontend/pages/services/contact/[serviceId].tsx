import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiUser,
  FiMail,
  FiMessageSquare,
  FiArrowLeft,
  FiSend,
  FiShield,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiLink,
  FiPhone,
  FiCalendar,
  FiStar,
  FiX,
  FiMapPin
} from 'react-icons/fi';
import Head from 'next/head';

// Components
import Layout from '../../../components/layout/Layout';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Rating } from '../../../components/ui/Rating';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Spinner } from '../../../components/ui/Spinner';

// Hooks and Services
import { useAuth } from '../../../contexts/AuthContext';
import { trackEvent } from '../../../utils/analytics';

// Types
import { Service, User } from '../../../types';

// Custom components and hooks for this page
// Simple Toast hook implementation
const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    // In a real implementation, this would show a toast notification
    console.log(`Toast: ${message} (${type})`);
  };
  
  return { showToast };
};

// Simple UI components
const Container: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className = '' }) => (
  <div className={`container mx-auto px-4 ${className}`}>{children}</div>
);

const Heading: React.FC<{as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; children: React.ReactNode; className?: string}> = 
  ({ as: Component = 'h2', size = 'lg', children, className = '' }) => {
    const sizeClasses = {
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl'
    };
    return <Component className={`font-bold ${sizeClasses[size]} ${className}`}>{children}</Component>;
};

const Text: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className = '' }) => (
  <p className={`${className}`}>{children}</p>
);

// Extended User interface to include extra properties used in this component
interface ExtendedUser extends User {
  responseTime?: string;
  totalReviews?: number;
}

// Extended Service interface to include seller with the extended user type
interface ExtendedService extends Service {
  seller?: ExtendedUser;
}

// Form type
interface ContactFormData {
  subject: string;
  message: string;
  serviceRelated: boolean;
  phoneNumber?: string;
  attachFile?: FileList;
}

interface ContactPageProps {
  service: ExtendedService;
}

const ServiceContactPage: NextPage<ContactPageProps> = ({ service }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Get freelancer data from service
  const freelancer = service?.seller;
  
  // If no service or freelancer is found
  const noDataAvailable = !service || !freelancer;
  
  // Form validation
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ContactFormData>({
    defaultValues: {
      subject: `Question à propos de: ${service?.title || 'votre service'}`,
      message: '',
      serviceRelated: true,
      phoneNumber: ''
    }
  });
  
  // Watch form values for validation
  const watchMessage = watch('message');
  const watchServiceRelated = watch('serviceRelated');
  const watchAttachFile = watch('attachFile');
  
  // Update file preview when a file is selected
  useEffect(() => {
    if (watchAttachFile && watchAttachFile.length > 0) {
      const file = watchAttachFile[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Le fichier ne doit pas dépasser 5Mo', 'error');
        setValue('attachFile', undefined);
        return;
      }
      
      // Create file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [watchAttachFile, setValue, showToast]);
  
  // Handle form submission
  const onSubmit = async (data: ContactFormData) => {
    if (!isAuthenticated) {
      // Save form data to session storage and redirect to login
      sessionStorage.setItem('contactFormData', JSON.stringify(data));
      sessionStorage.setItem('contactRedirectUrl', window.location.pathname);
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Track analytics event
      trackEvent('contact_freelancer', {
        service_id: service.id,
        freelancer_id: freelancer?.id || '',
        has_attachment: !!data.attachFile
      });
      
      // Send message to the freelancer
      // In a real app, you would call your API here
      // await messageService.sendMessage({
      //   recipientId: freelancer.id,
      //   subject: data.subject,
      //   message: data.message,
      //   serviceId: data.serviceRelated ? service.id : undefined,
      //   attachments: data.attachFile ? [data.attachFile] : undefined
      // });
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success handling
      setSubmitSuccess(true);
      showToast('Message envoyé avec succès', 'success');
      
      // Reset form
      reset();
      setFilePreview(null);
      
      // Redirect to messages page after success
      setTimeout(() => {
        router.push('/messages');
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitError('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
      showToast('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demonstration purposes
  const mockService = {
    id: '123',
    slug: 'creation-site-web',
    title: 'Création de site web professionnel',
    description: 'Je crée des sites web modernes et responsive pour votre entreprise.',
    price: 150000,
    image: '/images/services/web-design.jpg',
    rating: 4.7,
    totalReviews: 48,
    deliveryTime: 7,
    category: 'Design & Développement',
    providerId: '456'
  };

  const mockFreelancer = {
    id: '456',
    username: 'amadou-dev',
    name: 'Amadou Diallo',
    avatar: '/images/freelancers/amadou.jpg',
    specialty: 'Développeur Web Full Stack',
    rating: 4.8,
    totalReviews: 72,
    address: 'Dakar, Sénégal',
    memberSince: '2022-03-15',
    responseTime: 'environ 1 heure',
    completedOrders: 64,
    languages: ['Français', 'Anglais', 'Wolof']
  };

  if (isAuthLoading || !service || !freelancer) {
    return (
      <Container className="py-16">
        <div className="h-screen flex flex-col items-center justify-center">
          <Spinner size="xl" color="primary" />
          <Text className="mt-4 text-gray-600">Chargement des informations...</Text>
        </div>
      </Container>
    );
  }

  if (submitError || noDataAvailable) {
    return (
      <Container className="py-16">
        <Alert 
          variant="error" 
          title="Erreur"
          message={submitError || "Service ou prestataire non trouvé"} 
          className="mb-4"
          actions={
            <Button 
              variant="primary"
              onClick={() => router.push('/services')}
            >
              Retourner à la liste des services
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Contacter {freelancer.name} | {service.title} | Nionfar</title>
        <meta name="description" content={`Contactez ${freelancer.name} à propos de son service: ${service.title}. Envoyez un message directement au prestataire sur Nionfar.`} />
        <meta property="og:title" content={`Contacter ${freelancer.name} | ${service.title}`} />
        <meta property="og:description" content={`Contactez ${freelancer.name} à propos de son service: ${service.title}. Envoyez un message directement au prestataire sur Nionfar.`} />
        <meta property="og:image" content={service.image || '/images/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Head>
      
      <Layout 
        title={`Contacter ${freelancer?.name || 'le prestataire'} | Nionfar`}
        description={`Contactez ${freelancer?.name || 'le prestataire'} à propos de son service "${service?.title || 'service'}" sur Nionfar.`}
      >
        <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen py-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-all"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </button>
            </div>
            
            {/* Page title */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heading as="h1" size="xl" className="mb-2">
                  Contacter le prestataire
                </Heading>
                <Text className="text-gray-600 max-w-2xl mx-auto">
                  Envoyez un message directement à {freelancer.name} à propos de son service "{service.title}"
                </Text>
              </motion.div>
            </div>

            {/* Breadcrumb */}
            <nav className="flex mb-8 text-sm text-gray-600" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center hover:text-indigo-600">
                    Accueil
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2">/</span>
                    <Link href="/services" className="hover:text-indigo-600">
                      Services
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2">/</span>
                    <Link href={`/services/${service.slug}`} className="hover:text-indigo-600">
                      {service.title}
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2">/</span>
                    <span className="text-gray-500">Contact</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact form column */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
                >
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FiMessageSquare className="mr-3 h-6 w-6 text-indigo-600" />
                    Contacter {freelancer?.name || 'le prestataire'}
                  </h1>
                  
                  {submitSuccess ? (
                    /* Success message */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FiCheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h2>
                      <p className="text-gray-600 mb-6">
                        Votre message a été envoyé à {freelancer.name} avec succès. Vous recevrez une notification lorsqu'il/elle vous répondra.
                      </p>
                      <a href="/messages">
                        <Button variant="primary">Voir mes messages</Button>
                      </a>
                    </motion.div>
                  ) : (
                    /* Contact form */
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {submitError && (
                        <Alert
                          variant="error"
                          title="Erreur"
                          message={submitError}
                          className="mb-6"
                        />
                      )}
                      
                      {/* Form fields */}
                      <div className="space-y-6">
                        {/* Subject field */}
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Sujet <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="subject"
                            type="text"
                            className={`w-full px-4 py-3 rounded-lg border ${errors.subject ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                            {...register("subject", { 
                              required: "Le sujet est obligatoire",
                              minLength: { value: 5, message: "Le sujet doit contenir au moins 5 caractères" } 
                            })}
                          />
                          {errors.subject && (
                            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                          )}
                        </div>
                        
                        {/* Message field */}
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Message <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="message"
                            rows={6}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                            {...register("message", { 
                              required: "Le message est obligatoire",
                              minLength: { value: 20, message: "Le message doit contenir au moins 20 caractères" } 
                            })}
                          ></textarea>
                          <div className="mt-1 flex justify-between items-center">
                            <p className={`text-xs ${errors.message ? 'text-red-600' : 'text-gray-500'}`}>
                              {errors.message ? errors.message.message : "Soyez précis et courtois dans votre message"}
                            </p>
                            <p className={`text-xs ${watchMessage?.length > 1000 ? 'text-red-600' : watchMessage?.length > 800 ? 'text-amber-600' : 'text-gray-500'}`}>
                              {watchMessage?.length || 0}/1200
                            </p>
                          </div>
                        </div>
                        
                        {/* Service related checkbox */}
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="serviceRelated"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              {...register("serviceRelated")}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="serviceRelated" className="font-medium text-gray-700">
                              Ce message concerne le service "{service.title}"
                            </label>
                            <p className="text-gray-500">
                              Cochez cette case pour lier votre message à ce service
                            </p>
                          </div>
                        </div>
                        
                        {/* Phone number field */}
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de téléphone (optionnel)
                          </label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                            {...register("phoneNumber", { 
                              pattern: { 
                                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                                message: "Veuillez entrer un numéro de téléphone valide" 
                              } 
                            })}
                          />
                          {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Votre numéro ne sera partagé qu'avec ce prestataire
                          </p>
                        </div>
                        
                        {/* File attachment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pièce jointe (optionnel)
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 transition-colors">
                            <div className="space-y-2 text-center">
                              <div className="flex flex-col items-center">
                                <FiLink className="h-8 w-8 text-gray-400" />
                                <span className="mt-2 block text-sm font-medium text-gray-700">
                                  {filePreview ? 'Fichier sélectionné' : 'Ajouter un fichier'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, PDF jusqu'à 5 MB
                              </p>
                              <button
                                type="button"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition-colors"
                                onClick={() => document.getElementById('file-upload')?.click()}
                              >
                                Sélectionner un fichier
                              </button>
                              <input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".jpg,.jpeg,.png,.pdf"
                                {...register("attachFile")}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    setValue('attachFile', e.target.files);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* File preview */}
                          {filePreview && (
                            <div className="mt-3 relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <FiLink className="h-5 w-5 text-indigo-600" />
                                  </div>
                                </div>
                                <div className="ml-3 flex-1 truncate">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {watchAttachFile && watchAttachFile[0]?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {watchAttachFile && watchAttachFile[0]?.size ? (watchAttachFile[0].size / 1024).toFixed(0) + ' KB' : ''}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                                  onClick={() => {
                                    setValue('attachFile', undefined);
                                    setFilePreview(null);
                                  }}
                                >
                                  <FiX className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Terms notice */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <FiInfo className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-gray-600">
                                En envoyant ce message, vous acceptez les <Link href="/terms" className="text-indigo-600 hover:text-indigo-800 hover:underline">conditions d'utilisation</Link> de Nionfar et vous vous engagez à respecter notre <Link href="/code-of-conduct" className="text-indigo-600 hover:text-indigo-800 hover:underline">code de conduite</Link>.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Submit button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 text-base font-medium shadow-lg"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                          >
                            <FiSend className="mr-2 h-5 w-5" />
                            Envoyer le message
                          </Button>
                          <p className="mt-3 text-center text-xs text-gray-500">
                            Temps de réponse habituel : <span className="font-medium">{freelancer?.responseTime || 'environ 2 heures'}</span>
                          </p>
                        </div>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
              
              {/* Sidebar with service and freelancer info */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="space-y-6">
                  {/* Service preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="aspect-video relative">
                      <Image
                        src={service.image || '/images/placeholder-service.jpg'}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <Link 
                        href={`/services/${service.slug}`}
                        className="block text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2"
                      >
                        {service.title}
                      </Link>
                      
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Rating value={service.rating || 0} readOnly size="sm" />
                          <span className="ml-2 text-sm text-gray-600">
                            ({service.totalReviews || 0})
                          </span>
                        </div>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <FiClock className="mr-1 h-3.5 w-3.5" />
                          {service.deliveryTime} jours
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-indigo-600">
                          {service.price.toLocaleString()} FCFA
                        </span>
                        <Link 
                          href={`/services/${service.slug}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Freelancer preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-5"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos du prestataire</h3>
                    
                    <div className="flex items-center mb-4">
                      <Avatar
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        size="lg"
                        className="border-2 border-white shadow-sm"
                      />
                      <div className="ml-4">
                        <Link
                          href={`/freelancers/${freelancer.username || freelancer.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {freelancer.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {freelancer.specialty || 'Freelance'}
                        </p>
                        <div className="flex items-center mt-1">
                          <Rating value={freelancer.rating || 0} readOnly size="sm" />
                          <span className="ml-1 text-xs text-gray-500">
                            ({freelancer.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {freelancer.address && (
                        <div className="flex items-start">
                          <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                          <span className="text-gray-600">{freelancer.address}</span>
                        </div>
                      )}
                      
                      {freelancer.memberSince && (
                        <div className="flex items-start">
                          <FiCalendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                          <span className="text-gray-600">
                            Membre depuis {new Date(freelancer.memberSince).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <FiClock className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                        <span className="text-gray-600">
                          Temps de réponse moyen: {freelancer?.responseTime || 'environ 2 heures'}
                        </span>
                      </div>
                      
                      {freelancer.completedOrders && (
                        <div className="flex items-start">
                          <FiCheckCircle className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                          <span className="text-gray-600">
                            {freelancer.completedOrders} commandes complétées
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <a
                        href={`/freelancers/${freelancer.username || freelancer.id}`}
                        className="block w-full text-center px-4 py-2 border border-indigo-600 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        Voir le profil complet
                      </a>
                    </div>
                  </motion.div>
                  
                  {/* Security notice */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-green-50 rounded-2xl p-5 border border-green-100"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <FiShield className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-base font-semibold text-green-900">Environnement sécurisé</h3>
                    </div>
                    <p className="mt-3 text-sm text-green-800">
                      Tous les messages sont cryptés et stockés en toute sécurité. Nionfar protège vos informations personnelles et facilite une communication sûre entre vous et le prestataire.
                    </p>
                    <div className="mt-3 text-xs text-green-700">
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <FiCheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Messages protégés et sécurisés
                        </li>
                        <li className="flex items-center">
                          <FiCheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Transferts de fichiers cryptés
                        </li>
                        <li className="flex items-center">
                          <FiCheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Paiements sécurisés via Nionfar
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serviceId } = context.params || {};
  
  if (!serviceId || typeof serviceId !== 'string') {
    return {
      notFound: true
    };
  }
  
  try {
    // In a real app, fetch the service data from your API
    // const response = await api.get(`/services/${serviceId}`);
    // const service = response.data;
    
    // For demo purposes, create a mock service
    const service = {
      id: serviceId,
      title: "Création de site web professionnel sur mesure",
      slug: "creation-site-web-professionnel",
      image: "/images/services/website-design.jpg",
      description: "Je crée des sites web professionnels responsive et optimisés SEO qui correspondent parfaitement à l'image de votre entreprise.",
      price: 150000,
      deliveryTime: 7,
      rating: 4.8,
      totalReviews: 42,
      seller: {
        id: "1",
        name: "Samba Diallo",
        username: "sambadiallo",
        avatar: "/images/avatars/avatar-1.jpg",
        specialty: "Développeur Web & Designer UI/UX",
        rating: 4.9,
        totalReviews: 57,
        completedOrders: 124,
        memberSince: "2021-05-15T10:00:00Z",
        responseTime: "~2h",
        address: "Dakar, Sénégal"
      }
    };
    
    return {
      props: {
        service
      }
    };
  } catch (error) {
    console.error('Error fetching service:', error);
    return {
      notFound: true
    };
  }
};

export default ServiceContactPage; 