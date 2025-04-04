import { 
  Order, 
  Service, 
  Category, 
  User, 
  FreelancerStats, 
  Notification 
} from '../types';

// Utilisateur connecté (freelance)
export const currentUser: User = {
  id: 'USR-001',
  username: 'Amadou Diop',
  email: 'amadou.diop@example.com',
  avatar: '/img/avatars/user-1.jpg',
  bio: 'Designer graphique spécialisé en branding et UX/UI avec plus de 5 ans d\'expérience',
  rating: 4.9,
  level: 'Level 2 Seller',
  memberSince: new Date('2022-03-15'),
  isVerified: true
};

// Services du freelance
export const freelancerServices: Service[] = [
  {
    id: 'SRV-001',
    title: 'Je vais créer un logo professionnel pour votre entreprise',
    description: 'Un logo unique et mémorable qui représente parfaitement votre marque. Inclut 3 concepts initiaux et 2 révisions.',
    price: 25000,
    rating: 4.9,
    totalReviews: 124,
    deliveryTime: 3,
    images: ['/img/services/logo-1.jpg', '/img/services/logo-2.jpg'],
    provider: currentUser,
    slug: 'logo-professionnel-entreprise',
    createdAt: '2023-05-12',
    updatedAt: '2023-07-18',
    category: {
      id: 'CAT-001',
      name: 'Design graphique'
    },
    tags: ['logo', 'branding', 'design'],
    isActive: true,
    orderCount: 243
  },
  {
    id: 'SRV-002',
    title: 'Je vais créer une identité visuelle complète pour votre marque',
    description: 'Une identité de marque complète incluant logo, palette de couleurs, typographie, et guide de style.',
    price: 75000,
    rating: 4.8,
    totalReviews: 87,
    deliveryTime: 7,
    images: ['/img/services/branding-1.jpg', '/img/services/branding-2.jpg'],
    provider: currentUser,
    slug: 'identite-visuelle-complete',
    createdAt: '2023-04-24',
    updatedAt: '2023-06-30',
    category: {
      id: 'CAT-001',
      name: 'Design graphique'
    },
    tags: ['branding', 'identité visuelle', 'design'],
    isActive: true,
    orderCount: 156
  },
  {
    id: 'SRV-003',
    title: 'Je vais concevoir une maquette UI/UX pour votre application mobile',
    description: 'Design moderne et intuitif pour votre application iOS ou Android, optimisé pour l\'expérience utilisateur.',
    price: 100000,
    rating: 5.0,
    totalReviews: 53,
    deliveryTime: 10,
    images: ['/img/services/ui-1.jpg', '/img/services/ui-2.jpg'],
    provider: currentUser,
    slug: 'maquette-ui-ux-application-mobile',
    createdAt: '2023-06-08',
    updatedAt: '2023-08-01',
    category: {
      id: 'CAT-002',
      name: 'UI/UX Design'
    },
    tags: ['ui', 'ux', 'mobile', 'application'],
    isActive: true,
    orderCount: 112
  }
];

