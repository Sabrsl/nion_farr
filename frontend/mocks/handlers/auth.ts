import { http, HttpResponse, delay } from 'msw';

// Réduire le délai réseau pour les tests
const NETWORK_DELAY = 100;

// Define the login request type
interface LoginRequest {
  email: string;
  password: string;
}

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { email, password } = await request.json() as LoginRequest;
    
    console.log(`[MSW] Tentative de connexion reçue pour: ${email}`);
    
    // Accepter jean.dupont ou tout email contenant "test"
    if ((email === 'jean.dupont@example.com' && password === 'password123') || 
        (email.includes('test') && password === 'password123')) {
      
      console.log(`[MSW] Connexion réussie pour: ${email}`);
      
      return HttpResponse.json({
        success: true,
        user: {
          id: 'user-123',
          fullName: email === 'jean.dupont@example.com' ? 'Jean Dupont' : 'Utilisateur Test',
          email: email,
          role: 'client'
        },
        token: 'fake-jwt-token-for-testing'
      });
    }
    
    console.log(`[MSW] Connexion échouée pour: ${email}`);
    
    return HttpResponse.json(
      { 
        success: false, 
        error: 'Identifiants invalides',
        details: { general: 'Email ou mot de passe incorrect' }
      },
      { status: 401 }
    );
  })
]; 