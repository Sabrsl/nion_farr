import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiChevronRight, FiChevronDown, FiChevronUp, 
  FiSearch, FiMessageSquare, FiShield, FiCreditCard, FiCheckCircle,
  FiUsers, FiFileText, FiTarget, FiClock, FiDollarSign,
  FiPackage, FiGlobe, FiZap, FiEdit, FiStar,
  FiAlertCircle, FiHelpCircle, FiTrendingUp, FiSettings
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';

const GuideClients: NextPage = () => {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Guide pour les Clients | Centre d'aide NionFar</title>
        <meta name="description" content="Découvrez comment trouver les meilleurs freelances sur NionFar. Guide complet pour réussir vos projets, gérer vos commandes et collaborer efficacement." />
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
            
            {/* Symboles clients décoratifs */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiUsers />
            </div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiSearch />
            </div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 text-white opacity-10 flex items-center justify-center text-2xl">
              <FiPackage />
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
                <span className="text-white font-medium">Guide pour les Clients</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Guide pour les Clients
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Comment trouver les meilleurs talents et réussir vos projets sur NionFar
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a 
                  href="#trouver-freelance"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                >
                  Trouver un freelance
                  <FiArrowRight className="ml-2" />
                </motion.a>
                <motion.a 
                  href="#securite"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-indigo-700/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-500/30 hover:bg-indigo-700/40 transition-all"
                >
                  Sécurité et garanties
                </motion.a>
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
                  <h2 className="text-2xl font-semibold text-gray-900">Bienvenue sur le guide client</h2>
                </div>
                
                <div className="prose prose-lg prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Bienvenue dans le guide complet pour les clients de NionFar. Notre plateforme vous connecte avec les meilleurs freelances du Sénégal et d'ailleurs, prêts à mettre leur expertise au service de vos projets.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Que vous cherchiez un développeur web, un designer graphique, un rédacteur ou tout autre talent, ce guide vous aidera à naviguer sur NionFar, à trouver le freelance idéal et à gérer efficacement vos projets du début à la fin.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center bg-indigo-50 p-4 rounded-xl">
                  <FiAlertCircle className="text-indigo-600 mr-3 flex-shrink-0" size={20} />
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">À savoir</span> : Sur NionFar, vous ne payez que pour les résultats qui vous satisfont grâce à notre système de paiement sécurisé.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Avantages d'utiliser NionFar */}
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
                <div className="text-xl font-bold text-gray-900 mb-2">Talents vérifiés</div>
                <div className="text-gray-600">Freelances qualifiés et sélectionnés</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiShield size={24} />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">Paiement sécurisé</div>
                <div className="text-gray-600">Protection par système d'escrow</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiMessageSquare size={24} />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">Support dédié</div>
                <div className="text-gray-600">Assistance 7j/7 pour vos projets</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trouver le bon freelance */}
        <section id="trouver-freelance" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiSearch className="mr-2" />
                TROUVER UN EXPERT
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trouver le bon freelance</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comment identifier le talent idéal pour votre projet
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {etapesTrouverFreelance.map((etape, index) => (
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
                      {etape.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {etape.title}
                    </h3>
                    <p className="text-gray-600">{etape.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Préparer votre projet */}
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
                <FiFileText className="mr-2" />
                DÉFINITION DU PROJET
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Préparer votre projet</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les éléments essentiels pour un brief de projet efficace
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="prose prose-lg prose-indigo max-w-none"
                >
                  <p className="text-lg text-gray-700 mb-8">
                    Un brief de projet bien défini est la clé du succès de votre collaboration avec un freelance. Voici les informations essentielles à inclure :
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {elementsBrief.map((element, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-indigo-50 rounded-xl p-5 flex items-start"
                      >
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600 flex-shrink-0 mt-1">
                          <FiCheckCircle size={16} />
                        </div>
                        <div>
                          <h3 className="font-medium text-indigo-800 mb-1 text-lg">{element.title}</h3>
                          <p className="text-gray-700 text-base">{element.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-start">
                    <FiAlertCircle className="text-indigo-600 mt-1 mr-4 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-indigo-900 font-medium text-lg mb-1">Conseil professionnel</p>
                      <p className="text-indigo-700 text-base">
                        Plus votre brief est précis, plus le freelance pourra vous fournir un résultat correspondant à vos attentes. N'hésitez pas à joindre des exemples ou des références pour illustrer vos idées.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Cycle du projet */}
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
                <FiClock className="mr-2" />
                PROCESSUS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Le cycle de votre projet</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comment se déroule un projet réussi de bout en bout
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-10 border border-indigo-100 shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  {/* Étape 1 */}
                  <div className="flex flex-col items-center text-center max-w-xs">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <FiFileText size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Briefing</h3>
                    <p className="text-gray-600">Définissez clairement vos besoins et attentes</p>
                  </div>
                  
                  <div className="hidden md:block text-indigo-300">
                    <FiArrowRight size={24} />
                  </div>
                  
                  {/* Étape 2 */}
                  <div className="flex flex-col items-center text-center max-w-xs">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <FiEdit size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Réalisation</h3>
                    <p className="text-gray-600">Le freelance travaille sur votre projet</p>
                  </div>
                  
                  <div className="hidden md:block text-indigo-300">
                    <FiArrowRight size={24} />
                  </div>
                  
                  {/* Étape 3 */}
                  <div className="flex flex-col items-center text-center max-w-xs">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <FiCheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Validation</h3>
                    <p className="text-gray-600">Examinez, demandez des révisions si nécessaire, et approuvez</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Questions fréquentes */}
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
                <FiHelpCircle className="mr-2" />
                QUESTIONS FRÉQUENTES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Réponses aux questions les plus courantes des clients
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqsClients.map((faq, index) => (
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

        {/* Sécurité & garanties */}
        <section id="securite" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiShield className="mr-2" />
                PROTECTIONS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sécurité et garanties</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comment NionFar protège vos projets et transactions
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {garanties.map((garantie, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-indigo-200"
                  >
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mr-6 shadow-sm">
                        {garantie.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{garantie.title}</h3>
                        <p className="text-gray-600">{garantie.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-indigo-600 rounded-2xl shadow-lg text-white text-center">
                <h3 className="text-xl font-semibold mb-3">Protection Acheteur NionFar</h3>
                <p className="mb-4 text-indigo-100">Tous vos paiements sont couverts par notre garantie de protection</p>
                <Link 
                  href="/aide/protection-acheteur" 
                  className="inline-flex items-center px-5 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  En savoir plus
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à démarrer votre projet ?</h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                Des milliers de freelances talentueux attendent de vous aider à concrétiser vos idées
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a 
                  href="/services" 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                >
                  Explorer les services
                  <FiArrowRight className="ml-2" />
                </motion.a>
                <motion.a 
                  href="/aide/rediger-brief" 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-indigo-700/30 backdrop-blur-sm text-white rounded-xl font-medium border border-indigo-500/30 hover:bg-indigo-700/40 transition-all"
                >
                  Guide pour rédiger un brief
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

// Icônes pour les FAQs
const faqIcons = [
  <FiCheckCircle size={24} />,
  <FiEdit size={24} />,
  <FiCreditCard size={24} />,
  <FiSettings size={24} />,
  <FiShield size={24} />,
  <FiUsers size={24} />
];

// Étapes pour trouver un freelance
const etapesTrouverFreelance = [
  {
    title: "Définir vos besoins",
    description: "Déterminez précisément ce que vous cherchez : compétences spécifiques, niveau d'expérience, budget et délais. Plus vos critères sont clairs, plus votre recherche sera efficace.",
    icon: <FiTarget size={28} />
  },
  {
    title: "Parcourir les profils",
    description: "Utilisez notre moteur de recherche avec filtres pour trouver des freelances correspondant à vos critères. Examinez leurs portfolios, compétences et évaluations des clients précédents.",
    icon: <FiSearch size={28} />
  },
  {
    title: "Contacter plusieurs freelances",
    description: "Ne vous limitez pas à un seul freelance. Contactez-en plusieurs pour comparer leurs approches, leurs idées et leurs devis pour votre projet spécifique.",
    icon: <FiMessageSquare size={28} />
  },
  {
    title: "Évaluer les propositions",
    description: "Analysez les réponses en considérant le rapport qualité-prix, la compréhension de votre projet, les délais proposés et la qualité de la communication.",
    icon: <FiStar size={28} />
  },
  {
    title: "Passer commande en toute sécurité",
    description: "Une fois votre choix fait, passez commande via la plateforme NionFar. Votre paiement est sécurisé et n'est versé au freelance qu'une fois le travail livré et approuvé.",
    icon: <FiCreditCard size={28} />
  },
  {
    title: "Collaborer efficacement",
    description: "Maintenez une communication claire tout au long du projet. Fournissez des retours constructifs et précis pour obtenir le meilleur résultat possible.",
    icon: <FiUsers size={28} />
  }
];

// Éléments d'un brief efficace
const elementsBrief = [
  {
    title: "Objectifs du projet",
    description: "Définissez clairement ce que vous souhaitez accomplir et pourquoi."
  },
  {
    title: "Public cible",
    description: "Précisez à qui s'adresse le résultat final (âge, centres d'intérêt, etc.)."
  },
  {
    title: "Spécifications techniques",
    description: "Formats, dimensions, compatibilités, plateformes ou supports concernés."
  },
  {
    title: "Références et exemples",
    description: "Partagez des exemples de ce que vous aimez pour illustrer vos attentes."
  },
  {
    title: "Délais et étapes",
    description: "Indiquez la date limite finale et les éventuelles échéances intermédiaires."
  },
  {
    title: "Budget",
    description: "Définissez votre fourchette budgétaire pour que le freelance puisse adapter sa proposition."
  }
];

// FAQs clients
const faqsClients = [
  {
    question: "Comment garantir la qualité du travail fourni ?",
    answer: "NionFar offre plusieurs niveaux de protection : vérification des freelances, système d'évaluations transparentes, et paiement sécurisé qui n'est débloqué qu'une fois que vous avez approuvé le travail. Vous pouvez également demander des révisions si le résultat ne correspond pas à vos attentes. Pour maximiser vos chances de satisfaction, nous vous recommandons de choisir des freelances bien notés, de fournir un brief détaillé, et de maintenir une communication régulière pendant la réalisation du projet."
  },
  {
    question: "Que faire si je ne suis pas satisfait du travail livré ?",
    answer: "Si vous n'êtes pas satisfait de la livraison, vous pouvez demander des révisions au freelance en précisant les modifications souhaitées. La plupart des commandes incluent un nombre défini de révisions. Si après ces révisions vous n'êtes toujours pas satisfait, vous pouvez ouvrir un litige via notre Centre de Résolution. Notre équipe analysera la situation, les livrables et les échanges pour trouver une solution équitable, qui peut inclure une livraison corrigée ou un remboursement partiel ou total selon les cas."
  },
  {
    question: "Comment fonctionne le système de paiement ?",
    answer: "Lorsque vous passez commande, le montant est débité mais conservé en sécurité par NionFar. Ce système d'entiercement (escrow) protège à la fois vous et le freelance. Le freelance commence le travail avec l'assurance que les fonds sont disponibles, et vous ne payez que lorsque vous êtes satisfait du résultat. Une fois le travail livré, vous avez un délai pour l'examiner et l'approuver. Après approbation, ou à l'expiration du délai d'examen, les fonds sont transférés au freelance. Nous acceptons les cartes bancaires, Orange Money, Wave, et autres méthodes de paiement locales."
  },
  {
    question: "Puis-je modifier ma commande après l'avoir passée ?",
    answer: "Oui, mais avec certaines conditions. Pour des modifications mineures (précisions sur le brief, petits ajustements), vous pouvez simplement les communiquer au freelance via la messagerie. Pour des changements significatifs (modifications du périmètre, ajout de fonctionnalités), vous devrez négocier avec le freelance, car cela peut impliquer un supplément ou une extension du délai. Dans ce cas, le freelance peut créer une commande complémentaire ou modifier la commande existante avec votre accord. Notez que les modifications importantes après le début du travail peuvent affecter les délais et le coût final."
  },
  {
    question: "Comment protéger ma propriété intellectuelle ?",
    answer: "Sur NionFar, les droits de propriété intellectuelle vous sont automatiquement transférés une fois le paiement finalisé, sauf accord contraire spécifié à l'avance. Pour une protection supplémentaire des informations sensibles, vous pouvez demander au freelance de signer un accord de confidentialité (NDA) avant de partager des détails confidentiels. Notre plateforme propose également un modèle de NDA que vous pouvez utiliser. Nous vous recommandons de clarifier les questions de propriété intellectuelle et d'utilisation future des livrables dans votre brief initial."
  },
  {
    question: "Est-il possible de travailler avec le même freelance pour des projets futurs ?",
    answer: "Absolument, et nous encourageons ces relations de long terme ! Une fois que vous avez trouvé un freelance avec qui vous travaillez bien, vous pouvez facilement lui confier d'autres projets en le contactant directement via NionFar. Vous pouvez également ajouter des freelances à vos favoris pour les retrouver facilement. Pour les collaborations régulières, certains freelances proposent des forfaits mensuels ou des tarifs préférentiels. Toutes les transactions doivent cependant continuer à passer par la plateforme pour maintenir les protections offertes par NionFar."
  }
];

// Garanties et protections
const garanties = [
  {
    title: "Paiement sécurisé",
    description: "Votre paiement est conservé en sécurité et n'est versé au freelance qu'après votre approbation du travail livré.",
    icon: <FiCreditCard size={28} />
  },
  {
    title: "Protection anti-fraude",
    description: "Tous les freelances sont vérifiés et nos systèmes de sécurité détectent les comportements suspects pour protéger votre investissement.",
    icon: <FiShield size={28} />
  },
  {
    title: "Assistance client dédiée",
    description: "Notre équipe de support est disponible 7j/7 pour vous aider en cas de problème ou pour répondre à vos questions.",
    icon: <FiMessageSquare size={28} />
  },
  {
    title: "Centre de résolution des litiges",
    description: "En cas de désaccord, notre équipe intervient comme médiateur impartial pour trouver une solution équitable.",
    icon: <FiCheckCircle size={28} />
  }
];

export default GuideClients;