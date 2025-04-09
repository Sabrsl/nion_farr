import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiChevronRight, FiChevronDown, FiChevronUp, 
  FiPackage, FiClock, FiCheckCircle, FiAlertCircle, FiStar, FiFileText,
  FiImage, FiCode, FiEdit, FiBarChart, FiVideo, FiGrid,
  FiSearch, FiMessageSquare, FiCreditCard, FiDollarSign, FiShield,
  FiHelpCircle, FiArrowUpRight, FiUsers, FiGlobe, FiSettings
} from 'react-icons/fi/index.js';
import Layout from '../../components/layout/Layout';

const CommandesServices: NextPage = () => {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Commandes et Services | Centre d'aide NionFar</title>
        <meta name="description" content="Découvrez comment passer commande et gérer vos services sur NionFar. Guide complet sur les types de services disponibles et le cycle d'une commande." />
      </Head>

      <main className="bg-white">
        {/* Hero Section avec effet visuel moderne */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 pt-32 pb-24">
          {/* Éléments décoratifs améliorés */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-violet-600 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-purple-500 opacity-20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s' }}></div>
            
            {/* Éléments graphiques additionnels */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-indigo-300 opacity-20 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 border border-violet-300 opacity-10 rounded-full"></div>
            <div className="absolute top-1/4 left-1/2 w-16 h-16 bg-indigo-400 opacity-20 rounded-full blur-md"></div>
            
            {/* Symboles décoratifs */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiPackage />
            </div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiCheckCircle />
            </div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiFileText />
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
                <a href="/aide" className="hover:text-white transition-colors">Centre d'aide</a>
                <FiChevronRight />
                <span className="text-white font-medium">Commandes et Services</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Commandes et Services
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Tout ce que vous devez savoir sur les services proposés et comment passer commande
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#processus"
                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                  >
                    Processus de commande
                    <FiArrowRight className="ml-2" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#types-services"
                    className="px-8 py-4 bg-indigo-800/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-600/30 hover:bg-indigo-800/40 transition-all"
                  >
                    Types de services
                  </a>
                </motion.div>
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

        {/* Le cycle d'une commande */}
        <section id="cycle-commande" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiClock className="mr-2" />
                PROCESSUS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Le cycle d'une commande</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                De la recherche à la livraison, suivez les étapes d'une commande réussie
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto relative">
              {/* Ligne de connexion verticale */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-indigo-100 hidden md:block"></div>
              
              <div className="space-y-16">
                {cycleCommande.map((etape, index) => (
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
                          {commandIcons[index]}
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

        {/* Types de services */}
        <section id="types-services" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiGrid className="mr-2" />
                SERVICES DISPONIBLES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Types de services disponibles</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez la diversité des services proposés par nos freelances
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {typesServices.map((service, index) => (
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
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {service.examples.map((example, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full group-hover:bg-indigo-100 transition-colors">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Processus d'approbation */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-10 border border-indigo-100 shadow-md">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre processus de validation</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      Comment nous garantissons la qualité de chaque service et protégeons votre satisfaction
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                    {/* Étape 1 : Livraison */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiPackage size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Livraison</h3>
                      <p className="text-gray-600">Le freelance vous livre le travail final selon les spécifications convenues</p>
                    </div>
                    
                    <div className="hidden md:block text-indigo-300">
                      <FiArrowRight size={24} />
                    </div>
                    
                    {/* Étape 2 : Vérification */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiFileText size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Vérification</h3>
                      <p className="text-gray-600">Vous examinez le travail et pouvez demander des révisions si nécessaire</p>
                    </div>
                    
                    <div className="hidden md:block text-indigo-300">
                      <FiArrowRight size={24} />
                    </div>
                    
                    {/* Étape 3 : Approbation */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiCheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Approbation</h3>
                      <p className="text-gray-600">Vous approuvez la livraison finale et le paiement est libéré au freelance</p>
                    </div>
                  </div>
                  
                  <div className="mt-12 text-center">
                    <a 
                      href="/aide/articles/processus-validation" 
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2 rounded-lg"
                    >
                      En savoir plus sur le processus
                      <FiArrowRight className="ml-2" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
                Réponses aux questions les plus courantes sur les commandes et services
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqServices.map((faq, index) => (
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
                      onClick={() => toggleSection(index)}
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

        {/* Aide supplémentaire */}
        <section className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-12 text-white relative overflow-hidden">
                  {/* Éléments décoratifs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full -mb-16 -ml-16"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Besoin d'aide supplémentaire ?</h2>
                    <p className="mb-8 text-indigo-100 text-lg">
                      Si vous avez des questions spécifiques concernant votre commande ou si vous rencontrez des difficultés, notre équipe de support est là pour vous aider.
                    </p>
                    <a 
                      href="/contact" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 group"
                    >
                      Contacter le support
                      <FiArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
                <div className="md:w-1/2 p-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FiHelpCircle className="text-indigo-600 mr-3" />
                    Autres catégories d'aide
                  </h3>
                  <ul className="space-y-4">
                    {autresCategories.map((categorie, index) => (
                      <li key={index}>
                        <a 
                          href={`/aide/${categorie.slug}`}
                          className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors group p-3 rounded-lg hover:bg-indigo-50"
                        >
                          {categorie.icon}
                          <span className="ml-3">{categorie.title}</span>
                          <FiChevronRight className="text-indigo-400 ml-auto transform group-hover:translate-x-1 transition-transform" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Prêt à commander un service ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Explorez notre marketplace et trouvez le freelance idéal pour votre projet.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="/explorer" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 group"
                  >
                    Explorer les services
                    <FiArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="/aide/trouver-freelance"
                    className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium border border-indigo-200 hover:border-indigo-300 transition-all"
                  >
                    Comment trouver un freelance
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

// Icônes pour chaque étape de commande
const commandIcons = [
  <FiSearch size={20} />,
  <FiMessageSquare size={20} />,
  <FiPackage size={20} />,
  <FiCreditCard size={20} />,
  <FiClock size={20} />,
  <FiCheckCircle size={20} />
];

// Icônes pour les FAQs
const faqIcons = [
  <FiUsers size={24} />,
  <FiFileText size={24} />,
  <FiEdit size={24} />,
  <FiClock size={24} />,
  <FiDollarSign size={24} />,
  <FiPackage size={24} />
];

// Cycle d'une commande
const cycleCommande = [
  {
    title: "Rechercher des services",
    description: "Utilisez notre moteur de recherche avec filtres pour trouver le service qui correspond à vos besoins. Vous pouvez filtrer par catégorie, prix, délai de livraison et évaluations.",
    icon: <FiSearch className="w-5 h-5 text-indigo-600" />
  },
  {
    title: "Discuter avec le freelance",
    description: "Avant de passer commande, échangez avec le freelance pour discuter des détails de votre projet. Posez toutes vos questions et assurez-vous que le service correspond à vos attentes.",
    icon: <FiMessageSquare className="w-5 h-5 text-indigo-600" />
  },
  {
    title: "Passer commande",
    description: "Une fois que vous êtes prêt, cliquez sur 'Commander' et complétez le formulaire de commande en précisant vos besoins spécifiques, les délais souhaités et tout autre détail important.",
    icon: <FiPackage className="w-5 h-5 text-indigo-600" />
  },
  {
    title: "Paiement sécurisé",
    description: "Procédez au paiement via notre système sécurisé. Le montant est conservé par NionFar et ne sera versé au freelance qu'une fois que vous aurez approuvé la livraison.",
    icon: <FiCreditCard className="w-5 h-5 text-indigo-600" />
  },
  {
    title: "Suivi de commande",
    description: "Suivez l'avancement de votre commande dans votre tableau de bord. Vous pouvez échanger avec le freelance à tout moment pour clarifier des points ou demander des mises à jour.",
    icon: <FiClock className="w-5 h-5 text-indigo-600" />
  },
  {
    title: "Réception et validation",
    description: "Une fois le travail terminé, le freelance vous livre le résultat. Vous pouvez alors l'examiner et demander des révisions si nécessaire. Lorsque vous êtes satisfait, approuvez la livraison pour finaliser la commande.",
    icon: <FiCheckCircle className="w-5 h-5 text-indigo-600" />
  }
];

// Types de services
const typesServices = [
  {
    title: "Design graphique",
    description: "Services de création graphique pour tous vos besoins visuels, de l'identité de marque aux supports marketing.",
    icon: <FiImage size={28} />,
    examples: ["Logo", "Brochure", "Flyer", "Bannière web", "Carte de visite"]
  },
  {
    title: "Développement web",
    description: "Services de création et d'amélioration de sites web, d'applications et de fonctionnalités en ligne.",
    icon: <FiCode size={28} />,
    examples: ["Site vitrine", "E-commerce", "Application web", "Intégration API", "Correction de bugs"]
  },
  {
    title: "Rédaction et traduction",
    description: "Services de création de contenu écrit, d'édition et de traduction dans plusieurs langues.",
    icon: <FiEdit size={28} />,
    examples: ["Articles de blog", "Copywriting", "Traduction FR-EN", "Relecture", "SEO"]
  },
  {
    title: "Marketing digital",
    description: "Services pour améliorer votre présence en ligne et attirer plus de clients via les canaux numériques.",
    icon: <FiBarChart size={28} />,
    examples: ["Gestion réseaux sociaux", "SEO", "Campagnes AdWords", "Email marketing", "Stratégie digitale"]
  },
  {
    title: "Vidéo et animation",
    description: "Services de création de contenu vidéo, d'animation et d'effets visuels pour divers usages.",
    icon: <FiVideo size={28} />,
    examples: ["Montage vidéo", "Motion design", "Animation logo", "Vidéo explicative", "Intro YouTube"]
  },
  {
    title: "Services personnalisés",
    description: "Des services sur mesure pour répondre à vos besoins spécifiques qui ne rentrent pas dans les catégories standard.",
    icon: <FiGrid size={28} />,
    examples: ["Consulting", "Formation", "Assistance technique", "Projet sur mesure", "Collaboration longue durée"]
  }
];

// FAQ Services
const faqServices = [
  {
    question: "Comment choisir entre différents freelances proposant des services similaires ?",
    answer: "Pour faire le meilleur choix, comparez plusieurs aspects : les évaluations et avis des clients précédents, la qualité des portfolios, le niveau d'expérience, le prix en relation avec la qualité proposée, et le délai de livraison. N'hésitez pas à contacter plusieurs freelances pour discuter de votre projet avant de décider. La qualité de leur communication et leur compréhension de vos besoins sont souvent de bons indicateurs. Privilégiez les freelances qui posent des questions pertinentes et vous proposent des solutions adaptées à votre situation spécifique."
  },
  {
    question: "Quelles informations dois-je fournir lors de ma commande ?",
    answer: "Pour obtenir le meilleur résultat possible, soyez aussi précis que possible dans votre brief de commande. Incluez : une description détaillée de ce que vous souhaitez, l'objectif du projet, le public cible, vos préférences visuelles ou stylistiques, des exemples ou références qui illustrent ce que vous aimez, les formats et spécifications techniques nécessaires, vos délais, et tout autre élément pertinent pour votre projet. Plus votre brief est complet, plus le freelance pourra vous livrer un résultat correspondant à vos attentes."
  },
  {
    question: "Comment fonctionnent les révisions et modifications ?",
    answer: "La plupart des services sur NionFar incluent un nombre spécifique de révisions, généralement entre 2 et 5 selon le type de service. Après réception de la livraison initiale, vous pouvez demander des modifications en fournissant des commentaires clairs et détaillés. Le freelance effectuera les ajustements demandés dans la limite du périmètre initial de la commande. Si vous souhaitez des modifications majeures qui dépassent le cadre de la commande originale ou le nombre de révisions incluses, le freelance pourra vous proposer un service complémentaire payant. Pour optimiser le processus, essayez de regrouper vos retours plutôt que de les envoyer un par un."
  },
  {
    question: "Que se passe-t-il en cas de retard de livraison ?",
    answer: "Si un freelance prévoit un retard, il doit vous en informer via la messagerie de la plateforme, en expliquant la raison et en proposant une nouvelle date de livraison. Vous pouvez alors accepter ce nouveau délai ou discuter d'autres options. Si un freelance est en retard sans communication, vous pouvez lui envoyer un message de rappel. En cas de retard significatif et non justifié, vous pouvez contacter notre service client qui pourra intervenir ou, dans certains cas, vous proposer d'annuler la commande sans frais. NionFar surveille les délais de livraison et les retards répétés peuvent affecter le classement du freelance sur la plateforme."
  },
  {
    question: "Puis-je demander un remboursement si je ne suis pas satisfait ?",
    answer: "Sur NionFar, vous avez différentes options si vous n'êtes pas satisfait : demander des révisions dans le cadre prévu par le service, prolonger le délai de livraison pour permettre plus d'améliorations, ou ouvrir un litige via notre Centre de Résolution si vous estimez que le travail ne correspond pas du tout à ce qui était promis. Les remboursements sont possibles dans certaines situations : si le freelance ne peut pas livrer, si après plusieurs révisions le résultat ne correspond toujours pas à la description du service, ou en cas de problème majeur. Chaque demande est évaluée individuellement par notre équipe, qui examine les échanges, les livrables et les termes du service pour prendre une décision équitable."
  },
  {
    question: "Comment puis-je suivre l'avancement de ma commande ?",
    answer: "Vous pouvez suivre l'avancement de toutes vos commandes depuis la section 'Mes commandes' de votre tableau de bord. Pour chaque commande, vous verrez son statut actuel (en cours, en révision, livrée, etc.), les délais prévus, et un historique des échanges avec le freelance. La plateforme vous envoie également des notifications par email à chaque étape importante : confirmation de commande, messages du freelance, livraison, etc. Si vous avez besoin d'une mise à jour plus détaillée sur l'avancement, n'hésitez pas à contacter directement le freelance via la messagerie intégrée à la commande."
  }
];

// Autres catégories d'aide
const autresCategories = [
  {
    title: "Débuter sur NionFar",
    slug: "debuter",
    icon: <FiArrowUpRight className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Paiements et Facturation",
    slug: "paiements",
    icon: <FiDollarSign className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Sécurité et Confidentialité",
    slug: "securite",
    icon: <FiShield className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Guide pour les Freelances",
    slug: "freelances",
    icon: <FiUsers className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Guide pour les Clients",
    slug: "clients",
    icon: <FiGlobe className="text-indigo-500 mr-2" size={20} />
  }
];

export default CommandesServices;