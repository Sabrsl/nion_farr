import { Conversation, Message, User, Attachment } from '../types';

// Utilisateurs pour les conversations
export const mockUsers: User[] = [
  {
    id: 'USR-001',
    username: 'Amadou Diop',
    avatar: '/img/avatars/user-1.jpg',
    isVerified: true,
    isOnline: true
  },
  {
    id: 'USR-002',
    username: 'Fatou Diallo',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVerified: true,
    isOnline: true
  },
  {
    id: 'USR-003',
    username: 'Modou Ndiaye',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVerified: true,
    isOnline: false
  },
  {
    id: 'USR-004',
    username: 'Aminata Sow',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    isVerified: false,
    isOnline: true
  },
  {
    id: 'USR-005',
    username: 'Ibrahima Dieng',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    isVerified: true,
    isOnline: false
  },
  {
    id: 'USR-006',
    username: 'Aissatou Ba',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    isVerified: true,
    isOnline: false
  }
];

// Pièces jointes pour les messages
export const mockAttachments: Attachment[] = [
  {
    id: 'ATT-001',
    name: 'brief-projet.pdf',
    url: '/files/brief-projet.pdf',
    type: 'document',
    size: 2560000, // 2.5 MB
    thumbnailUrl: '/img/icons/pdf-icon.png',
    extension: 'pdf',
    originalName: 'brief-restaurant-maquette.pdf',
    uploadedAt: '2023-08-15T15:30:00'
  },
  {
    id: 'ATT-002',
    name: 'maquette-logo.png',
    url: 'https://source.unsplash.com/random/800x600/?logo',
    type: 'image',
    size: 1843200, // 1.8 MB
    thumbnailUrl: 'https://source.unsplash.com/random/200x150/?logo',
    extension: 'png',
    originalName: 'logo-restaurant-draft.png',
    uploadedAt: '2023-08-15T11:45:00'
  },
  {
    id: 'ATT-003',
    name: 'contrat.pdf',
    url: '/files/contrat.pdf',
    type: 'document',
    size: 3276800, // 3.2 MB
    thumbnailUrl: '/img/icons/pdf-icon.png',
    extension: 'pdf',
    originalName: 'contrat-service-design.pdf',
    uploadedAt: '2023-08-14T09:20:00'
  },
  {
    id: 'ATT-004',
    name: 'design-1.jpg',
    url: 'https://source.unsplash.com/random/800x600/?design',
    type: 'image',
    size: 1228800, // 1.2 MB
    thumbnailUrl: 'https://source.unsplash.com/random/200x150/?design',
    extension: 'jpg',
    originalName: 'proposition-design-1.jpg',
    uploadedAt: '2023-08-14T10:15:00'
  },
  {
    id: 'ATT-005',
    name: 'design-2.jpg',
    url: 'https://source.unsplash.com/random/800x600/?restaurant',
    type: 'image',
    size: 2048000, // 2 MB
    thumbnailUrl: 'https://source.unsplash.com/random/200x150/?restaurant',
    extension: 'jpg',
    originalName: 'proposition-design-2.jpg',
    uploadedAt: '2023-08-16T09:30:00'
  },
  {
    id: 'ATT-006',
    name: 'maquette-finale.png',
    url: 'https://source.unsplash.com/random/800x600/?mockup',
    type: 'image',
    size: 3072000, // 3 MB
    thumbnailUrl: 'https://source.unsplash.com/random/200x150/?mockup',
    extension: 'png',
    originalName: 'final-mockup-restaurant.png',
    uploadedAt: '2023-08-16T14:45:00'
  }
];

