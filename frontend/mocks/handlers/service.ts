import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 100;

// Données mockées pour les services
const mockServices = [
  {
    id: 'service-1',
    title: 'Création de logo professionnel',
    description: 'Je vais créer un logo professionnel et moderne pour votre entreprise.',
    price: 15000,
    deliveryTime: 3, // jours
    provider: {
      id: 'user-456',
      fullName: 'Sophie Martin'
    },
    category: 'design',
    tags: ['logo', 'branding', 'design graphique']
  },
  {
    id: 'service-2',
    title: 'Développement de site web vitrine',
    description: 'Création d\'un site web responsive pour présenter votre entreprise ou vos services.',
    price: 50000,
    deliveryTime: 7, // jours
    provider: {
      id: 'user-789',
      fullName: 'Mohammed Diallo'
    },
    category: 'développement',
    tags: ['site web', 'frontend', 'responsive']
  }
];

export const serviceHandlers = [
  // Récupérer tous les services
  http.get('/api/services', async () => {
    await delay(NETWORK_DELAY);
    
    console.log('[MSW] Requête GET pour les services');
    
    return HttpResponse.json({
      success: true,
      services: mockServices,
      totalCount: mockServices.length
    });
  }),
  
  // Récupérer un service par ID
  http.get('/api/services/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    
    const { id } = params;
    console.log(`[MSW] Requête GET pour le service: ${id}`);
    
    const service = mockServices.find(s => s.id === id);
    
    if (!service) {
      return HttpResponse.json(
        { success: false, error: 'Service non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      service
    });
  })
]; 