// Commandes du freelance
export const freelancerOrders: Order[] = [
  {
    id: 'ORD-1234',
    title: 'Conception de logo pour restaurant',
    client: {
      id: 'CLI-001',
      username: 'Fatou Diallo',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      isVerified: true
    },
    service: freelancerServices[0],
    status: 'in_progress',
    price: 25000,
    createdAt: '2023-08-15',
    deadline: '2023-08-18',
    isPaid: true,
    requirements: 'Nous voulons un logo moderne et élégant pour notre nouveau restaurant de cuisine fusion. Les couleurs principales sont le vert et le doré.',
    messages: 8
  },
  {
    id: 'ORD-1235',
    title: 'Identité visuelle pour cabinet d\'avocats',
    client: {
      id: 'CLI-002',
      username: 'Modou Ndiaye',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVerified: true
    },
    service: freelancerServices[1],
    status: 'pending',
    price: 75000,
    createdAt: '2023-08-14',
    deadline: '2023-08-21',
    isPaid: true,
    requirements: 'Notre cabinet recherche une identité visuelle professionnelle et sérieuse, qui inspire confiance. Nous préférons des tons bleu marine et or.',
    messages: 3
  },
  {
    id: 'ORD-1232',
    title: 'Design UI pour application fintech',
    client: {
      id: 'CLI-003',
      username: 'Aminata Sow',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      isVerified: false
    },
    service: freelancerServices[2],
    status: 'in_progress',
    price: 100000,
    createdAt: '2023-08-13',
    deadline: '2023-08-23',
    isPaid: true,
    requirements: 'Nous lançons une application de paiement mobile et avons besoin d\'une interface intuitive et sécurisante. L\'application doit être facile à utiliser même pour les personnes peu habituées à la technologie.',
    messages: 5
  },
  {
    id: 'ORD-1230',
    title: 'Logo pour boutique en ligne',
    client: {
      id: 'CLI-004',
      username: 'Ibrahima Dieng',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      isVerified: true
    },
    service: freelancerServices[0],
    status: 'completed',
    price: 25000,
    createdAt: '2023-08-10',
    deadline: '2023-08-13',
    isPaid: true,
    requirements: 'Nous vendons des produits artisanaux sénégalais et avons besoin d\'un logo qui reflète l\'artisanat local tout en restant moderne.',
    messages: 10
  },
  {
    id: 'ORD-1228',
    title: 'Design UI pour site e-learning',
    client: {
      id: 'CLI-005',
      username: 'Aissatou Ba',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      isVerified: true
    },
    service: freelancerServices[2],
    status: 'revision',
    price: 100000,
    createdAt: '2023-08-08',
    deadline: '2023-08-18',
    isPaid: true,
    requirements: 'Nous créons une plateforme de formation en ligne et avons besoin d\'une interface claire et engageante pour les apprenants.',
    messages: 15
  }
];

// Statistiques du freelance
export const freelancerStats: FreelancerStats = {
  earnings: {
    total: 945000,
    pending: 75000,
    withdrawn: 850000,
    available: 20000
  },
  analytics: {
    views: 1258,
    clicks: 342,
    conversionRate: 5.8,
    averageRating: 4.9,
    completionRate: 98,
    totalOrders: 42,
    pendingOrders: 3,
    totalEarnings: 945000,
    totalReviews: 124
  },
  activeOrders: 3,
  pendingReviews: 2,
  responseRate: 97,
  responseTime: '2 heures'
};

// Notifications du freelance
export const freelancerNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'order',
    title: 'Nouvelle commande reçue',
    content: 'Vous avez reçu une nouvelle commande pour "Conception de logo"',
    createdAt: '2023-08-15T10:30:00',
    isRead: false,
    link: '/dashboard/orders/ORD-1234'
  },
  {
    id: 'NOTIF-002',
    type: 'message',
    title: 'Nouveau message de Fatou Diallo',
    content: 'Bonjour, je voudrais savoir si vous pouvez ajouter une révision supplémentaire...',
    createdAt: '2023-08-15T08:45:00',
    isRead: true,
    link: '/dashboard/messages/MSG-567'
  },
  {
    id: 'NOTIF-003',
    type: 'payment',
    title: 'Paiement reçu',
    content: '25 000 FCFA ont été ajoutés à votre solde pour la commande #ORD-1230',
    createdAt: '2023-08-14T15:20:00',
    isRead: true,
    link: '/dashboard/earnings'
  },
  {
    id: 'NOTIF-004',
    type: 'system',
    title: 'Mise à jour des conditions de service',
    content: 'Veuillez prendre connaissance des nouvelles conditions de service qui entreront en vigueur le 1er septembre.',
    createdAt: '2023-08-14T09:10:00',
    isRead: false,
    link: '/dashboard/settings/legal'
  },
  {
    id: 'NOTIF-005',
    type: 'order',
    title: 'Commande marquée comme terminée',
    content: 'La commande #ORD-1230 a été marquée comme terminée par le client.',
    createdAt: '2023-08-13T16:45:00',
    isRead: true,
    link: '/dashboard/orders/ORD-1230'
  }
]; 