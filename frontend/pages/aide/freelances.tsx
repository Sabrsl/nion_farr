import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiChevronRight, FiChevronDown, FiChevronUp, 
  FiUsers, FiDollarSign, FiStar, FiTrendingUp, FiAward,
  FiBook, FiClock, FiCheckCircle, FiTarget, FiEdit,
  FiShield, FiMessageSquare, FiPackage, FiAlertCircle,
  FiGlobe, FiZap, FiSettings, FiFileText, FiGrid, FiHelpCircle,
  FiVideo
} from 'react-icons/fi/index.js';
import Layout from '../../components/layout/Layout';

// Data for Conseils de réussite
const conseilsReussite = [
  {
    icon: <FiTarget size={24} />,
    title: "Optimisez votre profil",
    description: "Remplissez intégralement votre profil avec portfolio, compétences détaillées et photo professionnelle."
  },
  {
    icon: <FiEdit size={24} />,
    title: "Créez des offres de services claires",
    description: "Définissez précisément vos services avec des packs tarifaires et des délais de livraison réalistes."
  },
  {
    icon: <FiMessageSquare size={24} />,
    title: "Communiquez efficacement",
    description: "Répondez rapidement et de manière professionnelle aux messages des clients potentiels."
  },
  {
    icon: <FiStar size={24} />,
    title: "Collectez des avis positifs",
    description: "Demandez des évaluations après chaque projet réussi pour renforcer votre crédibilité."
  },
  {
    icon: <FiTrendingUp size={24} />,
    title: "Suivez vos performances",
    description: "Analysez vos statistiques pour comprendre quels services attirent le plus de clients."
  },
  {
    icon: <FiClock size={24} />,
    title: "Respectez les délais",
    description: "Livrez toujours vos projets dans les temps pour maintenir une réputation professionnelle."
  }
];

// Data for Parcours Freelance
const parcourFreelance = [
  {
    icon: <FiUsers size={20} />,
    title: "Créez votre compte",
    description: "Inscrivez-vous sur NionFar et remplissez votre profil en détaillant vos compétences et votre expérience."
  },
  {
    icon: <FiGrid size={20} />,
    title: "Définissez vos services",
    description: "Créez des offres claires avec différents niveaux de service et prix correspondants."
  },
  {
    icon: <FiFileText size={20} />,
    title: "Soumettez des propositions",
    description: "Répondez aux projets pertinents avec des propositions personnalisées et convaincantes."
  },
  {
    icon: <FiCheckCircle size={20} />,
    title: "Exécutez les projets",
    description: "Réalisez le travail demandé avec professionnalisme, en communiquant régulièrement avec le client."
  },
  {
    icon: <FiZap size={20} />,
    title: "Développez votre activité",
    description: "Demandez des avis, élargissez vos compétences et augmentez progressivement vos tarifs."
  }
];

// FAQ Icons
const faqIcons = [
  <FiDollarSign size={20} />,
  <FiClock size={20} />,
  <FiShield size={20} />,
  <FiSettings size={20} />,
  <FiTarget size={20} />,
  <FiGlobe size={20} />
];

// FAQ Data
const faqsFreelances = [
  {
    question: "Comment sont calculés les frais sur NionFar?",
    answer: "NionFar prélève une commission de 15% sur chaque projet terminé. Vous recevez donc 85% du montant payé par le client. Les frais de paiement sont inclus dans cette commission, vous n'avez pas de frais supplémentaires à payer."
  },
  {
    question: "Combien de temps faut-il pour être validé comme freelance?",
    answer: "Le processus de validation prend généralement 24 à 48 heures. Notre équipe vérifie manuellement chaque profil pour maintenir un haut niveau de qualité sur la plateforme."
  },
  {
    question: "Comment puis-je me démarquer de la concurrence?",
    answer: "Créez un profil complet avec un portfolio de qualité, des compétences bien détaillées et des offres de services claires. Répondez rapidement aux messages et maintenez une note d'évaluation élevée en délivrant un travail de qualité."
  },
  {
    question: "Quels sont les moyens de paiement disponibles?",
    answer: "Nous proposons plusieurs méthodes de paiement : virement bancaire, Orange Money, Wave, et PayPal. Vous pouvez configurer votre méthode préférée dans les paramètres de votre compte."
  },
  {
    question: "Puis-je travailler avec des clients internationaux?",
    answer: "Absolument! NionFar vous connecte avec des clients du monde entier. Vous pouvez proposer vos services dans plusieurs langues et être payé dans votre devise locale."
  },
  {
    question: "Comment gérer un désaccord avec un client?",
    answer: "En cas de litige, contactez d'abord le client pour tenter de résoudre le problème à l'amiable. Si aucune solution n'est trouvée, notre service médiation peut intervenir pour faciliter une résolution équitable."
  }
];

