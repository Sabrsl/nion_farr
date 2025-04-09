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
  FiUsers, 
  FiCheckCircle,
  FiBookOpen,
  FiStar,
  FiSettings,
  FiTrendingUp,
  FiGlobe,
  FiTarget,
  FiShield,
  FiFileText,
  FiHelpCircle
} from 'react-icons/fi/index.js';
import Layout from '../../components/layout/Layout';

const DebuterSurNionFar: NextPage = () => {
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const toggleArticle = (index: number) => {
    setOpenArticle(openArticle === index ? null : index);
  };

  return (
    <Layout>
      <Head>
        <title>Débuter sur NionFar | Centre d'aide</title>
        <meta 
          name="description" 
          content="Guides et ressources pour les nouveaux utilisateurs de NionFar. Apprenez à créer un compte, à naviguer sur la plateforme et à effectuer vos premières transactions." 
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
                <span className="text-white font-medium">Débuter sur NionFar</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Débuter sur NionFar
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                Tout ce que vous devez savoir pour bien démarrer sur notre plateforme de freelance.
              </p>
              
              {/* Call-to-action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href="#guides"
                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all flex items-center"
                  >
                    Consulter les guides
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
                    Consulter la FAQ
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
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  Bienvenue sur NionFar, la première plateforme de services freelance au Sénégal ! Que vous soyez un client à la recherche de talents ou un freelance souhaitant proposer vos services, cette section vous guidera à travers les premières étapes pour bien démarrer.
                </p>
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100 shadow-sm mb-12">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      <FiStar className="text-indigo-600" size={20} />
                    </div>
                    À savoir avant de commencer
                  </h2>
                  <ul className="space-y-4">
                    <li className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-4 flex-shrink-0">
                        <FiCheckCircle className="text-indigo-600" size={18} />
                      </div>
                      <span className="text-gray-700">L'inscription sur NionFar est <strong className="text-indigo-700">gratuite</strong> pour tous les utilisateurs.</span>
                    </li>
                    <li className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-4 flex-shrink-0">
                        <FiCheckCircle className="text-indigo-600" size={18} />
                      </div>
                      <span className="text-gray-700">Les freelances ne paient des frais de commission que lorsqu'ils réalisent une vente.</span>
                    </li>
                    <li className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-4 flex-shrink-0">
                        <FiCheckCircle className="text-indigo-600" size={18} />
                      </div>
                      <span className="text-gray-700">Votre compte peut être utilisé à la fois comme client et comme freelance.</span>
                    </li>
                    <li className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                      <div className="p-2 bg-indigo-100 rounded-full mr-4 flex-shrink-0">
                        <FiCheckCircle className="text-indigo-600" size={18} />
                      </div>
                      <span className="text-gray-700">Notre système de protection vous garantit des transactions sécurisées.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Articles et guides détaillés */}
        <section id="guides" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center mb-4 bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-sm font-medium">
                <FiBookOpen className="mr-2" />
                DOCUMENTATION
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Guides pour débutants</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explorez nos guides détaillés pour apprendre à utiliser NionFar efficacement
              </p>
            </motion.div>
            
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                {articlesDebutant.map((article, index) => (
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
                          {article.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {article.title}
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
                              {article.content}
                            </div>
                            
                            {article.steps && (
                              <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                  <FiTarget className="text-indigo-600 mr-2" />
                                  Comment procéder :
                                </h4>
                                <ol className="space-y-5">
                                  {article.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex">
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 mt-1 font-semibold shadow-sm">
                                        {stepIndex + 1}
                                      </div>
                                      <div className="text-gray-700 pt-1">{step}</div>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            
                            {article.link && (
                              <a 
                                href={article.link} 
                                className="inline-flex items-center text-indigo-600 font-medium mt-6 hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2 rounded-lg group"
                              >
                                En savoir plus
                                <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                              </a>
                            )}
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

        {/* Ressources complémentaires */}
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
                <FiGlobe className="mr-2" />
                RESSOURCES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ressources complémentaires</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des outils et ressources supplémentaires pour vous aider à tirer le meilleur parti de NionFar
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ressourcesComplementaires.map((ressource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <a 
                    href={ressource.link}
                    className="block bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-full border border-gray-100 group-hover:border-indigo-200"
                  >
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 w-16 h-16 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-200 transition-colors shadow-sm">
                      {ressource.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {ressource.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{ressource.description}</p>
                    <div className="text-indigo-600 font-medium flex items-center group-hover:text-indigo-700 transition-colors">
                      Consulter
                      <FiArrowRight className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Besoin d'aide supplémentaire */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white relative overflow-hidden">
                  {/* Éléments décoratifs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full -mb-16 -ml-16"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Vous n'avez pas trouvé ce que vous cherchiez ?</h2>
                    <p className="mb-8 text-indigo-100 text-lg">
                      Notre équipe de support est disponible pour répondre à toutes vos questions et vous aider à démarrer sur NionFar.
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
                Prêt à commencer votre aventure sur NionFar ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Rejoignez la première communauté de freelance au Sénégal et développez votre activité dès aujourd'hui.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a 
                  href="/inscription"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center"
                >
                  Créer un compte
                  <FiArrowRight className="ml-2" />
                </motion.a>
                <motion.a 
                  href="/explorer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium border border-indigo-200 hover:border-indigo-300 transition-all"
                >
                  Explorer les services
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

// Articles pour débutants
const articlesDebutant = [
  {
    title: "Créer et configurer votre compte",
    icon: <FiUsers size={24} />,
    content: (
      <>
        <p className="mb-4">
          La création d'un compte sur NionFar est simple et gratuite. Une fois inscrit, vous pourrez configurer votre profil, ajouter vos informations personnelles et professionnelles, et accéder à toutes les fonctionnalités de la plateforme.
        </p>
        <p>
          Un profil bien configuré est essentiel pour inspirer confiance aux clients potentiels et aux freelances avec qui vous souhaitez travailler. Prenez le temps de compléter toutes les sections et d'ajouter une photo professionnelle.
        </p>
      </>
    ),
    steps: [
      "Cliquez sur le bouton 'Inscription' en haut à droite de la page d'accueil",
      "Remplissez le formulaire avec votre nom, email et choisissez un mot de passe sécurisé",
      "Vérifiez votre adresse email en cliquant sur le lien que nous vous enverrons",
      "Complétez votre profil en ajoutant vos informations personnelles, compétences et une photo de profil",
      "Ajoutez vos méthodes de paiement préférées dans la section 'Paramètres de paiement'"
    ],
    link: "/aide/articles/creer-configurer-compte"
  },
  {
    title: "Naviguer sur la plateforme",
    icon: <FiGlobe size={24} />,
    content: (
      <>
        <p className="mb-4">
          La plateforme NionFar a été conçue pour être intuitive et facile à utiliser. Découvrez comment naviguer efficacement, rechercher des services, accéder à votre tableau de bord et gérer vos projets.
        </p>
        <p>
          Le tableau de bord est votre espace personnel où vous pouvez suivre l'avancement de vos projets, gérer vos messages et accéder à votre historique de transactions.
        </p>
      </>
    ),
    steps: [
      "Utilisez la barre de recherche en haut pour trouver des services spécifiques",
      "Explorez les catégories pour découvrir les différents types de services disponibles",
      "Accédez à votre tableau de bord en cliquant sur votre photo de profil puis 'Tableau de bord'",
      "Consultez vos messages dans la section 'Messages' de votre tableau de bord",
      "Suivez l'avancement de vos projets dans la section 'Mes projets'"
    ],
    link: "/aide/articles/naviguer-plateforme"
  },
  {
    title: "Commander votre premier service",
    icon: <FiShield size={24} />,
    content: (
      <>
        <p className="mb-4">
          Prêt à travailler avec un freelance ? Découvrez comment rechercher, sélectionner et commander un service sur NionFar. Nous vous expliquons comment communiquer efficacement vos besoins et suivre l'avancement de votre commande.
        </p>
        <p>
          Avant de passer commande, prenez le temps de lire les avis et évaluations des autres clients pour vous assurer que le freelance correspond à vos attentes.
        </p>
      </>
    ),
    steps: [
      "Recherchez un service qui correspond à vos besoins",
      "Consultez le profil du freelance, ses réalisations et les avis des clients",
      "Contactez le freelance pour discuter de votre projet si nécessaire",
      "Cliquez sur 'Commander' et sélectionnez les options qui vous conviennent",
      "Décrivez précisément vos besoins et attentes dans le formulaire de commande",
      "Procédez au paiement (les fonds seront sécurisés jusqu'à la livraison)"
    ],
    link: "/aide/articles/commander-premier-service"
  },
  {
    title: "Devenir freelance sur NionFar",
    icon: <FiTrendingUp size={24} />,
    content: (
      <>
        <p className="mb-4">
          Vous souhaitez proposer vos services sur NionFar ? Découvrez comment configurer votre profil de freelance, créer des offres de services attractives et commencer à recevoir des commandes.
        </p>
        <p>
          Un profil complet et des offres de services bien détaillées augmentent considérablement vos chances d'attirer des clients et de réaliser des ventes.
        </p>
      </>
    ),
    steps: [
      "Activez votre compte freelance depuis votre tableau de bord",
      "Complétez votre profil professionnel en détaillant vos compétences et expériences",
      "Ajoutez des exemples de vos travaux précédents dans votre portfolio",
      "Créez votre première offre de service en cliquant sur 'Créer un service'",
      "Définissez clairement ce que vous proposez, vos tarifs et délais de livraison",
      "Publiez votre service après vérification de toutes les informations"
    ],
    link: "/aide/articles/devenir-freelance"
  }
];

// Ressources complémentaires
const ressourcesComplementaires = [
  {
    title: "Glossaire NionFar",
    description: "Tous les termes et définitions utilisés sur la plateforme expliqués simplement.",
    icon: <FiBookOpen size={28} />,
    link: "/aide/glossaire"
  },
  {
    title: "Tutoriels vidéo",
    description: "Apprenez visuellement avec nos guides vidéo étape par étape.",
    icon: <FiStar size={28} />,
    link: "/aide/tutoriels-video"
  },
  {
    title: "Modèles de briefs",
    description: "Des modèles pour vous aider à communiquer clairement vos besoins aux freelances.",
    icon: <FiFileText size={28} />,
    link: "/aide/modeles-briefs"
  },
  {
    title: "Centre de formation",
    description: "Formations complètes sur le freelancing et l'utilisation optimale de la plateforme.",
    icon: <FiTarget size={28} />,
    link: "/aide/centre-formation"
  },
  {
    title: "Outils de calcul",
    description: "Calculateurs de tarifs, estimateurs de projet et autres outils pratiques.",
    icon: <FiSettings size={28} />,
    link: "/aide/outils"
  }
];

// Autres catégories d'aide
const autresCategories = [
  {
    title: "Paiements et Facturation",
    slug: "paiements",
    icon: <FiCheckCircle className="text-indigo-500 mr-2" size={20} />
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
    icon: <FiStar className="text-indigo-500 mr-2" size={20} />
  }
];

export default DebuterSurNionFar;