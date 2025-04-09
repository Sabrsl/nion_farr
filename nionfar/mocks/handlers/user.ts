import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 500;

// Données mockées pour les utilisateurs
const mockUsers = [
  {
    id: 'user-123',
    firstName: 'Jean',
    lastName: 'Dupont',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+221 77 123 45 67',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'client',
    joinedAt: '2023-09-01T10:00:00Z',
    lastLogin: '2023-10-20T15:30:00Z',
    verified: true,
    emailVerified: true,
    phoneVerified: true,
    bio: 'Entrepreneur dans le secteur de la tech, à la recherche de services de qualité.',
    address: {
      city: 'Dakar',
      country: 'Sénégal',
      postalCode: '11500',
      street: '123 Rue des Almadies'
    },
    isOnline: true,
    socialLinks: {
      facebook: 'https://facebook.com/jeandupont',
      twitter: 'https://twitter.com/jeandupont',
      linkedin: 'https://linkedin.com/in/jeandupont'
    },
    notifications: {
      email: true,
      mobile: true,
      inApp: true
    }
  },
  {
    id: 'user-456',
    firstName: 'Sophie',
    lastName: 'Martin',
    fullName: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    phone: '+221 77 987 65 43',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    role: 'prestataire',
    joinedAt: '2023-08-15T14:20:00Z',
    lastLogin: '2023-10-19T18:45:00Z',
    verified: true,
    emailVerified: true,
    phoneVerified: true,
    bio: 'Designer graphique professionnelle avec 5 ans d\'expérience dans la création de logos et d\'identités visuelles pour entreprises.',
    specialties: ['Logo Design', 'Branding', 'Web Design'],
    address: {
      city: 'Dakar',
      country: 'Sénégal',
      postalCode: '11700',
      street: '45 Avenue Cheikh Anta Diop'
    },
    isOnline: false,
    lastSeen: '2023-10-19T19:30:00Z',
    socialLinks: {
      instagram: 'https://instagram.com/sophiedesign',
      behance: 'https://behance.net/sophiemartin',
      linkedin: 'https://linkedin.com/in/sophiemartin'
    },
    notifications: {
      email: true,
      mobile: false,
      inApp: true
    },
    rating: 4.8,
    totalReviews: 42,
    completedOrders: 38
  },
  {
    id: 'user-789',
    firstName: 'Mohammed',
    lastName: 'Diallo',
    fullName: 'Mohammed Diallo',
    email: 'mohammed.diallo@example.com',
    phone: '+221 76 555 33 22',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    role: 'prestataire',
    joinedAt: '2023-07-20T09:15:00Z',
    lastLogin: '2023-10-20T08:20:00Z',
    verified: true,
    emailVerified: true,
    phoneVerified: true,
    bio: 'Développeur full stack avec expertise en création de sites web et d\'applications mobiles pour petites et moyennes entreprises.',
    specialties: ['Web Development', 'Mobile Apps', 'E-commerce'],
    address: {
      city: 'Thiès',
      country: 'Sénégal',
      postalCode: '21000',
      street: '78 Quartier Hersent'
    },
    isOnline: true,
    socialLinks: {
      github: 'https://github.com/mohammeddiallo',
      linkedin: 'https://linkedin.com/in/mohammeddiallo',
      twitter: 'https://twitter.com/mohammeddiallo'
    },
    notifications: {
      email: true,
      mobile: true,
      inApp: true
    },
    rating: 4.9,
    totalReviews: 27,
    completedOrders: 26
  }
];

