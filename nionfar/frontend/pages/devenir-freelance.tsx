import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiStar, 
  FiTrendingUp, 
  FiShield, 
  FiDollarSign, 
  FiUsers, 
  FiAward,
  FiBriefcase,
  FiGlobe,
  FiMessageCircle,
  FiClock,
  FiChevronRight,
  FiMenu,
  FiX
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';

const DevenirFreelance: NextPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout
      title="Devenir Freelance | NionFar.sn - La Plateforme de Freelance au Sénégal"
      description="Rejoignez la communauté NionFar en tant que freelance et développez votre activité professionnelle. Accédez à des clients locaux et internationaux, sans intermédiaire."
    >
      <main>
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
              La plateforme des freelances au Sénégal
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
            >
              Valorisez vos talents et <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">boostez vos revenus</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-indigo-100 max-w-3xl mb-10"
            >
              Rejoignez la première plateforme de freelancing au Sénégal et proposez vos services
              à des milliers de clients locaux et internationaux, sans intermédiaire.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link 
                href="/register?type=freelance" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-sm sm:text-base"
              >
                Créer mon compte freelance
                <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
              >
                Contacter l'équipe
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 text-indigo-200 text-sm"
            >
              <p>Pas de frais d'inscription • Commission de 15% uniquement sur les projets réalisés • Paiements sécurisés</p>
            </motion.div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="relative z-20 -mt-16 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FiUsers className="w-8 h-8" />
                  </div>
                  <p className="text-4xl font-bold text-indigo-600 mb-2 flex items-center">
                    5000+
                    <span className="ml-2 text-base font-normal text-indigo-400">chaque mois</span>
                  </p>
                  <p className="text-gray-600">Clients actifs sur la plateforme</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FiDollarSign className="w-8 h-8" />
                  </div>
                  <p className="text-4xl font-bold text-indigo-600 mb-2 flex items-center">
                    10M+
                    <span className="ml-2 text-base font-normal text-indigo-400">FCFA</span>
                  </p>
                  <p className="text-gray-600">Payés aux freelances en 2023</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FiAward className="w-8 h-8" />
                  </div>
                  <p className="text-4xl font-bold text-indigo-600 mb-2 flex items-center">
                    98%
                    <span className="ml-2 text-base font-normal text-indigo-400">de satisfaction</span>
                  </p>
                  <p className="text-gray-600">Clients satisfaits de leurs freelances</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Join Section */}
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
                Avantages exclusifs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pourquoi rejoindre NionFar ?</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Nous vous offrons tous les outils et le soutien nécessaires pour réussir en tant que freelance
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Revenus garantis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recevez votre paiement dans les 24 heures après la validation de votre travail. Notre système d'escrow protège à la fois les freelances et les clients.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Visibilité maximale</h3>
                <p className="text-gray-600 leading-relaxed">
                  Notre algorithme de mise en relation met en avant vos services auprès des clients les plus pertinents pour augmenter vos chances de vente.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiShield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Sécurité assurée</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tous les paiements sont sécurisés et les conditions de service sont clairement définies pour vous protéger contre les litiges et les impayés.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Communauté active</h3>
                <p className="text-gray-600 leading-relaxed">
                  Rejoignez une communauté dynamique de freelances partout au Sénégal et profitez d'opportunités de collaboration, de networking et de formation continue.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiStar className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Programme d'excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Accédez à des avantages exclusifs, une visibilité accrue et des commissions réduites en rejoignant notre programme d'élite pour les freelances les plus performants.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-indigo-600 mb-6 bg-indigo-50 w-14 h-14 rounded-lg flex items-center justify-center">
                  <FiClock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Flexibilité totale</h3>
                <p className="text-gray-600 leading-relaxed">
                  Travaillez à votre rythme, choisissez vos projets et définissez vos propres tarifs selon votre expertise. Vous êtes le maître de votre emploi du temps.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
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
                Processus simple
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Rejoignez NionFar et commencez à gagner de l'argent en 3 étapes simples
              </p>
            </motion.div>

            <div className="relative">
              {/* Ligne de connexion */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-indigo-100 hidden md:block" style={{ transform: 'translateX(-50%)' }}></div>
              
              <div className="space-y-24">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-center relative"
                >
                  <div className="md:w-1/2 p-6 md:pr-16 md:text-right order-2 md:order-1">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">Créez votre profil de freelance</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Inscrivez-vous gratuitement, complétez votre profil avec vos compétences, expériences et exemples de travaux pour attirer les clients. Un profil complet augmente vos chances de succès.
                    </p>
                    <Link 
                      href="/register?type=freelance" 
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors group"
                    >
                      S'inscrire maintenant
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 mb-8 md:mb-0 z-10">
                    <div className="bg-indigo-600 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">1</div>
                  </div>
                  
                  <div className="md:w-1/2 p-6 md:pl-16 order-1 md:order-2">
                    <div className="bg-indigo-50 rounded-2xl p-6 shadow-md">
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Créez un compte en quelques minutes</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Ajoutez vos compétences et expériences</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Téléchargez des exemples de vos travaux</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-center relative"
                >
                  <div className="md:w-1/2 p-6 md:pl-16 order-2">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">Publiez vos services</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Créez des offres détaillées de vos services avec des prix clairs, des délais et des descriptions précises. Soyez transparent sur ce que vous proposez et les livrables attendus.
                    </p>
                    <Link 
                      href="/exemples-services" 
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors group"
                    >
                      Voir des exemples
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 mb-8 md:mb-0 z-10">
                    <div className="bg-indigo-600 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">2</div>
                  </div>
                  
                  <div className="md:w-1/2 p-6 md:pr-16 md:text-right order-1">
                    <div className="bg-indigo-50 rounded-2xl p-6 shadow-md">
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start md:justify-end">
                          <span className="md:order-2">Définissez vos tarifs et conditions</span>
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 md:ml-3 md:mr-0 flex-shrink-0 md:order-1" />
                        </li>
                        <li className="flex items-start md:justify-end">
                          <span className="md:order-2">Créez des offres attractives</span>
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 md:ml-3 md:mr-0 flex-shrink-0 md:order-1" />
                        </li>
                        <li className="flex items-start md:justify-end">
                          <span className="md:order-2">Précisez vos délais de livraison</span>
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 md:ml-3 md:mr-0 flex-shrink-0 md:order-1" />
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-center relative"
                >
                  <div className="md:w-1/2 p-6 md:pr-16 md:text-right order-2 md:order-1">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">Livrez & recevez votre paiement</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Réalisez les projets commandés par vos clients, livrez un travail de qualité et recevez votre paiement directement sur votre compte dans les 24 heures après validation.
                    </p>
                    <Link 
                      href="/paiements" 
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors group"
                    >
                      Méthodes de paiement
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 mb-8 md:mb-0 z-10">
                    <div className="bg-indigo-600 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">3</div>
                  </div>
                  
                  <div className="md:w-1/2 p-6 md:pl-16 order-1 md:order-2">
                    <div className="bg-indigo-50 rounded-2xl p-6 shadow-md">
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Communiquez efficacement avec vos clients</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Livrez un travail de qualité dans les délais</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                          <span>Recevez votre paiement par Orange Money, Wave ou virement bancaire</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
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
                Témoignages
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce que disent nos freelances</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez les expériences de ceux qui ont déjà rejoint notre communauté
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-indigo-100 rounded-full p-3 shadow-md">
                  <div className="flex text-indigo-500">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                </div>
                <div className="h-20 w-20 bg-indigo-100 rounded-full mb-6 overflow-hidden">
                  <img
                    src="/img/testimonial-fatou.jpg"
                    alt="Fatou Diop"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                    }}
                  />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Grâce à NionFar, j'ai pu développer mon activité de freelance et maintenant je travaille avec des clients du monde entier tout en restant au Sénégal."
                </p>
                <div className="flex items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Fatou Diop</h4>
                    <p className="text-sm text-indigo-600">Graphiste, Dakar</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-indigo-100 rounded-full p-3 shadow-md">
                  <div className="flex text-indigo-500">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                </div>
                <div className="h-20 w-20 bg-indigo-100 rounded-full mb-6 overflow-hidden">
                  <img
                    src="/img/testimonial-abdoulaye.jpg"
                    alt="Abdoulaye Ndiaye"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                    }}
                  />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "J'ai commencé sur NionFar il y a un an et aujourd'hui j'ai plus de clients que je ne peux en gérer. La plateforme m'a vraiment aidé à lancer ma carrière."
                </p>
                <div className="flex items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Abdoulaye Ndiaye</h4>
                    <p className="text-sm text-indigo-600">Développeur Web, Thiès</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-indigo-100 rounded-full p-3 shadow-md">
                  <div className="flex text-indigo-500">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                </div>
                <div className="h-20 w-20 bg-indigo-100 rounded-full mb-6 overflow-hidden">
                  <img
                    src="/img/testimonial-aminata.jpg"
                    alt="Aminata Sow"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                    }}
                  />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Ce que j'apprécie le plus chez NionFar, c'est la sécurité des paiements et la qualité du support client. Je recommande à tous les freelances sénégalais."
                </p>
                <div className="flex items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Aminata Sow</h4>
                    <p className="text-sm text-indigo-600">Rédactrice, Saint-Louis</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
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
                Questions fréquentes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tout ce que vous devez savoir</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Les réponses aux questions les plus courantes pour démarrer sur NionFar
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">Q</span>
                      {faq.question}
                    </h3>
                    <div className="pl-11">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500 opacity-20 rounded-full blur-2xl animate-pulse"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-white mb-6"
              >
                Prêt à démarrer votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">aventure de freelance</span> ?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-indigo-100 mb-10"
              >
                Rejoignez des milliers de freelances qui construisent leur carrière sur NionFar et commencez à gagner dès aujourd'hui.
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
                  S'inscrire comme freelance
                  <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  Contacter l'équipe
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-10 text-indigo-200 text-sm"
              >
                <p>Pas de frais d'inscription • Commission de 15% uniquement sur les projets réalisés • Paiements sécurisés</p>
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
                  La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix.
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
                <h4 className="text-lg font-semibold mb-4">Catégories</h4>
                <ul className="space-y-3">
                  <li><Link href="/categories/graphisme" className="text-gray-400 hover:text-white transition-colors">Graphisme & Design</Link></li>
                  <li><Link href="/categories/redaction" className="text-gray-400 hover:text-white transition-colors">Rédaction & Traduction</Link></li>
                  <li><Link href="/categories/developpement" className="text-gray-400 hover:text-white transition-colors">Développement Web</Link></li>
                  <li><Link href="/categories/marketing" className="text-gray-400 hover:text-white transition-colors">Marketing Digital</Link></li>
                  <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Toutes les catégories</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">À propos</h4>
                <ul className="space-y-3">
                  <li><Link href="/a-propos" className="text-gray-400 hover:text-white transition-colors">Qui sommes-nous</Link></li>
                  <li><Link href="/comment-ca-marche" className="text-gray-400 hover:text-white transition-colors">Comment ça marche</Link></li>
                  <li><Link href="/devenir-freelance" className="text-gray-400 hover:text-white transition-colors">Devenir freelance</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/carriere" className="text-gray-400 hover:text-white transition-colors">Carrières</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-3">
                  <li><Link href="/aide" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contactez-nous</Link></li>
                  <li><Link href="/conditions" className="text-gray-400 hover:text-white transition-colors">Conditions d'utilisation</Link></li>
                  <li><Link href="/confidentialite" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Politique de cookies</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} NionFar.sn - Tous droits réservés
              </p>
              <div className="mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">
                  Conçu avec <span className="text-red-500">❤️</span> à Dakar
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </Layout>
  );
};

