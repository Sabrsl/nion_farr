import { http, HttpResponse, delay } from 'msw';

// Simuler un délai de réseau pour rendre les mocks plus réalistes
const NETWORK_DELAY = 500;

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { email, password } = await request.json();
    
    // Validation simple
    if (!email || !password) {
      return HttpResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Simulation de login réussi avec utilisateur test
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        user: {
          id: 'user-123',
          name: 'Utilisateur Test',
          email: 'test@example.com',
          role: 'client',
          createdAt: '2023-01-01T00:00:00Z',
          isVerified: true
        },
        token: 'fake-jwt-token-12345'
      });
    }
    
    // Simulation d'échec d'authentification
    return HttpResponse.json(
      { success: false, error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  }),
  
  // Register
  http.post('/api/auth/register', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const data = await request.json();
    
    // Validation de base
    if (!data.email || !data.password || !data.name) {
      return HttpResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Simuler un email déjà existant
    if (data.email === 'existant@example.com') {
      return HttpResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }
    
    // Succès de l'inscription
    return HttpResponse.json({
      success: true,
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      user: {
        id: 'new-user-456',
        name: data.name,
        email: data.email,
        role: data.role || 'client',
        createdAt: new Date().toISOString(),
        isVerified: false
      }
    });
  }),
  
  // Email verification
  http.post('/api/auth/verify', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { email, code } = await request.json();
    
    // Simuler un code valide
    if (code === '123456' || code === 'valid-code') {
      return HttpResponse.json({
        success: true,
        message: 'Compte vérifié avec succès',
        redirectTo: '/dashboard',
        token: 'verification-success-token-789'
      });
    }
    
    // Simuler un code invalide ou expiré
    return HttpResponse.json(
      { success: false, error: 'Code invalide ou expiré' },
      { status: 400 }
    );
  }),
  
  // Forgot password
  http.post('/api/auth/forgot-password', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { email } = await request.json();
    
    // Simuler un email non trouvé
    if (email === 'unknown@example.com') {
      return HttpResponse.json(
        { success: false, error: 'Aucun compte associé à cet email' },
        { status: 404 }
      );
    }
    
    // Simuler un succès
    return HttpResponse.json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé'
    });
  }),
  
  // Reset password
  http.post('/api/auth/reset-password', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { token, password, confirmPassword } = await request.json();
    
    // Validation de base
    if (!token || !password || !confirmPassword) {
      return HttpResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier la correspondance des mots de passe
    if (password !== confirmPassword) {
      return HttpResponse.json(
        { success: false, error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }
    
    // Simuler un token invalide
    if (token === 'invalid-token') {
      return HttpResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Simuler un succès
    return HttpResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      redirectTo: '/auth/login'
    });
  })
]; 