export const userHandlers = [
  // Récupérer le profil utilisateur
  http.get('/api/users/profile', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const user = mockUsers.find(u => u.id === userId);
    
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
  }),
  
  // Récupérer le profil public d'un utilisateur
  http.get('/api/users/public-profile/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer une version publique du profil (sans données sensibles)
    const publicProfile = {
      id: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      joinedAt: user.joinedAt,
      bio: user.bio,
      specialties: user.specialties,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      socialLinks: user.socialLinks,
      // Inclure des informations supplémentaires si c'est un prestataire
      ...(user.role === 'prestataire' && {
        rating: user.rating,
        totalReviews: user.totalReviews,
        completedOrders: user.completedOrders
      })
    };
    
    return HttpResponse.json({
      success: true,
      profile: publicProfile
    });
  }),
  
  // Mettre à jour le profil utilisateur
  http.put('/api/users/profile', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const updateData = await request.json();
    
    if (!updateData.id) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === updateData.id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Champs qui ne peuvent pas être modifiés directement
    const protectedFields = ['id', 'email', 'role', 'verified', 'emailVerified', 'phoneVerified', 'joinedAt'];
    
    // Créer une version mise à jour de l'utilisateur
    const updatedUser = { 
      ...mockUsers[userIndex],
      ...Object.fromEntries(
        Object.entries(updateData).filter(([key]) => !protectedFields.includes(key))
      ),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
  }),
  
  // Changer l'email
  http.post('/api/users/change-email', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { userId, newEmail, password } = await request.json();
    
    if (!userId || !newEmail || !password) {
      return HttpResponse.json(
        { success: false, error: 'Toutes les informations sont requises' },
        { status: 400 }
      );
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'email est déjà utilisé
    if (mockUsers.some(u => u.email === newEmail)) {
      return HttpResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Simuler la vérification du mot de passe (dans une vraie implémentation, il faudrait vérifier le hash)
    // Pour la simulation, considérer que le mot de passe est toujours correct si la longueur est > 5
    if (password.length <= 5) {
      return HttpResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Un email de vérification a été envoyé à votre nouvelle adresse email'
    });
  }),
  
  // Changer le mot de passe
  http.post('/api/users/change-password', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { userId, currentPassword, newPassword } = await request.json();
    
    if (!userId || !currentPassword || !newPassword) {
      return HttpResponse.json(
        { success: false, error: 'Toutes les informations sont requises' },
        { status: 400 }
      );
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Simuler la vérification du mot de passe actuel
    if (currentPassword.length <= 5) {
      return HttpResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }
    
    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      return HttpResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  }),
  
  // Mettre à jour les paramètres de notification
  http.put('/api/users/notification-settings', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { userId, settings } = await request.json();
    
    if (!userId || !settings) {
      return HttpResponse.json(
        { success: false, error: 'Informations requises manquantes' },
        { status: 400 }
      );
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour les paramètres de notification
    const updatedUser = {
      ...mockUsers[userIndex],
      notifications: {
        ...mockUsers[userIndex].notifications,
        ...settings
      },
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      notifications: updatedUser.notifications,
      message: 'Paramètres de notification mis à jour'
    });
  }),
  
  // Télécharger l'avatar
  http.post('/api/users/upload-avatar', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    // Dans un monde réel, nous traiterions ici un upload de fichier
    // Pour MSW, simulons simplement le processus
    
    const formData = await request.formData();
    const userId = formData.get('userId');
    // const file = formData.get('avatar'); // Dans MSW, nous n'avons pas besoin de traiter le fichier réel
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Générer une URL d'avatar aléatoire
    const randomAvatar = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
    
    return HttpResponse.json({
      success: true,
      avatarUrl: randomAvatar,
      message: 'Avatar mis à jour avec succès'
    });
  }),
  
  // Rechercher des utilisateurs (principalement des prestataires)
  http.get('/api/users/search', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    const query = url.searchParams.get('q') || '';
    const role = url.searchParams.get('role') || 'prestataire';
    const specialty = url.searchParams.get('specialty');
    
    let filteredUsers = [...mockUsers];
    
    // Filtrer par rôle
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filtrer par terme de recherche
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(lowerQuery) || 
        (user.bio && user.bio.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Filtrer par spécialité (pour les prestataires)
    if (specialty && role === 'prestataire') {
      filteredUsers = filteredUsers.filter(user => 
        user.specialties && user.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }
    
    // Créer des versions publiques des profils
    const results = filteredUsers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio && user.bio.substring(0, 100) + (user.bio.length > 100 ? '...' : ''),
      specialties: user.specialties,
      rating: user.rating,
      totalReviews: user.totalReviews,
      completedOrders: user.completedOrders
    }));
    
    return HttpResponse.json({
      success: true,
      users: results,
      totalCount: results.length
    });
  })
]; 