// Témoignages
const temoignages = [
  {
    name: "Abdou Diallo",
    profession: "Développeur Web",
    rating: 5,
    testimonial: "Grâce à NionFar, j'ai pu tripler mes revenus en seulement 6 mois. La plateforme m'a donné accès à des clients internationaux que je n'aurais jamais pu atteindre autrement."
  },
  {
    name: "Fatou Ndiaye",
    profession: "Designer Graphique",
    rating: 5,
    testimonial: "J'apprécie particulièrement la simplicité d'utilisation et la protection des paiements. Je me concentre sur mon travail créatif pendant que NionFar s'occupe de la partie administrative."
  },
  {
    name: "Mamadou Sow",
    profession: "Rédacteur Web",
    rating: 4,
    testimonial: "La communauté de freelances sur NionFar est très solidaire. J'ai pu développer mon réseau et même collaborer avec d'autres professionnels sur des projets plus importants."
  },
  {
    name: "Aïssatou Diop",
    profession: "Traductrice",
    rating: 5,
    testimonial: "En tant que traductrice, j'avais du mal à trouver des clients réguliers. Depuis que j'utilise NionFar, j'ai un flux constant de projets et j'ai même pu me spécialiser dans les domaines qui me passionnent."
  }
];

// Ressources
const resources = [
  {
    title: "Guide du débutant",
    description: "Tout ce que vous devez savoir pour démarrer votre carrière de freelance sur NionFar.",
    link: "/aide/guide-debutant"
  },
  {
    title: "Webinaires et formations",
    description: "Des sessions en direct et enregistrées pour améliorer vos compétences professionnelles.",
    link: "/aide/webinaires"
  },
  {
    title: "Modèles de documents",
    description: "Contrats, devis et factures prêts à l'emploi pour professionnaliser votre activité.",
    link: "/aide/modeles-documents"
  },
  {
    title: "Blog Freelance",
    description: "Conseils, tendances et success stories pour vous inspirer et vous guider.",
    link: "/blog/freelance"
  }
];

// Resource Icons
const resourceIcons = [
  <FiBook size={24} />,
  <FiVideo size={24} />,
  <FiFileText size={24} />,
  <FiEdit size={24} />
];