// Messages pour les conversations
export const mockMessages: Message[] = [
  // Conversation 1
  {
    id: 'MSG-001',
    content: 'Bonjour Fatou, j\'espère que vous allez bien. J\'ai commencé à travailler sur votre logo et j\'aimerais vous montrer quelques premières idées.',
    sender: mockUsers[0],
    receiver: mockUsers[1],
    conversation: 'CONV-001',
    createdAt: '2023-08-15T09:30:00',
    isRead: true
  },
  {
    id: 'MSG-002',
    content: 'Bonjour Amadou, merci pour votre message. J\'ai hâte de voir vos idées pour notre logo !',
    sender: mockUsers[1],
    receiver: mockUsers[0],
    conversation: 'CONV-001',
    createdAt: '2023-08-15T10:15:00',
    isRead: true
  },
  {
    id: 'MSG-003',
    content: 'Voici les premières ébauches de logo pour votre restaurant. J\'ai créé 3 concepts différents basés sur votre brief.',
    sender: mockUsers[0],
    receiver: mockUsers[1],
    conversation: 'CONV-001',
    createdAt: '2023-08-15T11:45:00',
    isRead: true,
    attachments: [mockAttachments[1], mockAttachments[4]]
  },
  {
    id: 'MSG-004',
    content: 'Merci beaucoup ! J\'aime beaucoup le concept n°2. Pouvez-vous l\'ajuster en utilisant plus de vert comme nous l\'avions mentionné ?',
    sender: mockUsers[1],
    receiver: mockUsers[0], 
    conversation: 'CONV-001',
    createdAt: '2023-08-15T14:20:00',
    isRead: true
  },
  {
    id: 'MSG-005',
    content: 'Bien sûr, je vais travailler sur cette version avec plus de vert et vous envoyer une mise à jour demain.',
    sender: mockUsers[0],
    receiver: mockUsers[1],
    conversation: 'CONV-001',
    createdAt: '2023-08-15T15:05:00',
    isRead: true
  },
  {
    id: 'MSG-006',
    content: 'Parfait, merci ! En attendant, voici le brief détaillé de notre projet.',
    sender: mockUsers[1],
    receiver: mockUsers[0],
    conversation: 'CONV-001',
    createdAt: '2023-08-15T15:30:00',
    isRead: false,
    attachments: [mockAttachments[0]]
  },
  
  // Conversation 2
  {
    id: 'MSG-007',
    content: 'Bonjour Amadou, je souhaite discuter des détails de la landing page que vous allez créer pour notre cabinet.',
    sender: mockUsers[2],
    receiver: mockUsers[0],
    conversation: 'CONV-002',
    createdAt: '2023-08-14T08:45:00',
    isRead: true
  },
  {
    id: 'MSG-008',
    content: 'Bonjour Modou, je serais ravi de discuter des détails. Quels aspects spécifiques de la landing page souhaitez-vous aborder ?',
    sender: mockUsers[0],
    receiver: mockUsers[2],
    conversation: 'CONV-002',
    createdAt: '2023-08-14T09:20:00',
    isRead: true
  },
  {
    id: 'MSG-009',
    content: 'Nous voulons nous assurer que la page reflète l\'expertise et le professionnalisme de notre cabinet. Pouvez-vous nous montrer quelques exemples de votre travail précédent dans le secteur juridique ?',
    sender: mockUsers[2],
    receiver: mockUsers[0],
    conversation: 'CONV-002',
    createdAt: '2023-08-14T10:15:00',
    isRead: true
  },
  
  // Conversation 3
  {
    id: 'MSG-010',
    content: 'Bonjour, concernant la rédaction des articles SEO, j\'aurais besoin de plus d\'informations sur les mots-clés cibles.',
    sender: mockUsers[3],
    receiver: mockUsers[0],
    conversation: 'CONV-003',
    createdAt: '2023-08-13T14:30:00',
    isRead: true
  },
  {
    id: 'MSG-011',
    content: 'Bonjour Aminata, voici la liste des mots-clés principaux et secondaires pour chaque article.',
    sender: mockUsers[0],
    receiver: mockUsers[3],
    conversation: 'CONV-003',
    createdAt: '2023-08-13T15:45:00',
    isRead: true
  },
  {
    id: 'MSG-012',
    content: 'Merci ! J\'ai une autre question - quelle est la longueur recommandée pour chaque article ?',
    sender: mockUsers[3],
    receiver: mockUsers[0],
    conversation: 'CONV-003',
    createdAt: '2023-08-13T16:20:00',
    isRead: false
  },
  {
    id: 'MSG-013',
    content: 'Voici la version finale du logo avec plus de vert comme demandé.',
    sender: mockUsers[0],
    receiver: mockUsers[1],
    conversation: 'CONV-001',
    createdAt: '2023-08-16T14:45:00',
    isRead: false,
    attachments: [mockAttachments[5]]
  }
];

// Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'CONV-001',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages[5],
    unreadCount: 1,
    createdAt: '2023-08-15T09:30:00',
    updatedAt: '2023-08-15T15:30:00',
    isActive: true,
    order: {
      id: 'ORD-1234',
      title: 'Conception de logo pour restaurant',
      client: mockUsers[1],
      service: {
        id: 'SRV-001',
        title: 'Je vais créer un logo professionnel pour votre entreprise',
        price: 25000,
        rating: 4.9,
        totalReviews: 124,
        deliveryTime: 3,
        images: [],
        orderCount: 243,
        createdAt: '2023-05-12',
        slug: 'logo-professionnel'
      },
      status: 'in_progress',
      price: 25000,
      createdAt: '2023-08-15',
      deadline: '2023-08-18',
      isPaid: true
    }
  },
  {
    id: 'CONV-002',
    participants: [mockUsers[0], mockUsers[2]],
    lastMessage: mockMessages[9],
    unreadCount: 0,
    createdAt: '2023-08-14T08:45:00',
    updatedAt: '2023-08-14T10:15:00',
    isActive: true,
    order: {
      id: 'ORD-1235',
      title: 'Développement d\'une landing page',
      client: mockUsers[2],
      service: {
        id: 'SRV-002',
        title: 'Je vais créer une landing page attractive et optimisée',
        price: 75000,
        rating: 4.8,
        totalReviews: 87,
        deliveryTime: 5,
        images: [],
        orderCount: 156,
        createdAt: '2023-04-24',
        slug: 'landing-page-optimisee'
      },
      status: 'pending',
      price: 75000,
      createdAt: '2023-08-14',
      deadline: '2023-08-19',
      isPaid: true
    }
  },
  {
    id: 'CONV-003',
    participants: [mockUsers[0], mockUsers[3]],
    lastMessage: mockMessages[11],
    unreadCount: 1,
    createdAt: '2023-08-13T14:30:00',
    updatedAt: '2023-08-13T16:20:00',
    isActive: true,
    order: {
      id: 'ORD-1232',
      title: 'Rédaction d\'articles SEO (x5)',
      client: mockUsers[3],
      service: {
        id: 'SRV-003',
        title: 'Je vais rédiger des articles SEO de qualité pour votre blog',
        price: 15000,
        rating: 5.0,
        totalReviews: 53,
        deliveryTime: 2,
        images: [],
        orderCount: 112,
        createdAt: '2023-06-08',
        slug: 'articles-seo'
      },
      status: 'in_progress',
      price: 75000,
      createdAt: '2023-08-13',
      deadline: '2023-08-17',
      isPaid: true
    }
  },
  {
    id: 'CONV-004',
    participants: [mockUsers[0], mockUsers[4]],
    lastMessage: {
      id: 'MSG-013',
      content: 'Le logo que vous avez créé est parfait ! Merci beaucoup pour votre excellent travail.',
      sender: mockUsers[4],
      receiver: mockUsers[0],
      conversation: 'CONV-004',
      createdAt: '2023-08-12T11:45:00',
      isRead: true
    },
    unreadCount: 0,
    createdAt: '2023-08-10T09:15:00',
    updatedAt: '2023-08-12T11:45:00',
    isActive: false,
    order: {
      id: 'ORD-1230',
      title: 'Logo pour boutique en ligne',
      client: mockUsers[4],
      service: {
        id: 'SRV-001',
        title: 'Je vais créer un logo professionnel pour votre entreprise',
        price: 25000,
        rating: 4.9,
        totalReviews: 124,
        deliveryTime: 3,
        images: [],
        orderCount: 243,
        createdAt: '2023-05-12',
        slug: 'logo-professionnel'
      },
      status: 'completed',
      price: 25000,
      createdAt: '2023-08-10',
      deadline: '2023-08-13',
      isPaid: true
    }
  },
  {
    id: 'CONV-005',
    participants: [mockUsers[0], mockUsers[5]],
    lastMessage: {
      id: 'MSG-014',
      content: 'J\'aimerais demander une révision pour le design de la page d\'accueil.',
      sender: mockUsers[5],
      receiver: mockUsers[0],
      conversation: 'CONV-005',
      createdAt: '2023-08-08T16:30:00',
      isRead: true
    },
    unreadCount: 0,
    createdAt: '2023-08-08T13:20:00',
    updatedAt: '2023-08-08T16:30:00',
    isActive: true,
    order: {
      id: 'ORD-1228',
      title: 'Design UI pour site e-learning',
      client: mockUsers[5],
      service: {
        id: 'SRV-003',
        title: 'Je vais concevoir une maquette UI/UX pour votre application mobile',
        price: 100000,
        rating: 5.0,
        totalReviews: 53,
        deliveryTime: 10,
        images: [],
        orderCount: 112,
        createdAt: '2023-06-08',
        slug: 'maquette-ui-ux-application-mobile'
      },
      status: 'revision',
      price: 100000,
      createdAt: '2023-08-08',
      deadline: '2023-08-18',
      isPaid: true
    }
  }
]; 