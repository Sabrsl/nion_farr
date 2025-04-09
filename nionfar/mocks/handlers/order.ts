import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 500;

// Type pour les messages
type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: string[]; // Champ optionnel pour les pièces jointes
};

// Type pour les commandes
type Order = {
  id: string;
  title: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  price: number;
  deadline: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  isPaid: boolean;
  requirements: string;
  messages: Message[];
  deliverables?: string[];
  deliveryDate?: string;
  completionDate?: string;
  rating?: number;
  review?: string;
};

// Données mockées pour les commandes
const mockOrders: Order[] = [
  {
    id: 'order-1',
    title: 'Création de logo pour entreprise',
    serviceId: 'service-1',
    serviceName: 'Création de logo professionnel',
    providerId: 'user-456',
    providerName: 'Sophie Martin',
    clientId: 'user-123',
    clientName: 'Jean Dupont',
    price: 15000,
    deadline: '2023-10-15T23:59:59Z',
    status: 'en_cours',
    orderDate: '2023-10-08T10:30:00Z',
    expectedDeliveryDate: '2023-10-15T23:59:59Z',
    createdAt: '2023-10-08T10:30:00Z',
    updatedAt: '2023-10-08T10:30:00Z',
    isPaid: true,
    requirements: 'Logo moderne pour une entreprise de services informatiques. Couleurs préférées: bleu et vert.',
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-123',
        content: 'Bonjour, j\'ai hâte de voir votre travail.',
        createdAt: '2023-10-08T10:35:00Z',
        isRead: true
      },
      {
        id: 'msg-2',
        senderId: 'user-456',
        content: 'Bonjour ! Je vais commencer à travailler sur votre logo dès aujourd\'hui.',
        createdAt: '2023-10-08T10:40:00Z',
        isRead: true
      }
    ]
  },
  {
    id: 'order-2',
    title: 'Site web pour cabinet médical',
    serviceId: 'service-2',
    serviceName: 'Développement de site web vitrine',
    providerId: 'user-789',
    providerName: 'Jean Dupont',
    clientId: 'user-123',
    clientName: 'Marie Lambert',
    price: 50000,
    deadline: '2023-11-01T23:59:59Z',
    status: 'en_attente',
    orderDate: '2023-10-15T14:20:00Z',
    expectedDeliveryDate: '2023-11-01T23:59:59Z',
    createdAt: '2023-10-15T14:20:00Z',
    updatedAt: '2023-10-15T14:20:00Z',
    isPaid: true,
    requirements: 'Site web pour un cabinet médical. Design simple et professionnel. Pages: Accueil, Équipe, Services, Contact.',
    messages: []
  }
];

export const orderHandlers = [
  // Récupérer toutes les commandes
  http.get('/api/orders', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    // Filtrer par userId (client ou prestataire)
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    
    let filteredOrders = [...mockOrders];
    
    if (userId) {
      if (role === 'client') {
        filteredOrders = filteredOrders.filter(order => order.clientId === userId);
      } else if (role === 'provider') {
        filteredOrders = filteredOrders.filter(order => order.providerId === userId);
      } else {
        // Si aucun rôle spécifié, vérifier les deux
        filteredOrders = filteredOrders.filter(
          order => order.clientId === userId || order.providerId === userId
        );
      }
    }
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    return HttpResponse.json({
      success: true,
      orders: filteredOrders,
      totalCount: filteredOrders.length
    });
  }),
  
  // Récupérer une commande par ID
  http.get('/api/orders/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return HttpResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      order
    });
  }),
  
  // Créer une nouvelle commande
  http.post('/api/orders/create', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const orderData = await request.json();
    
    // Validation basique
    if (!orderData.serviceId || !orderData.clientId) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    // Créer une nouvelle commande
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      ...orderData,
      status: 'en_attente',
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaid: false,
      messages: [],
      clientName: orderData.clientName || 'Client',
      providerName: orderData.providerName || 'Prestataire',
      serviceName: orderData.serviceName || 'Service',
      expectedDeliveryDate: orderData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: orderData.requirements || '',
      price: orderData.price || 0
    };
    
    return HttpResponse.json({
      success: true,
      order: newOrder,
      message: 'Commande créée avec succès'
    }, { status: 201 });
  }),
  
  // Mettre à jour le statut d'une commande
  http.put('/api/orders/update-status', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { orderId, status, userId, comment } = await request.json();
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }
    
    // Simuler la mise à jour
    const updatedOrder = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Ajouter un message si un commentaire est fourni
    if (comment) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: userId,
        content: comment,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      updatedOrder.messages.push(newMessage);
    }
    
    return HttpResponse.json({
      success: true,
      order: updatedOrder,
      message: `Statut mis à jour: ${status}`
    });
  }),
  
  // Livrer une commande
  http.post('/api/orders/deliver', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { orderId, userId, deliverables, message } = await request.json();
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est bien le prestataire
    if (mockOrders[orderIndex].providerId !== userId) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à livrer cette commande' },
        { status: 403 }
      );
    }
    
    // Simuler la mise à jour
    const updatedOrder: Order = {
      ...mockOrders[orderIndex],
      status: 'livré',
      updatedAt: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),
      deliverables: deliverables || []
    };
    
    // Ajouter un message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      content: message || 'Votre commande a été livrée.',
      createdAt: new Date().toISOString(),
      isRead: false,
      attachments: deliverables
    };
    
    updatedOrder.messages.push(newMessage);
    
    return HttpResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Commande livrée avec succès'
    });
  }),
  
  // Marquer une commande comme terminée
  http.post('/api/orders/:id/complete', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const { userId, rating, review } = await request.json();
    
    const orderIndex = mockOrders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est bien le client
    if (mockOrders[orderIndex].clientId !== userId) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à terminer cette commande' },
        { status: 403 }
      );
    }
    
    // Vérifier que la commande est au statut livré
    if (mockOrders[orderIndex].status !== 'livré') {
      return HttpResponse.json(
        { success: false, error: 'La commande doit être livrée avant de pouvoir être terminée' },
        { status: 400 }
      );
    }
    
    // Simuler la mise à jour
    const updatedOrder: Order = {
      ...mockOrders[orderIndex],
      status: 'terminé',
      updatedAt: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      rating,
      review
    };
    
    return HttpResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Commande terminée avec succès'
    });
  })
]; 