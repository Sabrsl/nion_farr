import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiMapPin, 
  FiPhone, 
  FiMessageCircle, 
  FiMenu, 
  FiX, 
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiLinkedin,
  FiInstagram,
  FiUser,
  FiMapPin as FiLocation,
  FiGlobe,
  FiSend,
  FiFacebook,
  FiChevronDown,
  FiClock,
  FiShield,
  FiHeart
} from 'react-icons/fi/index.js';
import Layout from '../components/layout/Layout';

// Importation d'une icône personnalisée pour X (anciennement Twitter)
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.5 16h4.5l-11.5 -16z"></path>
    <path d="M4 20l3.5 -4.5"></path>
    <path d="M14.5 4h-5.5"></path>
    <path d="M16 20h4"></path>
  </svg>
);

const Contact: NextPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(Array(3).fill(false));
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    privacy: false
  });
  
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    message: false,
    privacy: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      firstName: formData.firstName.trim() === '',
      lastName: formData.lastName.trim() === '',
      email: !/^\S+@\S+\.\S+$/.test(formData.email),
      message: formData.message.trim() === '',
      privacy: !formData.privacy
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission with loading state
      setTimeout(() => {
        setFormSubmitted(true);
        // Reset form after 5 seconds for demo purposes
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
            message: '',
            privacy: false
          });
        }, 5000);
      }, 1500);
    } else {
      // Scroll to form if there are errors
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  
  const handleHover = (index: number, isHovering: boolean) => {
    const newHoverState = [...isHovered];
    newHoverState[index] = isHovering;
    setIsHovered(newHoverState);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 }
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Tabs for contact methods
  const contactTabs = [
    {
      title: "Particuliers",
      icon: <FiUser className="w-5 h-5" />,
      content: (
        <>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Vous avez un projet personnel et souhaitez faire appel à nos services ? Contactez-nous directement par email.
          </p>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3 sm:mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <a href="mailto:particuliers@nionfar.sn" className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center" rel="noopener noreferrer" target="_blank" aria-label="Envoyer un email aux particuliers">
                particuliers@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      )
    },
    {
      title: "Entreprises",
      icon: <FiGlobe className="w-5 h-5" />,
      content: (
        <>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Vous représentez une entreprise et souhaitez établir un partenariat ou utiliser nos services ? Notre équipe dédiée est à votre écoute.
          </p>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center mr-3 sm:mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <a href="mailto:entreprises@nionfar.sn" className="text-sm sm:text-base text-blue-600 hover:text-blue-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center" rel="noopener noreferrer" target="_blank" aria-label="Envoyer un email aux entreprises">
                entreprises@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      )
    },
    {
      title: "Presse",
      icon: <FiMessageCircle className="w-5 h-5" />,
      content: (
        <>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Journaliste ou média souhaitant réaliser un reportage ou obtenir des informations sur NionFar ? Contactez notre service presse.
          </p>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mr-3 sm:mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <a href="mailto:presse@nionfar.sn" className="text-sm sm:text-base text-pink-600 hover:text-pink-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center" rel="noopener noreferrer" target="_blank" aria-label="Envoyer un email à la presse">
                presse@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      )
    }
  ];

  // FAQs with animation variants
  const faqs = [
    {
      question: "Comment fonctionne le processus de paiement sur NionFar ?",
      answer: "Notre système sécurisé utilise un système d'escrow. Les fonds sont bloqués jusqu'à validation du travail. Nous acceptons les cartes bancaires internationales, Orange Money, Wave et Free Money pour une flexibilité maximale."
    },
    {
      question: "Quels sont les délais de réponse à mes messages ?",
      answer: "Notre équipe s'engage à répondre à toutes les demandes dans un délai de 24 heures ouvrables. Pour les demandes urgentes, nous vous recommandons d'utiliser notre ligne téléphonique directe."
    },
    {
      question: "Comment devenir freelance sur la plateforme ?",
      answer: "Pour devenir freelance sur NionFar, créez un compte, complétez votre profil avec vos compétences et expériences, passez notre processus de vérification, puis créez vos offres de services. Notre équipe validera votre profil sous 48h."
    },
    {
      question: "Quelle est votre politique de remboursement ?",
      answer: "Si vous n'êtes pas satisfait du travail livré et que le freelance ne peut pas résoudre le problème, nous vous remboursons intégralement dans les 7 jours suivant la livraison finale. Votre satisfaction est notre priorité."
    },
    {
      question: "Comment puis-je suivre l'avancement de mon projet ?",
      answer: "Suivez l'avancement de votre projet en temps réel via notre tableau de bord intuitif. Vous recevrez également des notifications par email à chaque étape clé du projet. Notre plateforme facilite la communication directe avec le freelance."
    }
  ];
  
  // Key benefits section data
  const benefits = [
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Réponse rapide",
      description: "Notre équipe répond à toutes les demandes dans un délai de 24h maximum."
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Paiements sécurisés",
      description: "Tous vos paiements sont protégés par notre système de sécurité avancé."
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Satisfaction garantie",
      description: "Nous travaillons jusqu'à votre entière satisfaction ou vous êtes remboursé."
    }
  ];

  return (
    <Layout
      title="Contact | NionFar - Services freelance au Sénégal"
      description="Contactez l'équipe NionFar pour toute question ou demande. Nous sommes là pour vous aider avec vos projets freelance."
    >
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 font-sans">
        <Head>
          <title>Contact | NionFar.sn - Plateforme de Freelance au Sénégal</title>
          <meta name="description" content="Contactez l'équipe de NionFar pour toute question concernant nos services freelance, votre compte ou pour obtenir plus d'informations sur notre plateforme au Sénégal." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        </Head>

        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16"
            >
              {/* Formulaire de contact amélioré */}
              <motion.div 
                ref={formRef}
                variants={itemVariants} 
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-10 order-2 lg:order-1 backdrop-blur-sm bg-opacity-90 border border-gray-100 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full opacity-70 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-70 blur-3xl"></div>
                
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                    Complétez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                  </p>
                  
                  {formSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 sm:p-8 text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <FiCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2 sm:mb-3">Message envoyé avec succès !</h3>
                      <p className="text-sm sm:text-base text-green-700 mb-6 sm:mb-8">
                        Merci de nous avoir contactés. Notre équipe vous répondra très rapidement.
                      </p>
                      <button 
                        onClick={() => setFormSubmitted(false)}
                        className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        Envoyer un nouveau message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Prénom
                          </label>
                          <div className={`relative ${formErrors.firstName ? 'animate-shake' : ''}`}>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <FiUser className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border ${formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors text-sm`}
                              placeholder="Votre prénom"
                            />
                            {formErrors.firstName && (
                              <p className="mt-1 text-xs text-red-500">Veuillez entrer votre prénom</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Nom
                          </label>
                          <div className={`relative ${formErrors.lastName ? 'animate-shake' : ''}`}>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <FiUser className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border ${formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors text-sm`}
                              placeholder="Votre nom"
                            />
                            {formErrors.lastName && (
                              <p className="mt-1 text-xs text-red-500">Veuillez entrer votre nom</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className={`relative ${formErrors.email ? 'animate-shake' : ''}`}>
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <FiMail className="w-4 h-4" />
                          </span>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors text-sm`}
                            placeholder="votre.email@exemple.com"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-xs text-red-500">Veuillez entrer un email valide</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Sujet
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <FiMessageCircle className="w-4 h-4" />
                          </span>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors text-sm"
                          >
                            <option value="">Sélectionnez un sujet</option>
                            <option value="info">Demande d'information</option>
                            <option value="service">Services et tarifs</option>
                            <option value="support">Support technique</option>
                            <option value="partnership">Partenariat</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <div className={`relative ${formErrors.message ? 'animate-shake' : ''}`}>
                          <textarea
                            id="message"
                            name="message"
                            rows={5}
                            value={formData.message}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 sm:py-3 bg-gray-50 border ${formErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors text-sm`}
                            placeholder="Décrivez votre demande en détail..."
                          ></textarea>
                          {formErrors.message && (
                            <p className="mt-1 text-xs text-red-500">Veuillez entrer votre message</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="privacy"
                            name="privacy"
                            type="checkbox"
                            checked={formData.privacy}
                            onChange={handleInputChange}
                            className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${formErrors.privacy ? 'border-red-300' : ''}`}
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="privacy" className={`text-xs sm:text-sm ${formErrors.privacy ? 'text-red-500' : 'text-gray-600'}`}>
                            J'accepte la <Link href="/confidentialite" className="text-indigo-600 hover:text-indigo-800">politique de confidentialité</Link>
                          </label>
                          {formErrors.privacy && (
                            <p className="mt-1 text-xs text-red-500">Vous devez accepter la politique de confidentialité</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm sm:text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <FiSend className="mr-2 w-4 h-4" />
                          Envoyer le message
                        </button>
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                          En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
              
              {/* Contact Info et Tabs améliorés */}
              <motion.div variants={itemVariants} className="order-1 lg:order-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Nous contacter</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Choisissez le service adapté à votre besoin
                </p>

                {/* Contact tabs */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden mb-6 sm:mb-8">
                  <div className="flex border-b">
                    {contactTabs.map((tab, index) => (
                      <button
                        key={index}
                        className={`flex-1 py-3 sm:py-4 px-3 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 transition-colors ${
                          activeTab === index 
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab(index)}
                      >
                        {tab.icon}
                        <span className="text-sm sm:text-base font-medium">{tab.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 sm:p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[200px] sm:min-h-[240px]"
                      >
                        {contactTabs[activeTab].content}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Social Media Links */}
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Suivez-nous</h3>
                  <div className="flex space-x-3 sm:space-x-4">
                    <a href="https://linkedin.com/company/nionfar" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="LinkedIn">
                      <FiLinkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a href="https://facebook.com/nionfarsn" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="Facebook">
                      <FiFacebook className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a href="https://x.com/nionfarsn" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="X (anciennement Twitter)">
                      <XIcon />
                    </a>
                    <a href="https://instagram.com/nionfarsn" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="Instagram">
                      <FiInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Questions fréquentes</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Retrouvez les réponses aux questions les plus courantes ou contactez-nous directement
              </p>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-3 sm:space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-medium text-left text-gray-900">{faq.question}</span>
                    <FiChevronDown 
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${
                        activeFaq === index ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 sm:px-6 pb-4 sm:pb-5"
                      >
                        <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Contact;