import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiUsers, FiDollarSign, FiShield, FiPackage, FiHelpCircle, FiMessageSquare } from 'react-icons/fi';

const Aide: NextPage = () => {
  // State pour les FAQ ouvertes
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  // Toggle FAQ
  const toggleFaq = (index: number) => {
    if (openFaqs.includes(index)) {
      setOpenFaqs(openFaqs.filter(item => item !== index));
    } else {
      setOpenFaqs([...openFaqs, index]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Centre d'aide | NionFar.sn</title>
        <meta name="description" content="Consultez notre centre d'aide pour trouver des réponses à vos questions sur NionFar et le fonctionnement de notre plateforme." />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              NionFar<span className="text-accent-500">.sn</span>
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/explorer" className="text-gray-600 hover:text-primary-600">
              Explorer
            </Link>
            <Link href="/comment-ca-marche" className="text-gray-600 hover:text-primary-600">
              Comment ça marche
            </Link>
            <Link href="/devenir-freelance" className="text-gray-600 hover:text-primary-600">
              Devenir freelance
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-primary-600">
              Connexion
            </Link>
            <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Inscription
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section avec recherche */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Comment pouvons-nous vous aider ?</h1>
              <p className="text-xl text-primary-100">
                Recherchez dans notre base de connaissances pour trouver des réponses à vos questions.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-500" size={20} />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Rechercher une réponse..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Catégories d'aide */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Explorer par catégorie</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <Link href={`/aide/${category.slug}`} key={index} className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="flex items-start">
                    <div className="text-primary-500 mr-4">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Questions fréquemment posées</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      {openFaqs.includes(index) ? (
                        <FiChevronUp className="text-primary-500 flex-shrink-0" />
                      ) : (
                        <FiChevronDown className="text-primary-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFaqs.includes(index) && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Articles Populaires */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Articles populaires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularArticles.map((article, index) => (
                <Link href={`/aide/articles/${article.slug}`} key={index} className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="text-primary-600 font-medium">Lire l'article</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Vous n'avez pas trouvé de réponse ?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Notre équipe de support est disponible pour répondre à toutes vos questions.
              </p>
              <Link 
                href="/contact" 
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                <FiMessageSquare className="mr-2" />
                Contacter le support
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">NionFar.sn</h3>
                <p className="text-gray-400">
                  La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Catégories</h4>
                <ul className="space-y-2">
                  <li><Link href="/categories/graphisme" className="text-gray-400 hover:text-white">Graphisme & Design</Link></li>
                  <li><Link href="/categories/redaction" className="text-gray-400 hover:text-white">Rédaction & Traduction</Link></li>
                  <li><Link href="/categories/developpement" className="text-gray-400 hover:text-white">Développement Web</Link></li>
                  <li><Link href="/categories/marketing" className="text-gray-400 hover:text-white">Marketing Digital</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">À propos</h4>
                <ul className="space-y-2">
                  <li><Link href="/a-propos" className="text-gray-400 hover:text-white">Qui sommes-nous</Link></li>
                  <li><Link href="/comment-ca-marche" className="text-gray-400 hover:text-white">Comment ça marche</Link></li>
                  <li><Link href="/devenir-freelance" className="text-gray-400 hover:text-white">Devenir freelance</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><Link href="/aide" className="text-gray-400 hover:text-white">Centre d'aide</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contactez-nous</Link></li>
                  <li><Link href="/conditions" className="text-gray-400 hover:text-white">Conditions d'utilisation</Link></li>
                  <li><Link href="/confidentialite" className="text-gray-400 hover:text-white">Politique de confidentialité</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400">© 2025 NionFar.sn - Tous droits réservés</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Catégories d'aide
const helpCategories = [
  {
    title: 'Débuter sur NionFar',
    description: 'Guides pour les nouveaux utilisateurs et créations de compte',
    slug: 'debuter',
    icon: <FiUsers size={24} />
  },
  {
    title: 'Paiements et Facturation',
    description: 'Tous les aspects liés aux paiements et transactions',
    slug: 'paiements',
    icon: <FiDollarSign size={24} />
  },
  {
    title: 'Sécurité et Confidentialité',
    description: 'Protection de compte et gestion des données personnelles',
    slug: 'securite',
    icon: <FiShield size={24} />
  },
  {
    title: 'Commandes et Services',
    description: 'Gestion des commandes et prestation de services',
    slug: 'commandes',
    icon: <FiPackage size={24} />
  },
  {
    title: 'Guide pour les Freelances',
    description: 'Ressources pour optimiser votre profil et vos services',
    slug: 'freelances',
    icon: <FiHelpCircle size={24} />
  },
  {
    title: 'Guide pour les Clients',
    description: 'Comment commander et travailler avec des freelances',
    slug: 'clients',
    icon: <FiMessageSquare size={24} />
  }
];

// FAQ data
const faqs = [
  {
    question: "Comment créer un compte sur NionFar ?",
    answer: "Pour créer un compte, cliquez sur 'Inscription' en haut à droite de la page d'accueil. Remplissez le formulaire avec vos informations personnelles, acceptez les conditions d'utilisation et confirmez votre adresse email via le lien que nous vous enverrons."
  },
  {
    question: "Comment commander un service sur NionFar ?",
    answer: "Pour commander un service, naviguez vers le service qui vous intéresse, cliquez sur 'Commander', choisissez les options qui vous conviennent, puis procédez au paiement. Vous pourrez ensuite communiquer directement avec le freelance pour préciser vos besoins."
  },
  {
    question: "Quelles sont les méthodes de paiement acceptées ?",
    answer: "NionFar accepte plusieurs méthodes de paiement, notamment les cartes bancaires (Visa, Mastercard), Orange Money, Wave, Free Money, et PayPal. Les paiements sont sécurisés et protégés par notre système d'escrow qui ne libère les fonds au freelance qu'une fois le travail approuvé."
  },
  {
    question: "Comment puis-je devenir freelance sur NionFar ?",
    answer: "Pour devenir freelance, inscrivez-vous sur la plateforme, puis complétez votre profil en détaillant vos compétences et expériences. Créez ensuite vos offres de services en précisant ce que vous proposez, vos tarifs et délais. Votre profil sera examiné par notre équipe avant d'être approuvé."
  },
  {
    question: "Que faire en cas de litige avec un freelance ou un client ?",
    answer: "En cas de litige, essayez d'abord de résoudre le problème directement via notre système de messagerie. Si aucune solution n'est trouvée, vous pouvez ouvrir un ticket de support et notre équipe de médiation interviendra pour trouver une solution équitable."
  },
  {
    question: "Comment fonctionne le système de notation ?",
    answer: "Après chaque projet terminé, les clients peuvent noter les freelances sur une échelle de 1 à 5 étoiles et laisser un commentaire. Ces évaluations sont visibles sur le profil du freelance et contribuent à sa réputation sur la plateforme. Les freelances peuvent également évaluer leur expérience avec les clients."
  },
  {
    question: "Puis-je travailler avec des clients internationaux ?",
    answer: "Oui, NionFar permet aux freelances sénégalais de travailler avec des clients du monde entier. La plateforme est conçue pour faciliter les collaborations internationales, avec des paiements sécurisés et un système de communication intégré."
  },
  {
    question: "Comment puis-je me faire rembourser ?",
    answer: "Si vous n'êtes pas satisfait d'un service et que vous n'avez pas encore approuvé la livraison, vous pouvez demander un remboursement. Contactez d'abord le freelance pour tenter de résoudre le problème. Si aucune solution n'est trouvée, ouvrez un ticket de support et notre équipe examinera votre demande conformément à notre politique de remboursement."
  }
];

// Articles populaires
const popularArticles = [
  {
    title: "Guide complet pour réussir en tant que freelance sur NionFar",
    excerpt: "Découvrez nos conseils pour optimiser votre profil, attirer plus de clients et maximiser vos revenus.",
    slug: "guide-reussite-freelance"
  },
  {
    title: "Comment se protéger contre les arnaques en ligne",
    excerpt: "Apprenez à reconnaître les signes d'une potentielle arnaque et les mesures à prendre pour protéger votre compte.",
    slug: "protection-arnaques"
  },
  {
    title: "Optimiser votre description de service pour plus de ventes",
    excerpt: "Des conseils pratiques pour rédiger des descriptions de services attrayantes qui convertissent les visiteurs en clients.",
    slug: "optimiser-descriptions"
  },
  {
    title: "Comment résoudre les problèmes de paiement courants",
    excerpt: "Solutions aux problèmes les plus fréquents rencontrés lors des paiements sur NionFar.",
    slug: "problemes-paiements"
  },
  {
    title: "Guide du débutant pour les clients sur NionFar",
    excerpt: "Tout ce que vous devez savoir pour trouver le bon freelance et obtenir un travail de qualité.",
    slug: "guide-debutant-clients"
  },
  {
    title: "Comment gérer efficacement votre temps en tant que freelance",
    excerpt: "Techniques et outils pour organiser votre travail, respecter les délais et éviter le surmenage.",
    slug: "gestion-temps-freelance"
  }
];

export default Aide; 