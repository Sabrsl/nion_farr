import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 100;

// Type pour les messages
type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: string[];
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
  status: string;
  createdAt: string;
  deadline: string;
  messages: Message[];
  isPaid: boolean;
}

// Type pour la création de commande
interface CreateOrderRequest {
  title: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  price: number;
  deadline?: string;
  [key: string]: any;
}

// Type pour la mise à jour du statut
interface UpdateStatusRequest {
  orderId: string;
  status: string;
}

// Commandes simulées
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
    status: 'en_cours',
    createdAt: '2025-04-01T10:00:00Z',
    deadline: '2025-04-08T10:00:00Z',
    messages: [],
    isPaid: true
  },
  {
    id: 'order-2',
    title: 'Développement d\'un site vitrine',
    serviceId: 'service-2',
    serviceName: 'Développement de site web vitrine',
    providerId: 'user-789',
    providerName: 'Mohammed Diallo',
    clientId: 'user-123',
    clientName: 'Jean Dupont',
    price: 50000,
    status: 'non_commencé',
    createdAt: '2025-04-05T14:30:00Z',
    deadline: '2025-04-12T14:30:00Z',
    messages: [],
    isPaid: false
  }
];

export const orderHandlers = [
  // Récupérer les commandes
  http.get('/api/orders', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');
    
    console.log(`[MSW] Récupération des commandes pour ${role || 'tous'} avec userId: ${userId || 'tous'}`);
    
    let filteredOrders = [...mockOrders];
    
    if (userId) {
      if (role === 'client') {
        filteredOrders = filteredOrders.filter(order => order.clientId === userId);
      } else if (role === 'freelance' || role === 'prestataire') {
        filteredOrders = filteredOrders.filter(order => order.providerId === userId);
      }
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
    console.log(`[MSW] Requête GET pour la commande: ${id}`);
    
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
    
    try {
      const data = await request.json() as CreateOrderRequest;
      console.log('[MSW] Création d\'une nouvelle commande:', data);
      
      // Simuler une création réussie
      const newOrder: Order = {
        id: 'order-' + Date.now(),
        title: data.title,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        providerId: data.providerId,
        providerName: data.providerName,
        clientId: data.clientId,
        clientName: data.clientName,
        price: data.price,
        status: 'non_commencé',
        createdAt: new Date().toISOString(),
        deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [],
        isPaid: false
      };
      
      // Ajouter à la liste des commandes mockées
      mockOrders.push(newOrder);
      
      return HttpResponse.json({
        success: true,
        order: newOrder,
        message: 'Commande créée avec succès'
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de la création de commande:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de la création de la commande' },
        { status: 400 }
      );
    }
  }),
  
  // Mettre à jour le statut d'une commande
  http.put('/api/orders/update-status', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const { orderId, status } = await request.json() as UpdateStatusRequest;
      console.log(`[MSW] Mise à jour du statut de la commande ${orderId} vers ${status}`);
      
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      
      if (orderIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Commande non trouvée' },
          { status: 404 }
        );
      }
      
      // Mettre à jour le statut
      mockOrders[orderIndex].status = status;
      
      return HttpResponse.json({
        success: true,
        order: mockOrders[orderIndex],
        message: 'Statut de la commande mis à jour avec succès'
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de la mise à jour du statut:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du statut' },
        { status: 400 }
      );
    }
  })
]; 