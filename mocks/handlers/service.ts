import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 500;

// Données mockées pour les services
const mockServices = [
  {
    id: 'service-1',
    title: 'Création de logo professionnel',
    description: 'Je créerai un logo unique et moderne pour votre entreprise avec revisions illimitées.',
    price: 15000,
    deliveryTime: 3,
    provider: {
      id: 'user-456',
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4.8
    },
    category: 'design',
    subcategory: 'logo-design',
    tags: ['logo', 'branding', 'design'],
    isActive: true,
    createdAt: '2023-03-15T09:30:00Z',
    updatedAt: '2023-03-15T09:30:00Z',
    featuredImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1568290745147-4a0f1717ca8d?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1611465577672-8fc7be1dc826?w=800&auto=format&fit=crop&q=60'
    ],
    slug: 'creation-logo-professionnel'
  },
  {
    id: 'service-2',
    title: 'Développement de site web vitrine',
    description: 'Je vais créer un site web responsive pour présenter votre entreprise ou votre portfolio personnel.',
    price: 50000,
    deliveryTime: 7,
    provider: {
      id: 'user-789',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.5
    },
    category: 'development',
    subcategory: 'website',
    tags: ['website', 'frontend', 'responsive'],
    isActive: true,
    createdAt: '2023-04-20T14:15:00Z',
    updatedAt: '2023-04-20T14:15:00Z',
    featuredImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&auto=format&fit=crop&q=60'
    ],
    slug: 'site-web-vitrine'
  }
];

export const serviceHandlers = [
  // Récupérer tous les services
  http.get('/api/services', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    // Gérer les filtres
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    let filteredServices = [...mockServices];
    
    if (category) {
      filteredServices = filteredServices.filter(
        service => service.category === category
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(
        service => 
          service.title.toLowerCase().includes(searchLower) || 
          service.description.toLowerCase().includes(searchLower) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return HttpResponse.json({
      success: true,
      services: filteredServices,
      totalCount: filteredServices.length
    });
  }),
  
  // Récupérer un service par ID ou slug
  http.get('/api/services/:idOrSlug', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { idOrSlug } = params;
    
    const service = mockServices.find(
      svc => svc.id === idOrSlug || svc.slug === idOrSlug
    );
    
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
  }),
  
  // Créer un nouveau service
  http.post('/api/services', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const serviceData = await request.json();
    
    // Validation basique
    if (!serviceData.title || !serviceData.description || !serviceData.price) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    // Créer un nouveau service avec ID et slug générés
    const newService = {
      id: `service-${Date.now()}`,
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: serviceData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
    };
    
    return HttpResponse.json({
      success: true,
      service: newService,
      message: 'Service créé avec succès'
    }, { status: 201 });
  }),
  
  // Mettre à jour un service existant
  http.put('/api/services/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const updates = await request.json();
    
    const serviceIndex = mockServices.findIndex(svc => svc.id === id);
    
    if (serviceIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Service non trouvé' },
        { status: 404 }
      );
    }
    
    // Simuler la mise à jour
    const updatedService = {
      ...mockServices[serviceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      service: updatedService,
      message: 'Service mis à jour avec succès'
    });
  }),
  
  // Supprimer un service
  http.delete('/api/services/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const serviceExists = mockServices.some(svc => svc.id === id);
    
    if (!serviceExists) {
      return HttpResponse.json(
        { success: false, error: 'Service non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Service supprimé avec succès'
    });
  })
]; 