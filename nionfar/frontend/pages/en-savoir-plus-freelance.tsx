import React, { useState, useEffect, ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiCheck, 
  FiCheckCircle, 
  FiChevronRight, 
  FiArrowRight, 
  FiClock, 
  FiDollarSign, 
  FiStar, 
  FiShield, 
  FiUsers, 
  FiAward,
  FiHelpCircle,
  FiPhone,
  FiMail,
  FiFileText,
  FiBarChart2,
  FiX,
  FiMenu
} from 'react-icons/fi';

// Définition des types
interface Advantage {
  icon: ReactNode;
  title: string;
  description: string;
}

interface Tip {
  tips: string[];
  title: string;
  description: string;
}

const EnSavoirPlusFreelance = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Liste des avantages
  const advantages: Advantage[] = [
    {
      icon: <FiDollarSign className="w-6 h-6" />,
      title: "Revenus garantis",
      description: "Tous vos paiements sont sécurisés par notre système d'entiercement qui protège à la fois les freelances et les clients."
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Visibilité maximale",
      description: "Notre algorithme intelligent met en avant vos services auprès des clients qui correspondent le mieux à vos compétences."
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Sécurité assurée",
      description: "Nous vérifions tous les comptes et assurons la protection de vos données personnelles et bancaires."
    },
    {
      icon: <FiStar className="w-6 h-6" />,
      title: "Notoriété locale",
      description: "Développez votre réputation et construisez un portefeuille solide qui vous démarquera dans votre domaine au Sénégal."
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Programme d'excellence",
      description: "Les freelances les plus performants bénéficient d'avantages exclusifs et d'une visibilité accrue sur la plateforme."
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Flexibilité totale",
      description: "Travaillez à votre rythme, choisissez vos projets et fixez vos propres tarifs en fonction de votre expertise."
    }
  ];

  // Étapes pour réussir
  const steps: Tip[] = [
    {
      title: "Créez un profil professionnel complet",
      description: "Votre profil est votre vitrine pour attirer les clients. Investissez du temps pour le rendre attractif et professionnel.",
      tips: [
        "Utilisez une photo de profil professionnelle et souriante",
        "Rédigez une bio concise qui met en avant votre expertise et votre personnalité",
        "Ajoutez tous vos diplômes et certifications pertinents",
        "Créez un portfolio qui présente vos meilleurs travaux"
      ]
    },
    {
      title: "Définissez vos services avec précision",
      description: "Des services bien définis avec des prix clairs aident les clients à comprendre exactement ce que vous proposez.",
      tips: [
        "Créez des packs de services à différents niveaux de prix",
        "Détaillez ce qui est inclus dans chaque prestation",
        "Fixez des délais réalistes que vous pourrez respecter",
        "Utilisez des mots-clés pertinents pour améliorer votre référencement"
      ]
    },
    {
      title: "Communiquez efficacement avec vos clients",
      description: "La communication est la clé d'une relation client réussie et de projets menés à bien.",
      tips: [
        "Répondez rapidement aux messages (idéalement dans les 2 heures)",
        "Posez beaucoup de questions pour bien comprendre les besoins du client",
        "Maintenez le client informé de l'avancement du projet",
        "Restez toujours courtois et professionnel, même face aux demandes difficiles"
      ]
    },
    {
      title: "Livrez un travail de qualité dans les délais",
      description: "La qualité et la ponctualité sont essentielles pour obtenir des évaluations positives et fidéliser vos clients.",
      tips: [
        "Vérifiez toujours votre travail avant de le livrer",
        "Respectez scrupuleusement les délais annoncés",
        "Proposez des révisions si le client n'est pas entièrement satisfait",
        "Demandez poliment un avis après la livraison du projet"
      ]
    },
    {
      title: "Développez votre présence sur la plateforme",
      description: "Plus vous êtes actif sur NionFar, plus vous augmentez vos chances de succès à long terme.",
      tips: [
        "Mettez régulièrement à jour votre profil et vos services",
        "Participez aux programmes de fidélité et aux concours",
        "Suivez les formations gratuites proposées par NionFar",
        "Analysez vos statistiques pour améliorer constamment vos performances"
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>En savoir plus sur le freelancing | NionFar.sn</title>
        <meta name="description" content="Découvrez tout ce que vous devez savoir pour réussir en tant que freelance sur NionFar, la plateforme leader du freelancing au Sénégal." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header with glass morphism effect */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold ${
                scrollY > 50 
                  ? 'text-indigo-600' 
                  : 'text-white'
              }`}>
                NionFar<span className={`${scrollY > 50 ? 'text-violet-500' : 'text-indigo-300'}`}>.sn</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              <Link 
                href="/explorer" 
                className={`text-sm font-medium ${scrollY > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Explorer
              </Link>
              <Link 
                href="/comment-ca-marche" 
                className={`text-sm font-medium ${scrollY > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Comment ça marche
              </Link>
              <Link 
                href="/devenir-freelance" 
                className={`text-sm font-medium ${scrollY > 50 ? 'text-indigo-500' : 'text-indigo-300'}`}
              >
                Devenir freelance
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium ${scrollY > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Contact
              </Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-6 relative z-10">
              <Link 
                href="/login" 
                className={`text-sm font-medium ${scrollY > 50 ? 'text-gray-800' : 'text-white'} hover:text-indigo-500 transition-colors`}
              >
                Connexion
              </Link>
              <Link 
                href="/register?type=freelance" 
                className={`${
                  scrollY > 50 
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
                <FiX className={`w-6 h-6 ${scrollY > 50 ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <FiMenu className={`w-6 h-6 ${scrollY > 50 ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link href="/explorer" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Explorer
              </Link>
              <Link href="/comment-ca-marche" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Comment ça marche
              </Link>
              <Link href="/devenir-freelance" className="block px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg">
                Devenir freelance
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Contact
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link href="/login" className="block px-3 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                  Connexion
                </Link>
                <Link href="/register?type=freelance" className="block px-3 py-2 mt-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center">
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500 opacity-30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Tout ce que vous devez savoir pour réussir en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">freelance</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-indigo-100 mb-10"
              >
                Guide complet pour développer votre activité et maximiser vos revenus sur NionFar
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link 
                  href="/register?type=freelance" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  Commencer maintenant
                  <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#avantages" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  Découvrir les avantages
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Avantages Section */}
        <section id="avantages" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                Pourquoi NionFar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Les avantages exclusifs de notre plateforme</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez ce qui fait de NionFar la plateforme idéale pour développer votre activité de freelance au Sénégal
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
                  <p className="text-gray-600">{advantage.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Étapes pour réussir */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                Guide pratique
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Les 5 étapes pour réussir sur NionFar</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Suivez ce guide étape par étape pour maximiser vos chances de succès
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-start md:items-center mb-12 bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Prix et tarifs */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                Tarifs transparents
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Notre politique de tarification</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Chez NionFar, nous croyons en une tarification claire et équitable pour tous nos freelances
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto bg-gray-50 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-8 bg-indigo-600 text-white">
                <h3 className="text-2xl font-bold mb-2">Frais de service</h3>
                <p className="text-indigo-100">Notre commission est simple et transparente</p>
              </div>
              <div className="p-8">
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                      <span className="text-xl font-bold">15%</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">Commission standard</h4>
                      <p className="text-gray-600">Applicable sur tous les services que vous vendez sur la plateforme</p>
                    </div>
                  </div>
                  <ul className="pl-16 space-y-2">
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Si vous vendez un service à 10 000 FCFA, vous recevez 8 500 FCFA</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Les frais sont automatiquement déduits de chaque transaction</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Aucun frais caché ni abonnement mensuel</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-8 border-t border-gray-200 pt-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                      <span className="text-xl font-bold">12%</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">Commission pour les Top Freelances</h4>
                      <p className="text-gray-600">Pour les freelances de niveau 2 qui maintiennent une note de 4.8+</p>
                    </div>
                  </div>
                  <ul className="pl-16 space-y-2">
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Vous devez avoir réalisé au moins 10 projets avec succès</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Votre taux de satisfaction client doit être d'au moins 98%</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-indigo-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Ce statut est révisé tous les 3 mois</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <div className="flex items-start">
                    <div className="text-indigo-600 mt-1 mr-3">
                      <FiHelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Pourquoi des frais de service ?</h4>
                      <p className="text-gray-700">
                        Cette commission nous permet de maintenir et d'améliorer la plateforme, d'assurer le support client 7j/7, de promouvoir vos services auprès de nouveaux clients, et de garantir un système de paiement sécurisé. Nous réinvestissons constamment pour vous offrir les meilleurs outils pour développer votre activité.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages de freelances */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                Histoires de réussite
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ils ont réussi sur NionFar</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez les parcours inspirants de freelances qui ont transformé leur passion en carrière
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-indigo-100 overflow-hidden mr-4">
                    <img
                      src="/img/success-mamadou.jpg"
                      alt="Mamadou Diallo"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Mamadou Diallo</h3>
                    <p className="text-indigo-600">Développeur Web, Dakar</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6">
                  <p className="mb-4">
                    "Quand j'ai commencé sur NionFar il y a 2 ans, je venais de terminer mes études et je cherchais à gagner de l'expérience. Aujourd'hui, je gagne plus que je ne pourrais espérer dans un emploi traditionnel, et j'ai travaillé avec des clients du monde entier."
                  </p>
                  <p>
                    "Le système de protection des paiements m'a donné la confiance nécessaire pour proposer des services de qualité, et les outils de la plateforme m'ont aidé à gérer efficacement mes projets."
                  </p>
                </blockquote>
                <div className="flex items-center text-gray-500 text-sm">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="font-medium mr-2">4.9/5</span>
                  <span>• Plus de 120 projets complétés</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-indigo-100 overflow-hidden mr-4">
                    <img
                      src="/img/success-aissatou.jpg"
                      alt="Aïssatou Ndoye"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Aïssatou Ndoye</h3>
                    <p className="text-indigo-600">Graphiste & illustratrice, Thiès</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6">
                  <p className="mb-4">
                    "NionFar a complètement changé ma vie professionnelle. Avant, je travaillais dans un bureau de design où mes idées créatives étaient limitées. Aujourd'hui, je suis ma propre cheffe et j'ai pu développer un style unique qui attire des clients fidèles."
                  </p>
                  <p>
                    "J'apprécie particulièrement la communauté de freelances sur la plateforme, nous nous entraidons et partageons des conseils. C'est bien plus qu'un simple site de freelance."
                  </p>
                </blockquote>
                <div className="flex items-center text-gray-500 text-sm">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="font-medium mr-2">5.0/5</span>
                  <span>• Plus de 85 projets complétés</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500 opacity-30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Prêt à lancer votre carrière de freelance ?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-indigo-100 mb-10"
              >
                Rejoignez des milliers de professionnels qui transforment leurs compétences en opportunités lucratives
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link 
                  href="/register?type=freelance" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  S'inscrire gratuitement
                  <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  Nous contacter
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-10 flex justify-center space-x-6"
              >
                <div className="flex items-center text-indigo-200">
                  <FiUsers className="mr-2" />
                  <span>+10 000 freelances</span>
                </div>
                <div className="flex items-center text-indigo-200">
                  <FiShield className="mr-2" />
                  <span>Paiements sécurisés</span>
                </div>
                <div className="flex items-center text-indigo-200">
                  <FiFileText className="mr-2" />
                  <span>Support 7j/7</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div>
                <div className="text-2xl font-bold mb-6">
                  NionFar<span className="text-indigo-400">.sn</span>
                </div>
                <p className="text-gray-400 mb-6">
                  La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité.
                </p>
                <div className="flex space-x-4 text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.292h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
                <ul className="space-y-3">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
                  <li><Link href="/devenir-freelance" className="text-gray-400 hover:text-white transition-colors">Devenir freelance</Link></li>
                  <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Catégories</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Ressources</h4>
                <ul className="space-y-3">
                  <li><Link href="/aide" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</Link></li>
                  <li><Link href="/guides" className="text-gray-400 hover:text-white transition-colors">Guides pour freelances</Link></li>
                  <li><Link href="/tutoriels" className="text-gray-400 hover:text-white transition-colors">Tutoriels vidéo</Link></li>
                  <li><Link href="/webinaires" className="text-gray-400 hover:text-white transition-colors">Webinaires</Link></li>
                  <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Besoin d'aide ?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FiMail className="text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                    <a href="mailto:support@nionfar.sn" className="text-gray-400 hover:text-white transition-colors">support@nionfar.sn</a>
                  </li>
                  <li className="flex items-start">
                    <FiPhone className="text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                    <a href="tel:+221338592700" className="text-gray-400 hover:text-white transition-colors">+221 33 859 27 00</a>
                  </li>
                  <li className="mt-6">
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    >
                      Contacter l'équipe
                      <FiArrowRight className="ml-2" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} NionFar.sn - Tous droits réservés
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link href="/conditions" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Conditions d'utilisation
                </Link>
                <Link href="/confidentialite" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default EnSavoirPlusFreelance; 