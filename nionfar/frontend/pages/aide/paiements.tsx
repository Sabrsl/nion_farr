import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, 
  FiChevronRight, 
  FiChevronDown, 
  FiChevronUp, 
  FiDollarSign, 
  FiCreditCard,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiHelpCircle,
  FiLock,
  FiClock,
  FiRefreshCw,
  FiGlobe,
  FiTarget,
  FiSettings,
  FiUsers
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';

const PaiementsFacturation: NextPage = () => {
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const toggleArticle = (index: number) => {
    setOpenArticle(openArticle === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Paiements et Facturation | Centre d'aide NionFar</title>
        <meta 
          name="description" 
          content="Tout savoir sur les paiements, les méthodes de paiement acceptées, la facturation et la gestion des transactions sur NionFar." 
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
            
            {/* Symboles monétaires décoratifs */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiDollarSign />
            </div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiCreditCard />
            </div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiShield />
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
                <span className="text-white font-medium">Paiements et Facturation</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Paiements et Facturation
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Tout ce que vous devez savoir sur les paiements, les méthodes de paiement acceptées et la gestion de vos transactions.
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#methodes-paiement"
                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                  >
                    Méthodes de paiement
                    <FiArrowRight className="ml-2" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="/aide/faq"
                    className="px-8 py-4 bg-indigo-800/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-600/30 hover:bg-indigo-800/40 transition-all"
                  >
                    Consulter la FAQ des paiements
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

        {/* Introduction et aperçu */}
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
                  NionFar offre un système de paiement sécurisé et transparent pour faciliter les transactions entre clients et freelances. Nous proposons plusieurs méthodes de paiement adaptées au marché sénégalais et international, et nous garantissons la sécurité de vos fonds grâce à notre système de paiement sécurisé.
                </p>
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100 shadow-sm mb-12">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 shadow-sm">
                      <FiShield className="text-indigo-600" size={24} />
                    </div>
                    Notre système de paiement sécurisé
                  </h2>
                  <p className="text-gray-700 mb-6">
                    NionFar utilise un système de paiement sécurisé (escrow) qui protège à la fois les clients et les freelances :
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 mt-1 font-semibold shadow-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Paiement sécurisé</h3>
                        <p className="text-gray-700">Le client paie pour un service, mais l'argent est d'abord conservé par NionFar.</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 mt-1 font-semibold shadow-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Réalisation du travail</h3>
                        <p className="text-gray-700">Le freelance effectue le travail demandé et le livre au client.</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 mt-1 font-semibold shadow-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Approbation et libération</h3>
                        <p className="text-gray-700">Une fois que le client approuve le travail, les fonds sont libérés au freelance.</p>
                      </div>
                    </div>
                    <div className="flex items-start bg-white p-5 rounded-xl shadow-sm">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 mt-1 font-semibold shadow-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Médiation si nécessaire</h3>
                        <p className="text-gray-700">En cas de litige, notre équipe intervient pour trouver une solution équitable.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Méthodes de paiement */}
        <section id="methodes-paiement" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiCreditCard className="mr-2" />
                OPTIONS DE PAIEMENT
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Méthodes de paiement acceptées</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez toutes les options de paiement disponibles sur NionFar
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {methodesPaiement.map((methode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-full border border-gray-100 group-hover:border-indigo-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-200 transition-colors shadow-sm">
                      {methode.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {methode.name}
                    </h3>
                    <p className="text-gray-600 mb-5">{methode.description}</p>
                    {methode.limits && (
                      <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-600 flex items-start">
                        <FiAlertCircle className="text-indigo-500 mr-2 mt-0.5" size={16} />
                        <span><span className="font-medium text-gray-700">Limites :</span> {methode.limits}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ sur les paiements */}
        <section id="faq" className="py-20">
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes sur les paiements</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trouvez des réponses aux questions les plus courantes concernant les paiements et la facturation
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqsPaiement.map((faq, index) => (
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
                      onClick={() => toggleArticle(index)}
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
                        {openArticle === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openArticle === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2">
                            <div className="prose prose-indigo max-w-none text-gray-600">
                              {faq.answer}
                            </div>
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

        {/* Guide des frais */}
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
                <FiFileText className="mr-2" />
                TARIFICATION
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Guide des frais</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprendre les différents frais appliqués sur NionFar
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                        <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-indigo-800">
                          Type de frais
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-indigo-800">
                          Montant
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-indigo-800">
                          Applicable à
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-indigo-800">
                          Détails
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {fraisTable.map((frais, index) => (
                        <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                            {frais.type}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                            <span className="font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                              {frais.montant}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                            {frais.applicable}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700">
                            {frais.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-white px-8 py-4 border-t border-indigo-100">
                  <p className="text-sm text-indigo-700 flex items-start">
                    <FiAlertCircle className="mt-0.5 mr-3 flex-shrink-0" /> 
                    <span>Les frais peuvent être modifiés. Consultez nos conditions générales pour plus de détails.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Avantages du système */}
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
                <FiCheckCircle className="mr-2" />
                AVANTAGES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir notre système de paiement</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des avantages qui garantissent votre tranquillité d'esprit
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {avantagesSystem.map((avantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-md h-full border border-indigo-100">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                      {avantage.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {avantage.title}
                    </h3>
                    <p className="text-gray-600">
                      {avantage.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Besoin d'aide supplémentaire */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-12 text-white relative overflow-hidden">
                  {/* Éléments décoratifs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full -mb-16 -ml-16"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Vous avez un problème de paiement ?</h2>
                    <p className="mb-8 text-indigo-100 text-lg">
                      Notre équipe de support est disponible pour vous aider à résoudre rapidement tout problème lié aux paiements.
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
        <section className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Prêt à effectuer votre première transaction ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Rejoignez NionFar et découvrez la simplicité et la sécurité de notre système de paiement pour vos projets.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a 
                  href="/explorer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center"
                >
                  Explorer les services
                  <FiArrowRight className="ml-2" />
                </motion.a>
                <motion.a 
                  href="/aide/securite"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium border border-indigo-200 hover:border-indigo-300 transition-all"
                >
                  En savoir plus sur la sécurité
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

// Tableau pour les icônes des FAQs
const faqIcons = [
  <FiDollarSign size={24} />,
  <FiClock size={24} />,
  <FiRefreshCw size={24} />,
  <FiFileText size={24} />,
  <FiCreditCard size={24} />
];

// Avantages du système de paiement
const avantagesSystem = [
  {
    title: "Sécurité garantie",
    icon: <FiLock size={24} />,
    description: "Votre argent est sécurisé dans notre système et n'est libéré que lorsque vous êtes satisfait du travail livré."
  },
  {
    title: "Transparence totale",
    icon: <FiShield size={24} />,
    description: "Tous les frais sont clairement indiqués avant que vous ne finalisiez votre transaction, sans surprises."
  },
  {
    title: "Options flexibles",
    icon: <FiSettings size={24} />,
    description: "Multiples méthodes de paiement adaptées au marché local et international pour votre confort."
  },
  {
    title: "Délais optimisés",
    icon: <FiClock size={24} />,
    description: "Traitement rapide des paiements et des retraits pour ne pas ralentir vos projets."
  },
  {
    title: "Médiation en cas de litige",
    icon: <FiRefreshCw size={24} />,
    description: "Notre équipe intervient rapidement pour résoudre les problèmes entre clients et freelances de manière équitable."
  },
  {
    title: "Facturation automatisée",
    icon: <FiFileText size={24} />,
    description: "Génération automatique de factures conformes pour toutes vos transactions sur la plateforme."
  }
];

// Méthodes de paiement
const methodesPaiement = [
  {
    name: "Cartes bancaires",
    icon: <FiCreditCard size={28} />,
    description: "Visa, Mastercard et autres cartes internationales. Paiement sécurisé via un système de cryptage SSL.",
    limits: "Aucune limite de montant."
  },
  {
    name: "Orange Money",
    icon: <FiDollarSign size={28} />,
    description: "Paiement mobile via votre compte Orange Money. Transaction instantanée et sécurisée.",
    limits: "Limite de 2 000 000 FCFA par transaction."
  },
  {
    name: "Wave",
    icon: <FiDollarSign size={28} />,
    description: "Paiement mobile via l'application Wave. Frais de transaction réduits et transfert instantané.",
    limits: "Limite de 1 000 000 FCFA par transaction."
  },
  {
    name: "Free Money",
    icon: <FiDollarSign size={28} />,
    description: "Paiement mobile via votre compte Free Money. Solution simple pour les utilisateurs Free.",
    limits: "Limite de 1 000 000 FCFA par transaction."
  },
  {
    name: "PayPal",
    icon: <FiGlobe size={28} />,
    description: "Paiement sécurisé via votre compte PayPal. Idéal pour les clients internationaux.",
    limits: "Soumis aux limites PayPal standard."
  },
  {
    name: "Virement bancaire",
    icon: <FiFileText size={28} />,
    description: "Pour les transactions importantes. Délai de traitement de 2 à 3 jours ouvrables.",
    limits: "Minimum de 500 000 FCFA."
  }
];

// FAQ sur les paiements
const faqsPaiement = [
  {
    question: "Comment savoir si mon paiement a bien été effectué ?",
    answer: (
      <>
        <p className="mb-4">
          Après avoir effectué un paiement sur NionFar, vous recevrez immédiatement une confirmation par email. Vous pouvez également vérifier le statut de votre paiement dans votre tableau de bord sous l'onglet "Transactions".
        </p>
        <p>
          Si vous voyez le statut "Paiement confirmé", cela signifie que votre paiement a bien été reçu et que les fonds sont sécurisés dans notre système d'escrow en attendant la livraison du service.
        </p>
      </>
    )
  },
  {
    question: "Quand le freelance reçoit-il son paiement ?",
    answer: (
      <>
        <p className="mb-4">
          Le freelance reçoit son paiement uniquement lorsque vous approuvez la livraison du service. Cette mesure est en place pour vous protéger et garantir que vous êtes satisfait du travail avant que le paiement ne soit libéré.
        </p>
        <p className="mb-4">
          Une fois que vous approuvez la livraison, le freelance reçoit son paiement dans un délai de 24 à 48 heures, selon la méthode de paiement utilisée.
        </p>
        <p>
          Si vous n'approuvez pas ou ne rejetez pas la livraison dans un délai de 14 jours, le paiement est automatiquement libéré au freelance, sauf si un litige est en cours.
        </p>
      </>
    )
  },
  {
    question: "Que se passe-t-il en cas de litige sur un paiement ?",
    answer: (
      <>
        <p className="mb-4">
          En cas de litige concernant un paiement ou une livraison, NionFar propose un processus de résolution de litige :
        </p>
        <div className="bg-gray-50 p-6 rounded-xl mb-4">
          <ol className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                1
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Essayez d'abord de résoudre le problème directement avec l'autre partie via notre système de messagerie.</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                2
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Si aucune solution n'est trouvée, ouvrez un ticket de litige depuis votre tableau de bord.</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                3
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Notre équipe de médiation examinera le cas, les messages échangés et les travaux livrés.</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                4
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Une décision sera prise pour soit libérer le paiement au freelance, soit rembourser partiellement ou totalement le client.</span>
              </div>
            </li>
          </ol>
        </div>
        <p>
          Notre objectif est de trouver une solution équitable pour toutes les parties impliquées.
        </p>
      </>
    )
  },
  {
    question: "Comment obtenir une facture pour mes achats ?",
    answer: (
      <>
        <p className="mb-4">
          Toutes les transactions effectuées sur NionFar sont accompagnées d'une facture électronique. Vous pouvez accéder à vos factures de plusieurs façons :
        </p>
        <div className="bg-gray-50 p-6 rounded-xl mb-4">
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                <FiCheckCircle className="text-indigo-600" size={16} />
              </div>
              <span className="text-gray-800">Dans votre tableau de bord, sous l'onglet "Transactions" puis "Factures"</span>
            </li>
            <li className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                <FiCheckCircle className="text-indigo-600" size={16} />
              </div>
              <span className="text-gray-800">Dans les emails de confirmation de paiement que vous recevez après chaque transaction</span>
            </li>
            <li className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                <FiCheckCircle className="text-indigo-600" size={16} />
              </div>
              <span className="text-gray-800">En cliquant sur "Télécharger la facture" dans les détails de chaque commande</span>
            </li>
          </ul>
        </div>
        <p>
          Toutes nos factures contiennent les informations nécessaires pour votre comptabilité et sont conformes à la réglementation sénégalaise.
        </p>
      </>
    )
  },
  {
    question: "Puis-je payer en plusieurs fois ?",
    answer: (
      <>
        <p className="mb-4">
          Pour les projets importants, NionFar propose une option de paiement échelonné. Cette fonctionnalité permet de diviser le paiement en plusieurs étapes, chacune correspondant à une phase du projet.
        </p>
        <p className="mb-4">
          Le paiement échelonné doit être configuré au moment de la commande et accepté par le freelance. Voici comment cela fonctionne :
        </p>
        <div className="bg-gray-50 p-6 rounded-xl mb-4">
          <ol className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                1
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Définissez les différentes étapes du projet avec le freelance</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                2
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Pour chaque étape, un paiement spécifique est sécurisé dans notre système</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                3
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Lorsqu'une étape est terminée et approuvée, le paiement correspondant est libéré</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold shadow-sm">
                4
              </div>
              <div className="pt-0.5">
                <span className="text-gray-800">Le projet progresse ainsi d'étape en étape jusqu'à sa finalisation</span>
              </div>
            </li>
          </ol>
        </div>
        <p>
          Cette option est particulièrement recommandée pour les projets dont le montant dépasse 500 000 FCFA ou dont la durée est supérieure à un mois.
        </p>
      </>
    )
  }
];

// Tableau des frais
const fraisTable = [
  {
    type: "Commission freelance",
    montant: "15%",
    applicable: "Freelances",
    details: "Appliquée sur chaque transaction réussie. Déduite automatiquement du montant reçu par le freelance."
  },
  {
    type: "Frais de traitement",
    montant: "2-3%",
    applicable: "Clients",
    details: "Varient selon la méthode de paiement choisie. Ajoutés au montant total lors du paiement."
  },
  {
    type: "Frais de retrait",
    montant: "Varie",
    applicable: "Freelances",
    details: "Dépendent de la méthode de retrait choisie. Consultez la page des retraits pour plus de détails."
  },
  {
    type: "Frais de services premium",
    montant: "Variable",
    applicable: "Freelances",
    details: "Pour les services de mise en avant et options promotionnelles. Facturés séparément."
  },
  {
    type: "Frais de conversion de devises",
    montant: "1.5%",
    applicable: "Tous",
    details: "Appliqués lors de conversions entre devises étrangères et FCFA."
  }
];

// Autres catégories d'aide
const autresCategories = [
  {
    title: "Débuter sur NionFar",
    slug: "debuter",
    icon: <FiTarget className="text-indigo-500 mr-2" size={20} />
  },
  {
    title: "Sécurité et Confidentialité",
    slug: "securite",
    icon: <FiShield className="text-indigo-500 mr-2" size={20} />
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
    icon: <FiSettings className="text-indigo-500 mr-2" size={20} />
  }
];

export default PaiementsFacturation;