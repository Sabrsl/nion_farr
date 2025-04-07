import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiCheckCircle, 
  FiArrowRight, 
  FiMail, 
  FiStar, 
  FiTrendingUp, 
  FiShield, 
  FiMenu, 
  FiX 
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { categories } from '../data/categories';
import axios from 'axios';

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
  image?: string;
  description?: string;
}

const Home: NextPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoriesWithCount, setCategoriesWithCount] = useState<CategoryWithCount[]>(
    categories.map(cat => ({ ...cat, count: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Récupérer le nombre de services par catégorie depuis l'API
  useEffect(() => {
    const fetchCategoriesCount = async () => {
      try {
        setIsLoading(true);
        // Appel à l'API pour récupérer le nombre de services par catégorie
        const response = await axios.get('/api/services/categories/count');
        
        if (response.data && response.data.categories) {
          // Mettre à jour les catégories avec les comptages
          const updatedCategories = categories.map(category => {
            const categoryData = response.data.categories.find(
              (c: any) => c.id === category.id || c.slug === category.slug
            );
            
            return {
              ...category,
              count: categoryData ? categoryData.count : 0
            };
          });
          
          setCategoriesWithCount(updatedCategories);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du nombre de services par catégorie:", error);
        // En cas d'erreur, essayer de faire un comptage côté client
        fetchCategoryCountsFallback();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fonction de fallback qui fait un appel API pour chaque catégorie
    const fetchCategoryCountsFallback = async () => {
      try {
        const updatedCategories = [...categories];
        
        // Pour chaque catégorie, faire un appel API séparé
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          try {
            const response = await axios.get(`/api/services/category/${category.id}?countOnly=true`);
            if (response.data && typeof response.data.count === 'number') {
              updatedCategories[i] = {
                ...category,
                count: response.data.count
              };
            }
          } catch (err) {
            console.error(`Erreur lors de la récupération du nombre pour la catégorie ${category.name}:`, err);
          }
        }
        
        setCategoriesWithCount(updatedCategories);
      } catch (error) {
        console.error("Erreur lors du fallback de comptage:", error);
      }
    };
    
    fetchCategoriesCount();
  }, []);

  return (
    <Layout
      title="NionFar | Services freelance au Sénégal à partir de 1000 FCFA"
      description="NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix."
    >
      {/* Hero Section with Dynamic Background */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500 opacity-20 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block px-4 py-1 mb-6 text-xs font-medium text-indigo-200 bg-indigo-800/70 backdrop-blur-sm rounded-full ring-1 ring-indigo-600/50"
              >
                La plateforme freelance #1 au Sénégal
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Services freelance à partir de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">1000 FCFA</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 sm:mt-6 text-base sm:text-xl text-indigo-100 max-w-lg"
              >
                Connectez-vous avec les meilleurs freelances sénégalais 
                pour des services de qualité à petit prix. Satisfaction garantie !
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
              >
                <Link 
                  href="/explorer" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-sm sm:text-base"
                >
                  Explorer les services
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/devenir-freelance" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                >
                  Proposer mes services
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 flex flex-wrap items-center gap-6"
              >
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Paiement sécurisé</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Livraison rapide</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Support 7j/7</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mt-12 lg:mt-0 lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-75"></div>
                <div className="relative bg-white dark:bg-gray-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden">
                  <img 
                    src="/img/hero-freelance.jpg" 
                    alt="Services freelance sur NionFar" 
                    className="w-full h-auto rounded-lg sm:rounded-xl"
                  />
                  
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-tl-xl sm:rounded-tl-2xl p-2 sm:p-3 shadow-md sm:shadow-lg">
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold text-gray-700 ml-1">(4.9/5)</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-4 sm:-right-10 transform -translate-y-1/2 bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 shadow-md sm:shadow-xl flex">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <FiTrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Commandes</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">+2500 ce mois</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 sm:-bottom-5 left-4 sm:left-10 bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 shadow-md sm:shadow-xl flex">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <FiShield className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Protection</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">Paiements sécurisés</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative mt-12 lg:mt-20 max-w-3xl mx-auto px-4 pb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un service (ex: logo, site web...)"
                className="pl-10 sm:pl-12 pr-24 sm:pr-32 py-4 sm:py-5 w-full rounded-full border-0 shadow-xl focus:ring-2 focus:ring-indigo-500 bg-white/95 backdrop-blur-sm text-gray-900 text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-transparent shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Découvrez nos catégories de services
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4"
            >
              Des milliers de freelances sénégalais prêts à vous aider dans tous les domaines
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0"
          >
            {categoriesWithCount.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <Link href={`/categories/${category.slug}`} className="block">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/600x400/6366f1/ffffff?text=${category.name}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <span className="text-xl">{category.icon || '🔍'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {isLoading ? (
                        <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                      ) : (
                        `${category.count || 0}+ services`
                      )}
                    </p>
                    <div className="flex items-center text-indigo-600 text-xs sm:text-sm font-medium">
                      Voir les services <FiArrowRight className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link 
              href="/explorer" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-lg"
            >
              Voir toutes les catégories <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-100 opacity-70 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-100 opacity-70 blur-3xl"></div>
          
          <div className="text-center mb-10 sm:mb-16 relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Ce que disent nos clients
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4"
            >
              Découvrez comment NionFar a aidé des entreprises et des particuliers à réaliser leurs projets
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0"
          >
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
            >
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-600 rounded-full p-2">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
              </div>
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    AF
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Aminata Fall</h4>
                  <p className="text-gray-600">Dakar, Sénégal</p>
                </div>
              </div>
              <p className="text-gray-700">
                "J'ai trouvé un concepteur de logo exceptionnel sur NionFar. Le processus était simple, rapide et le résultat final bien au-delà de mes attentes. Je recommande vivement cette plateforme !"
              </p>
              <div className="mt-6 flex">
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
            >
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-600 rounded-full p-2">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
              </div>
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    MD
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Mamadou Diop</h4>
                  <p className="text-gray-600">Saint-Louis, Sénégal</p>
                </div>
              </div>
              <p className="text-gray-700">
                "En tant que startup, nous avions besoin d'un site web mais avec un budget limité. Grâce à NionFar, nous avons trouvé un développeur talentueux qui a créé un site parfait pour notre business."
              </p>
              <div className="mt-6 flex">
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
            >
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-600 rounded-full p-2">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
              </div>
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    FS
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Fatou Sow</h4>
                  <p className="text-gray-600">Thiès, Sénégal</p>
                </div>
              </div>
              <p className="text-gray-700">
                "La qualité des services sur NionFar est exceptionnelle. J'ai pu faire traduire mes documents en un temps record et le freelance a été très professionnel. Je reviendrai sans hésiter !"
              </p>
              <div className="mt-6 flex">
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link 
              href="/temoignages" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-lg"
            >
              Voir plus de témoignages <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Comment ça marche ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4"
            >
              Obtenez le service dont vous avez besoin en 3 étapes simples
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative px-4 sm:px-0">
            <div className="absolute top-1/2 left-0 right-0 hidden md:block">
              <div className="h-1 w-full bg-indigo-100 -mt-1"></div>
            </div>

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Trouvez le bon service</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Parcourez nos catégories et trouvez le service adapté à vos besoins parmi des milliers d'offres.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Commandez en toute sécurité</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Contactez le freelance, discutez des détails et payez en toute sécurité via notre système protégé.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Recevez un travail de qualité</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Validez la livraison une fois satisfait et laissez un avis pour aider la communauté.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link 
              href="/comment-ca-marche" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-lg"
            >
              En savoir plus <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Vous êtes un freelance et vous cherchez des clients ?
              </h2>
              <p className="text-xl text-indigo-100 mb-10">
                Rejoignez notre communauté de freelances talentueux et commencez à vendre vos services en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/devenir-freelance" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  Devenir freelance
                </Link>
                <Link 
                  href="/en-savoir-plus-freelance" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  En savoir plus
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-3xl blur"></div>
                <div className="relative bg-gradient-to-br from-indigo-800/90 to-purple-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-indigo-700/50">
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiTrendingUp className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Augmentez vos revenus</h3>
                          <p className="text-indigo-200 text-sm">Trouvez de nouveaux clients facilement</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiShield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Paiements sécurisés</h3>
                          <p className="text-indigo-200 text-sm">Recevez votre argent en toute sécurité</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiStar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Développez votre réputation</h3>
                          <p className="text-indigo-200 text-sm">Construisez votre portefeuille client</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-indigo-200 mb-2">Plus de 2000+ freelances nous ont rejoints</p>
                    <div className="flex items-center justify-center">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-800 bg-indigo-400"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-800 bg-purple-400"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-800 bg-pink-400"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-800 bg-indigo-600 flex items-center justify-center text-xs text-white font-medium">+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home; 