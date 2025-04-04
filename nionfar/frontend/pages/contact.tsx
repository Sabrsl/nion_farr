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
} from 'react-icons/fi';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
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
  
  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      icon: <FiUser className="w-6 h-6" />,
      content: (
        <>
          <p className="text-lg text-gray-600 mb-6">
            Vous avez un projet personnel et souhaitez faire appel à nos services ? Contactez-nous directement par email ou téléphone.
          </p>
          <div className="space-y-6">
            <div className="flex items-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white" />
              </div>
              <a href="mailto:particuliers@nionfar.sn" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                particuliers@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
            <div className="flex items-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiPhone className="text-white" />
              </div>
              <a href="tel:+221701234567" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                +221 70 123 45 67
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
          </div>
        </>
      )
    },
    {
      title: "Entreprises",
      icon: <FiGlobe className="w-6 h-6" />,
      content: (
        <>
          <p className="text-lg text-gray-600 mb-6">
            Vous représentez une entreprise et souhaitez établir un partenariat ou utiliser nos services ? Notre équipe dédiée est à votre écoute.
          </p>
          <div className="space-y-6">
            <div className="flex items-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white" />
              </div>
              <a href="mailto:entreprises@nionfar.sn" className="text-blue-600 hover:text-blue-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                entreprises@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
            <div className="flex items-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiPhone className="text-white" />
              </div>
              <a href="tel:+221334567890" className="text-blue-600 hover:text-blue-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                +221 33 456 78 90
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
          </div>
        </>
      )
    },
    {
      title: "Presse",
      icon: <FiMessageCircle className="w-6 h-6" />,
      content: (
        <>
          <p className="text-lg text-gray-600 mb-6">
            Journaliste ou média souhaitant réaliser un reportage ou obtenir des informations sur NionFar ? Contactez notre service presse.
          </p>
          <div className="space-y-6">
            <div className="flex items-center group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                <FiMail className="text-white" />
              </div>
              <a href="mailto:presse@nionfar.sn" className="text-pink-600 hover:text-pink-800 transition-colors font-medium group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                presse@nionfar.sn
                <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 font-sans">
      <Head>
        <title>Contact | NionFar.sn - Plateforme de Freelance au Sénégal</title>
        <meta name="description" content="Contactez l'équipe de NionFar pour toute question concernant nos services freelance, votre compte ou pour obtenir plus d'informations sur notre plateforme au Sénégal." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header with glass morphism effect */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrollPosition > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold ${
                scrollPosition > 50 
                  ? 'text-indigo-600' 
                  : 'text-white'
              }`}>
                NionFar<span className={`${scrollPosition > 50 ? 'text-violet-500' : 'text-indigo-300'}`}>.sn</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              <Link 
                href="/explorer" 
                className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Explorer
              </Link>
              <Link 
                href="/comment-ca-marche" 
                className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Comment ça marche
              </Link>
              <Link 
                href="/devenir-freelance" 
                className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Devenir freelance
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium ${scrollPosition > 50 ? 'text-indigo-500' : 'text-indigo-300'}`}
              >
                Contact
              </Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-6 relative z-10">
              <Link 
                href="/login" 
                className={`text-sm font-medium ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className={`${
                  scrollPosition > 50 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-600'
                } text-sm font-medium px-5 py-2.5 rounded-full hover:bg-indigo-700 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/25 relative z-20`}
              >
                Inscription
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <FiX className={`w-6 h-6 ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <FiMenu className={`w-6 h-6 ${scrollPosition > 50 ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 shadow-xl"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                <Link href="/explorer" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Explorer
                </Link>
                <Link href="/comment-ca-marche" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Comment ça marche
                </Link>
                <Link href="/devenir-freelance" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Devenir freelance
                </Link>
                <Link href="/contact" className="block px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg">
                  Contact
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link href="/login" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Connexion
                  </Link>
                  <Link href="/register" className="block px-3 py-2 mt-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center">
                    Inscription
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section with Dynamic Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 pt-32 pb-24">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500 opacity-20 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1 mb-6 text-xs font-medium text-indigo-200 bg-indigo-800/70 backdrop-blur-sm rounded-full ring-1 ring-indigo-600/50"
          >
            On est là pour vous
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
          >
            Contactez <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">notre équipe</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-indigo-100 max-w-3xl mb-10"
          >
            Notre équipe d'experts est prête à vous accompagner et à répondre à toutes vos questions
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={scrollToForm}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative z-10"
          >
            Envoyer un message
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        </div>
        
        <div className="absolute bottom-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative z-20 -mt-16 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 text-indigo-600">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16"
          >
            {/* Formulaire de contact amélioré */}
            <motion.div 
              ref={formRef}
              variants={itemVariants} 
              className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 order-2 lg:order-1 backdrop-blur-sm bg-opacity-90 border border-gray-100 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full opacity-70 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-70 blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
                <p className="text-gray-600 mb-8">
                  Complétez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                </p>
                
                {formSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-8 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FiCheck className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-3">Message envoyé avec succès !</h3>
                    <p className="text-green-700 mb-8">
                      Merci de nous avoir contactés. Notre équipe vous répondra très rapidement.
                    </p>
                    <button 
                      onClick={() => setFormSubmitted(false)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Envoyer un nouveau message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <div className={`relative ${formErrors.firstName ? 'animate-shake' : ''}`}>
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <FiUser />
                          </span>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
                            placeholder="Votre prénom"
                          />
                          {formErrors.firstName && (
                            <p className="mt-1 text-sm text-red-500">Veuillez entrer votre prénom</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <div className={`relative ${formErrors.lastName ? 'animate-shake' : ''}`}>
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <FiUser />
                          </span>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
                            placeholder="Votre nom"
                          />
                          {formErrors.lastName && (
                            <p className="mt-1 text-sm text-red-500">Veuillez entrer votre nom</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className={`relative ${formErrors.email ? 'animate-shake' : ''}`}>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <FiMail />
                        </span>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
                          placeholder="votre.email@exemple.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-500">Veuillez entrer un email valide</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Sujet
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <FiMessageCircle />
                        </span>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
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
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <div className={`relative ${formErrors.message ? 'animate-shake' : ''}`}>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border ${formErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
                          placeholder="Décrivez votre demande en détail..."
                        ></textarea>
                        {formErrors.message && (
                          <p className="mt-1 text-sm text-red-500">Veuillez entrer votre message</p>
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
                        <label htmlFor="privacy" className={`text-sm ${formErrors.privacy ? 'text-red-500' : 'text-gray-600'}`}>
                          J'accepte la <Link href="/confidentialite" className="text-indigo-600 hover:text-indigo-800">politique de confidentialité</Link>
                        </label>
                        {formErrors.privacy && (
                          <p className="mt-1 text-sm text-red-500">Vous devez accepter la politique de confidentialité</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <FiSend className="mr-2" />
                        Envoyer le message
                      </button>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
            
            {/* Contact Info et Tabs améliorés */}
            <motion.div variants={itemVariants} className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nous contacter</h2>
              <p className="text-gray-600 mb-8">
                Choisissez le service adapté à votre besoin
              </p>

              {/* Contact tabs */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="flex border-b">
                  {contactTabs.map((tab, index) => (
                    <button
                      key={index}
                      className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 transition-colors ${
                        activeTab === index 
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab(index)}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.title}</span>
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[240px]"
                    >
                      {contactTabs[activeTab].content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Bureaux physiques */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="mr-2 text-indigo-600" />
                  Nos bureaux
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <FiLocation className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Siège - Dakar</h4>
                      <address className="not-italic text-gray-600 mt-1">
                        Immeuble Rivonia, 2ème étage<br />
                        Plateau, Avenue Léopold Sédar Senghor<br />
                        Dakar, Sénégal
                      </address>
                      <p className="text-sm text-gray-500 mt-1">
                        <FiClock className="inline mr-1" /> Lun-Ven: 9h-18h
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4">
                      <FiLocation className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Bureau - Saint-Louis</h4>
                      <address className="not-italic text-gray-600 mt-1">
                        Résidence Les Alizes, 1er étage<br />
                        Avenue Général De Gaulle<br />
                        Saint-Louis, Sénégal
                      </address>
                      <p className="text-sm text-gray-500 mt-1">
                        <FiClock className="inline mr-1" /> Lun-Ven: 9h-17h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <a href="https://linkedin.com/company/nionfar" className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="LinkedIn">
                    <FiLinkedin />
                  </a>
                  <a href="https://facebook.com/nionfarsn" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="Facebook">
                    <FiFacebook />
                  </a>
                  <a href="https://x.com/nionfarsn" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="X (anciennement Twitter)">
                    <XIcon />
                  </a>
                  <a href="https://instagram.com/nionfarsn" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg" aria-label="Instagram">
                    <FiInstagram />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Retrouvez les réponses aux questions les plus courantes ou contactez-nous directement
            </p>
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-medium text-left text-gray-900">{faq.question}</span>
                  <FiChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
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
                      className="px-6 pb-5"
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NionFar<span className="text-indigo-400">.sn</span></h3>
              <p className="text-gray-400 mb-4">
                La première plateforme qui connecte les talents freelance aux opportunités professionnelles au Sénégal.
              </p>
              <div className="flex space-x-4">
                <a href="https://linkedin.com/company/nionfar" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin />
                </a>
                <a href="https://facebook.com/nionfarsn" className="text-gray-400 hover:text-white transition-colors">
                  <FiFacebook />
                </a>
                <a href="https://x.com/nionfarsn" className="text-gray-400 hover:text-white transition-colors">
                  <XIcon />
                </a>
                <a href="https://instagram.com/nionfarsn" className="text-gray-400 hover:text-white transition-colors">
                  <FiInstagram />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/explorer" className="text-gray-400 hover:text-white transition-colors">
                    Explorer les services
                  </Link>
                </li>
                <li>
                  <Link href="/comment-ca-marche" className="text-gray-400 hover:text-white transition-colors">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="/devenir-freelance" className="text-gray-400 hover:text-white transition-colors">
                    Devenir freelance
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations légales</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/conditions-utilisation" className="text-gray-400 hover:text-white transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="text-gray-400 hover:text-white transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Politique de cookies
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <FiMail className="mr-2" />
                  <a href="mailto:contact@nionfar.sn" className="hover:text-white transition-colors">
                    contact@nionfar.sn
                  </a>
                </li>
                <li className="flex items-center text-gray-400">
                  <FiPhone className="mr-2" />
                  <a href="tel:+221338239000" className="hover:text-white transition-colors">
                    +221 33 823 90 00
                  </a>
                </li>
                <li className="flex items-start text-gray-400">
                  <FiMapPin className="mr-2 mt-1" />
                  <span>
                    Plateau, Avenue Léopold Sédar Senghor<br />
                    Dakar, Sénégal
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} NionFar.sn. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">
                Conçu avec <span className="text-red-500">❤️</span> à Dakar
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;