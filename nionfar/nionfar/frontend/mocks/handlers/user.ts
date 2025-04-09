import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 100;

// Données mockées pour les utilisateurs
const mockUsers = [
  {
    id: 'user-123',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'client'
  },
  {
    id: 'user-456',
    fullName: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    role: 'prestataire',
    specialties: ['Logo Design', 'Branding', 'Web Design'],
    rating: 4.8
  },
  {
    id: 'user-789',
    fullName: 'Mohammed Diallo',
    email: 'mohammed.diallo@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    role: 'prestataire',
    specialties: ['Web Development', 'Mobile Apps', 'E-commerce'],
    rating: 4.9
  }
];

export const userHandlers = [
  // Recherche d'utilisateurs
  http.get('/api/users/search', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    
    console.log(`[MSW] Recherche d'utilisateurs avec role: ${role || 'tous'}`);
    
    let filteredUsers = [...mockUsers];
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    return HttpResponse.json({
      success: true,
      users: filteredUsers,
      totalCount: filteredUsers.length
    });
  }),
  
  // Obtenir un utilisateur par ID
  http.get('/api/users/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    
    const { id } = params;
    console.log(`[MSW] Requête GET pour l'utilisateur: ${id}`);
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      user
    });
  })
]; 