// FAQ data
const faqs = [
  {
    question: "Combien coûte l'inscription sur NionFar ?",
    answer: "L'inscription sur NionFar est totalement gratuite. Nous prélevons uniquement une commission de 15% sur les projets que vous réalisez via notre plateforme."
  },
  {
    question: "Quelles sont les compétences recherchées sur NionFar ?",
    answer: "NionFar propose une large gamme de catégories : développement web, design graphique, rédaction, marketing digital, traduction, montage vidéo, et bien d'autres. Si vous avez une compétence que vous pouvez proposer comme service, il y a certainement une place pour vous."
  },
  {
    question: "Comment sont calculés les frais de service ?",
    answer: "Nous prélevons une commission de 15% sur vos ventes. Par exemple, si vous vendez un service à 10 000 FCFA, vous recevrez 8 500 FCFA. Cette commission nous permet de maintenir et d'améliorer la plateforme, ainsi que d'attirer de nouveaux clients."
  },
  {
    question: "Quand vais-je recevoir mon paiement ?",
    answer: "Les paiements sont traités dans les 24 heures après que le client a marqué la commande comme terminée et qu'il est satisfait du travail livré. Vous pouvez ensuite retirer vos fonds via Orange Money, Wave ou par virement bancaire."
  },
  {
    question: "Comment puis-je me démarquer sur NionFar ?",
    answer: "Pour vous démarquer, assurez-vous de créer un profil complet avec une photo professionnelle, des exemples de travaux de qualité, et des descriptions détaillées de vos services. Offrir un excellent service client et livrer un travail de qualité dans les délais vous aidera également à obtenir de bonnes évaluations."
  }
];

export default DevenirFreelance; 