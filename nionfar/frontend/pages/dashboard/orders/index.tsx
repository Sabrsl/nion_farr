import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FiList, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import OrderList from '../../../components/dashboard/OrderList';
import { useAuth } from '../../../contexts/AuthContext';
import { Order, OrderStatus } from '../../../types';
import Link from 'next/link';

// Données de commandes fictives pour test
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    title: 'Création logo pour startup tech',
    client: {
      id: 'client1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      createdAt: '2023-01-15T10:30:00Z'
    },
    seller: {
      id: 'seller1',
      name: 'Marie Martin',
      email: 'marie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: '2022-08-15T10:30:00Z'
    },
    service: {
      id: 'service1',
      title: 'Je crée un logo professionnel pour votre entreprise',
      image: '/images/services/logo-design.jpg',
      price: 150
    },
    status: 'en_cours',
    price: 150,
    createdAt: '2023-09-15T10:30:00Z',
    deadline: '2023-09-25T23:59:59Z',
    isPaid: true,
    requirements: 'Je souhaite un logo minimaliste avec des couleurs bleues et grises pour ma startup tech. Le logo doit refléter l\'innovation et la confiance.',
    messages: []
  },
  {
    id: '2',
    title: 'Rédaction contenu site web e-commerce',
    client: {
      id: 'client2',
      name: 'Sophie Bernard',
      email: 'sophie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      createdAt: '2023-02-10T14:15:00Z'
    },
    seller: {
      id: 'seller1',
      name: 'Marie Martin',
      email: 'marie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: '2022-08-15T10:30:00Z'
    },
    service: {
      id: 'service2',
      title: 'Rédaction de contenu web optimisé SEO',
      image: '/images/services/content-writing.jpg',
      price: 200
    },
    status: 'terminé',
    price: 200,
    createdAt: '2023-08-20T14:15:00Z',
    deadline: '2023-09-01T23:59:59Z',
    isPaid: true,
    requirements: 'J\'ai besoin de contenu pour 5 pages principales de mon site e-commerce de vêtements. Les textes doivent être optimisés pour le référencement avec des mots-clés pertinents.',
    messages: []
  },
  {
    id: '3',
    title: 'Traduction site web français-anglais',
    client: {
      id: 'client3',
      name: 'Pierre Martin',
      email: 'pierre@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      createdAt: '2023-03-05T09:00:00Z'
    },
    seller: {
      id: 'seller1',
      name: 'Marie Martin',
      email: 'marie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: '2022-08-15T10:30:00Z'
    },
    service: {
      id: 'service3',
      title: 'Traduction professionnelle français-anglais',
      image: '/images/services/translation.jpg',
      price: 120
    },
    status: 'en_attente',
    price: 120,
    createdAt: '2023-09-18T09:00:00Z',
    deadline: '2023-09-28T23:59:59Z',
    isPaid: true,
    requirements: 'J\'ai besoin de traduire mon site web de 7 pages du français vers l\'anglais. Il s\'agit d\'un site dans le domaine de la gastronomie avec un vocabulaire spécifique.',
    messages: []
  },
  {
    id: '4',
    title: 'Montage vidéo promotionnelle',
    client: {
      id: 'client1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      createdAt: '2023-01-15T10:30:00Z'
    },
    seller: {
      id: 'seller1',
      name: 'Marie Martin',
      email: 'marie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: '2022-08-15T10:30:00Z'
    },
    service: {
      id: 'service4',
      title: 'Montage vidéo professionnel pour promotions',
      image: '/images/services/video-editing.jpg',
      price: 300
    },
    status: 'annulé',
    price: 300,
    createdAt: '2023-08-10T16:45:00Z',
    deadline: '2023-08-20T23:59:59Z',
    isPaid: false,
    requirements: 'Je cherche quelqu\'un pour monter une vidéo promotionnelle de 2 minutes pour mon produit. J\'ai déjà les séquences brutes, il faut juste les assembler avec transitions et ajouter une musique de fond.',
    messages: []
  },
  {
    id: '5',
    title: 'Correction d\'article scientifique',
    client: {
      id: 'client3',
      name: 'Pierre Martin',
      email: 'pierre@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      createdAt: '2023-03-05T09:00:00Z'
    },
    seller: {
      id: 'seller1',
      name: 'Marie Martin',
      email: 'marie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: '2022-08-15T10:30:00Z'
    },
    service: {
      id: 'service5',
      title: 'Correction et relecture de documents scientifiques',
      image: '/images/services/editing.jpg',
      price: 180
    },
    status: 'litige',
    price: 180,
    createdAt: '2023-09-12T11:20:00Z',
    deadline: '2023-09-22T23:59:59Z',
    isPaid: true,
    requirements: 'J\'ai besoin d\'une correction approfondie d\'un article scientifique en français. Le délai a été dépassé et le travail n\'est pas conforme aux attentes.',
    messages: []
  }
];

const OrdersPage: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const fetchOrders = async () => {
      try {
        // Ici, vous feriez un appel API pour récupérer les vraies commandes
        // Pour le moment, nous utilisons des données fictives
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation d'un délai réseau
        setOrders(MOCK_ORDERS);
        
        // Déterminer si l'utilisateur est un vendeur ou un client
        // Pour le test, nous utilisons un drapeau fixe
        setIsSeller(true);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading]);

  return (
    <>
      <Head>
        <title>Mes commandes | Nionfar</title>
        <meta name="description" content="Gérez vos commandes et suivez leur état d'avancement" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
                <FiPackage className="mr-2 h-8 w-8 text-indigo-600" />
                Commandes
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isSeller 
                  ? "Gérez vos commandes reçues, livrez votre travail et communiquez avec vos clients."
                  : "Gérez vos commandes, suivez leur avancement et communiquez avec les freelances."}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link href="/dashboard/disputes" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FiAlertCircle className="mr-2 -ml-1 h-5 w-5" />
                Voir mes litiges
              </Link>
            </div>
          </div>

          {/* Stats des litiges actifs - visible uniquement si l'utilisateur a des litiges */}
          {orders.some(order => order.status === 'litige') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="flex items-center text-lg font-medium text-amber-800">
                    <FiAlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                    Litiges actifs
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Vous avez {orders.filter(order => order.status === 'litige').length} commande(s) en litige qui nécessite(nt) votre attention.
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <Link href="/dashboard/disputes" className="inline-flex items-center px-3 py-1.5 border border-amber-300 rounded-md text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    <FiAlertCircle className="mr-1.5 -ml-0.5 h-4 w-4" />
                    Consulter mes litiges
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-6 sm:px-6">
              <OrderList orders={orders} isSeller={isSeller} isLoading={loading} />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrdersPage;