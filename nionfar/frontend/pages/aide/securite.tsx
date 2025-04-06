import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, 
  FiChevronRight, 
  FiChevronDown, 
  FiChevronUp, 
  FiShield, 
  FiLock,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiKey,
  FiHelpCircle,
  FiUserCheck,
  FiRefreshCw,
  FiGlobe,
  FiDatabase,
  FiClock,
  FiFileText,
  FiSettings,
  FiDollarSign,
  FiUsers
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';

const SecuriteConfidentialite: NextPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Sécurité et Confidentialité | Centre d'aide NionFar</title>
        <meta 
          name="description" 
          content="Découvrez comment NionFar protège vos données personnelles et sécurise vos transactions. Conseils et bonnes pratiques pour protéger votre compte." 
        />
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
            
            {/* Symboles de sécurité décoratifs */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiLock />
            </div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiShield />
            </div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiKey />
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
                <span className="text-white font-medium">Sécurité et Confidentialité</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Sécurité et Confidentialité
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Comment nous protégeons vos données et assurons la sécurité de vos transactions
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#protection-compte"
                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                  >
                    Protéger votre compte
                    <FiArrowRight className="ml-2" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#politique"
                    className="px-8 py-4 bg-indigo-800/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-600/30 hover:bg-indigo-800/40 transition-all"
                  >
                    Politique de confidentialité
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

        {/* Introduction et notre engagement */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                  Chez NionFar, la sécurité de vos données et la confidentialité de vos informations personnelles sont nos priorités absolues. Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger votre compte et vos transactions, tout en vous offrant un environnement de travail sûr et transparent.
                </p>
                
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100 shadow-sm mb-12">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 shadow-sm">
                      <FiShield className="text-indigo-600" size={24} />
                    </div>
                    Notre engagement envers votre sécurité
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                        <FiLock className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium mb-1">Cryptage SSL 256 bits</h3>
                        <p className="text-gray-600 text-sm">Pour toutes les transactions et communications</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                        <FiUserCheck className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium mb-1">Authentification à deux facteurs</h3>
                        <p className="text-gray-600 text-sm">Protection supplémentaire pour votre compte</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                        <FiShield className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium mb-1">Système d'escrow</h3>
                        <p className="text-gray-600 text-sm">Protection de toutes vos transactions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                        <FiFileText className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium mb-1">Conformité réglementaire</h3>
                        <p className="text-gray-600 text-sm">Respect des normes de protection des données</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm md:col-span-2">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                        <FiEye className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium mb-1">Surveillance continue</h3>
                        <p className="text-gray-600 text-sm">Détection et prévention des activités frauduleuses en temps réel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Protection de compte */}
        <section id="protection-compte" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiKey className="mr-2" />
                SÉCURITÉ DU COMPTE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Protection de votre compte</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conseils pratiques pour renforcer la sécurité de votre compte NionFar
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {conseilsSecurite.map((conseil, index) => (
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

        {/* Infographie de sécurité */}
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment nous protégeons vos données</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      Un aperçu des mesures de sécurité que nous déployons pour garantir la sécurité de vos informations
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                    {/* Étape 1 : Cryptage */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiLock size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Cryptage avancé</h3>
                      <p className="text-gray-600">Toutes les données sont cryptées en transit et au repos avec les algorithmes les plus récents</p>
                    </div>
                    
                    <div className="hidden md:block text-indigo-300">
                      <FiArrowRight size={24} />
                    </div>
                    
                    {/* Étape 2 : Surveillance */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiEye size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Surveillance 24/7</h3>
                      <p className="text-gray-600">Nos systèmes analysent continuellement les activités pour détecter toute menace potentielle</p>
                    </div>
                    
                    <div className="hidden md:block text-indigo-300">
                      <FiArrowRight size={24} />
                    </div>
                    
                    {/* Étape 3 : Protection */}
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiShield size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Protection proactive</h3>
                      <p className="text-gray-600">Mise en place de mesures préventives et mises à jour régulières pour contrer les nouvelles menaces</p>
                    </div>
                  </div>
                  
                  <div className="mt-12 text-center">
                    <a 
                      href="/securite-details" 
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                    >
                      En savoir plus sur notre infrastructure de sécurité
                      <FiArrowRight className="ml-2" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Politique de confidentialité */}
        <section id="politique" className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiFileText className="mr-2" />
                CONFIDENTIALITÉ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Notre politique de confidentialité</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprendre comment nous collectons, utilisons et protégeons vos données
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {politiqueConfidentialite.map((section, index) => (
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
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex items-center">
                        <div className="mr-5 bg-indigo-100 text-indigo-600 rounded-xl p-3">
                          {privacyIcons[index % privacyIcons.length]}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {section.title}
                        </h3>
                      </div>
                      <div className="text-indigo-600 p-2 bg-indigo-50 rounded-full">
                        {openFaq === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2">
                            <div className="prose prose-indigo max-w-none text-gray-600">
                              {section.content}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <a 
                  href="/politique-confidentialite" 
                  className="inline-flex items-center px-6 py-3 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Consulter notre politique de confidentialité complète
                  <FiArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Signaler un problème */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-12 text-white relative overflow-hidden">
                  {/* Éléments décoratifs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full -mb-16 -ml-16"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Signaler un problème de sécurité</h2>
                    <p className="mb-8 text-indigo-100 text-lg">
                      Si vous suspectez une activité frauduleuse ou un problème de sécurité, veuillez nous contacter immédiatement. Votre vigilance nous aide à maintenir la plateforme sécurisée pour tous.
                    </p>
                    <a 
                      href="/contact" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 group"
                    >
                      Contacter notre équipe sécurité
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
        <section className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Sécurisez votre expérience sur NionFar
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Protégez votre compte dès maintenant en activant l'authentification à deux facteurs et en suivant nos conseils de sécurité.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="/compte/securite"
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center"
                  >
                    Activer l'authentification 2FA
                    <FiArrowRight className="ml-2" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="/aide/articles/securite-conseils"
                    className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium border border-indigo-200 hover:border-indigo-300 transition-all"
                  >
                    Conseils de sécurité avancés
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

// Tableau pour les icônes des sections de confidentialité
const privacyIcons = [
  <FiDatabase size={24} />,
  <FiGlobe size={24} />,
  <FiFileText size={24} />,
  <FiUserCheck size={24} />,
  <FiClock size={24} />
];

// Conseils de sécurité
const conseilsSecurite = [
  {
    title: "Utilisez un mot de passe fort",
    icon: <FiKey size={28} />,
    description: "Créez un mot de passe unique avec au moins 12 caractères, incluant des lettres majuscules, minuscules, des chiffres et des symboles. Évitez d'utiliser des informations personnelles."
  },
  {
    title: "Activez l'authentification à deux facteurs",
    icon: <FiShield size={28} />,
    description: "Cette couche de sécurité supplémentaire exige une confirmation via votre téléphone ou email en plus de votre mot de passe, rendant votre compte beaucoup plus sécurisé."
  },
  {
    title: "Vérifiez régulièrement votre activité",
    icon: <FiEye size={28} />,
    description: "Consultez régulièrement l'historique des connexions à votre compte pour détecter toute activité suspecte. Signalez immédiatement tout accès non autorisé."
  },
  {
    title: "Méfiez-vous du phishing",
    icon: <FiAlertTriangle size={28} />,
    description: "NionFar ne vous demandera jamais votre mot de passe par email ou téléphone. Vérifiez toujours que vous êtes sur le site officiel avant de vous connecter."
  },
  {
    title: "Gardez vos appareils sécurisés",
    icon: <FiLock size={28} />,
    description: "Assurez-vous que votre ordinateur et votre téléphone disposent des dernières mises à jour de sécurité et utilisez un logiciel antivirus réputé."
  },
  {
    title: "Déconnectez-vous sur les appareils partagés",
    icon: <FiRefreshCw size={28} />,
    description: "Si vous utilisez un ordinateur public ou partagé, assurez-vous de vous déconnecter complètement de votre compte NionFar une fois votre session terminée."
  }
];

// Politique de confidentialité
const politiqueConfidentialite = [
  {
    title: "Données que nous collectons",
    content: (
      <>
        <p className="mb-4">
          Pour offrir nos services, nous collectons certaines informations personnelles, notamment :
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2 bg-gray-50 p-4 rounded-xl">
          <li className="text-gray-700">Informations de base (nom, prénom, adresse email)</li>
          <li className="text-gray-700">Informations de profil (photo, compétences, parcours professionnel)</li>
          <li className="text-gray-700">Informations de paiement (selon les méthodes de paiement utilisées)</li>
          <li className="text-gray-700">Données de navigation et d'utilisation du service</li>
          <li className="text-gray-700">Communications avec d'autres utilisateurs et notre équipe</li>
        </ul>
        <p>
          Nous ne collectons que les informations nécessaires pour fournir, améliorer et sécuriser nos services.
        </p>
      </>
    )
  },
  {
    title: "Comment nous utilisons vos données",
    content: (
      <>
        <p className="mb-4">
          Les données que nous collectons sont utilisées pour :
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2 bg-gray-50 p-4 rounded-xl">
          <li className="text-gray-700">Fournir et personnaliser nos services</li>
          <li className="text-gray-700">Traiter les transactions et paiements</li>
          <li className="text-gray-700">Assurer la sécurité de la plateforme et prévenir la fraude</li>
          <li className="text-gray-700">Améliorer nos services et développer de nouvelles fonctionnalités</li>
          <li className="text-gray-700">Communiquer avec vous concernant votre compte ou nos services</li>
          <li className="text-gray-700">Se conformer aux obligations légales</li>
        </ul>
        <p>
          Nous n'utilisons jamais vos données à des fins non spécifiées sans votre consentement explicite.
        </p>
      </>
    )
  },
  {
    title: "Partage et divulgation des données",
    content: (
      <>
        <p className="mb-4">
          NionFar ne vend jamais vos données personnelles à des tiers. Cependant, nous pouvons partager certaines informations dans les cas suivants :
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2 bg-gray-50 p-4 rounded-xl">
          <li className="text-gray-700">Avec d'autres utilisateurs de la plateforme (comme indiqué dans votre profil public)</li>
          <li className="text-gray-700">Avec nos prestataires de services (traitement des paiements, sécurité, hébergement)</li>
          <li className="text-gray-700">Pour se conformer à la loi ou en réponse à une procédure judiciaire</li>
          <li className="text-gray-700">Pour protéger les droits, la propriété ou la sécurité de NionFar, de nos utilisateurs ou du public</li>
        </ul>
        <p>
          Tout tiers avec qui nous partageons des données est tenu par contrat de maintenir la confidentialité et la sécurité de vos informations.
        </p>
      </>
    )
  },
  {
    title: "Vos droits et choix",
    content: (
      <>
        <p className="mb-4">
          Vous disposez de plusieurs droits concernant vos données personnelles :
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2 bg-gray-50 p-4 rounded-xl">
          <li className="text-gray-700">Accéder à vos données personnelles et en obtenir une copie</li>
          <li className="text-gray-700">Mettre à jour ou corriger vos données personnelles</li>
          <li className="text-gray-700">Demander la suppression de vos données (dans certaines circonstances)</li>
          <li className="text-gray-700">Vous opposer au traitement de vos données</li>
          <li className="text-gray-700">Retirer votre consentement (lorsque applicable)</li>
          <li className="text-gray-700">Limiter les communications marketing que vous recevez</li>
        </ul>
        <p>
          Pour exercer ces droits, connectez-vous à votre compte NionFar et accédez aux paramètres de confidentialité, ou contactez notre responsable de la protection des données à <strong>privacy@nionfar.sn</strong>.
        </p>
      </>
    )
  },
  {
    title: "Conservation des données",
    content: (
      <>
        <p className="mb-4">
          Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services ou respecter nos obligations légales. Plus précisément :
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2 bg-gray-50 p-4 rounded-xl">
          <li className="text-gray-700">Les données de compte sont conservées tant que votre compte est actif</li>
          <li className="text-gray-700">Après la suppression de votre compte, certaines données peuvent être conservées pendant une période limitée pour des raisons légales ou administratives</li>
          <li className="text-gray-700">Les données des transactions sont conservées conformément aux obligations légales et fiscales (généralement 10 ans)</li>
          <li className="text-gray-700">Les messages entre utilisateurs sont conservés pour faciliter la résolution des litiges</li>
        </ul>
        <p>
          Nous appliquons des politiques strictes de suppression des données lorsqu'elles ne sont plus nécessaires.
        </p>
      </>
    )
  }
];

// Autres catégories d'aide
const autresCategories = [
  {
    title: "Débuter sur NionFar",
    slug: "debuter",
    icon: <FiSettings className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Paiements et Facturation",
    slug: "paiements",
    icon: <FiDollarSign className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Commandes et Services",
    slug: "commandes",
    icon: <FiFileText className="text-indigo-500 mr-2" size={20} />
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

export default SecuriteConfidentialite;