const GuideFreelances: NextPage = () => {
  const [openSection, setOpenSection] = useState<number | null>(null);

  // Helper pour générer des URLs complètes en tenant compte du SSR
  const getFullUrl = (path: string): string => {
    if (typeof window === 'undefined') {
      // Côté serveur: retourner le chemin relatif
      return path;
    }
    // Côté client: retourner l'URL complète
    return `${window.location.origin}${path}`;
  };

  // Fonction pour gérer la navigation manuelle (cohérente avec le header)
  const handleManualNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    console.log('[FreelancesPage] Navigation manuelle vers:', path);
    
    // Utiliser un formulaire pour une navigation plus fiable
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = path;
    document.body.appendChild(form);
    form.submit();
  };

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Guide pour les Freelances | Centre d'aide NionFar</title>
        <meta name="description" content="Découvrez comment réussir en tant que freelance sur NionFar. Conseils pour optimiser votre profil, attirer plus de clients et maximiser vos revenus." />
      </Head>

      <main className="bg-white">
        {/* Hero Section avec effet visuel moderne */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-900 pt-32 pb-24">
          {/* Éléments décoratifs améliorés */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-violet-500 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-purple-400 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s' }}></div>
            
            {/* Éléments graphiques additionnels */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-indigo-300 opacity-20 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 border border-violet-300 opacity-10 rounded-full"></div>
            <div className="absolute top-1/4 left-1/2 w-16 h-16 bg-indigo-400 opacity-20 rounded-full blur-md"></div>
            
            {/* Symboles freelance décoratifs */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiUsers />
            </div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiDollarSign />
            </div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiAward />
            </div>
            
            {/* Grille de points */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" 
                 style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)', backgroundSize: '50px 50px' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center space-x-2 text-indigo-100 mb-6 bg-indigo-800/30 backdrop-blur-sm py-2 px-4 rounded-full">
                <a 
                  href="/aide" 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Centre d'aide
                </a>
                <FiChevronRight />
                <span className="text-white font-medium">Guide pour les Freelances</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Guide pour les Freelances
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Tout ce que vous devez savoir pour réussir en tant que freelance sur NionFar
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button 
                  onClick={(e) => {
                    const element = document.getElementById('conseils');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                >
                  Conseils pour réussir
                  <FiArrowRight className="ml-2" />
                </motion.button>
                <motion.button 
                  onClick={(e) => {
                    const element = document.getElementById('resources');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-indigo-700/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-500/30 hover:bg-indigo-700/40 transition-all"
                >
                  Ressources et formations
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          {/* Vague décorative en bas */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto">
              <path 
                fill="#ffffff" 
                fillOpacity="1" 
                d="M0,32L60,37.3C120,43,240,53,360,48C480,43,600,21,720,21.3C840,21,960,43,1080,48C1200,53,1320,43,1380,37.3L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
              ></path>
            </svg>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-10 border border-indigo-100 shadow-md"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-600">
                    <FiUsers size={24} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Bienvenue sur le guide freelance</h2>
                </div>
                
                <div className="prose prose-lg prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Bienvenue dans le guide complet pour les freelances de NionFar. Que vous soyez un professionnel expérimenté ou que vous débutiez dans le freelancing, nous avons rassemblé les meilleures pratiques et conseils pour vous aider à maximiser vos chances de réussite sur notre plateforme.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Sur NionFar, vous avez l'opportunité de proposer vos services à des clients locaux et internationaux, de développer votre portefeuille de clients et d'accroître vos revenus. Ce guide vous accompagnera à chaque étape de votre parcours.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center bg-indigo-50 p-4 rounded-xl">
                  <FiAlertCircle className="text-indigo-600 mr-3 flex-shrink-0" size={20} />
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">À savoir</span> : Sur NionFar, vous conservez 85% de vos gains - nous ne prélevons que 15% de commission sur les projets réalisés.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiUsers size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">15,000+</div>
                <div className="text-gray-600">Freelances actifs</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiPackage size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">45,000+</div>
                <div className="text-gray-600">Projets réalisés</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiDollarSign size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">1.2 billion</div>
                <div className="text-gray-600">FCFA générés</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Conseils pour réussir */}
        <section id="conseils" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiTarget className="mr-2" />
                STRATÉGIES DE RÉUSSITE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Conseils pour réussir</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les clés pour développer votre activité de freelance sur NionFar
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {conseilsReussite.map((conseil, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="h-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100 group-hover:border-indigo-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-200 transition-colors shadow-sm">
                      {conseil.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {conseil.title}
                    </h3>
                    <p className="text-gray-600">{conseil.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Parcours du freelance */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiTrendingUp className="mr-2" />
                PARCOURS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Votre parcours de freelance</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                De l'inscription à la réussite, suivez le chemin vers le succès
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto relative">
              {/* Ligne de connexion verticale */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-indigo-100 hidden md:block"></div>
              
              <div className="space-y-16">
                {parcourFreelance.map((etape, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-8 relative"
                  >
                    <div className="flex-shrink-0 relative z-10">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white shadow-lg">
                        <span className="text-xl font-bold">{index + 1}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md p-8 md:ml-4 border border-gray-100 flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600">
                          {etape.icon}
                        </div>
                        {etape.title}
                      </h3>
                      <p className="text-gray-600">{etape.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Questions fréquentes */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiHelpCircle className="mr-2" />
                QUESTIONS FRÉQUENTES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Réponses aux questions les plus courantes des freelances
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqsFreelances.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
                  >
                    <button
                      className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none group"
                      onClick={(e) => toggleSection(index)}
                    >
                      <div className="flex items-center">
                        <div className="mr-5 bg-indigo-100 text-indigo-600 rounded-xl p-3">
                          {faqIcons[index % faqIcons.length]}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="text-indigo-600 p-2 bg-indigo-50 rounded-full">
                        {openSection === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openSection === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-200 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiStar className="mr-2" />
                TÉMOIGNAGES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Témoignages de freelances</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez l'expérience de freelances qui ont réussi sur NionFar
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {temoignages.map((temoignage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`h-5 w-5 ${i < temoignage.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed">{temoignage.testimonial}</p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 shadow-sm">
                      <span className="text-indigo-800 font-semibold text-lg">{temoignage.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{temoignage.name}</p>
                      <p className="text-gray-500 text-sm">{temoignage.profession}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources et formation */}
        <section id="resources" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiBook className="mr-2" />
                RESSOURCES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ressources et formations</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des outils pour développer vos compétences et votre activité
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map((resource, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <a
                      href={resource.link}
                      className="block p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-full border border-gray-100 group-hover:border-indigo-200 cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:bg-indigo-200 transition-colors shadow-sm">
                        {resourceIcons[index % resourceIcons.length]}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
                      <p className="text-gray-600 mb-6">{resource.description}</p>
                      <div className="flex items-center text-indigo-600 font-medium">
                        Accéder
                        <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Rejoindre */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-900 relative overflow-hidden">
          {/* Éléments décoratifs améliorés */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-violet-500 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-purple-400 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s' }}></div>
            
            {/* Grille de points */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" 
                 style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)', backgroundSize: '50px 50px' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Prêt à démarrer votre aventure freelance ?
              </h2>
              <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-10">
                Rejoignez des milliers de freelances qui développent leur activité et leur réseau sur NionFar
              </p>
              
              <a 
                href="/signup"
                className="px-10 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all inline-flex items-center text-lg cursor-pointer"
              >
                Créer un compte freelance
                <FiArrowRight className="ml-2" />
              </a>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default GuideFreelances;



