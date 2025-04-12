import { NextRequest, NextResponse } from 'next/server';
import roleService from './services/roleService';

// Explicitly set to use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // Obtenir l'URL actuelle
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Ajouter des en-têtes CORS pour toutes les requêtes
  const response = NextResponse.next();
  
  // Définir les origines autorisées
  const allowedOrigins = [
    'https://nion-farr.vercel.app',
    'https://nion-farr-backend.vercel.app',
    'https://www.nionfar.sn',
    'https://nionfar.sn'
  ];
  
  // En développement, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
  }
  
  // Obtenir l'origine de la requête
  const origin = request.headers.get('origin');
  
  // Si l'origine est dans la liste des origines autorisées, l'ajouter à l'en-tête
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  // Si c'est une requête OPTIONS (preflight), répondre directement
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 heures
    
    return response;
  }
  
  // Récupérer les informations de l'utilisateur depuis les cookies
  const userCookie = request.cookies.get('nionfarUser')?.value;
  const tokenCookie = request.cookies.get('auth_token')?.value;
  
  // Si c'est une page du tableau de bord
  if (path.startsWith('/dashboard')) {
    // Si pas d'utilisateur connecté ou pas de token
    if (!userCookie || !tokenCookie) {
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    
    try {
      const user = JSON.parse(userCookie);
      
      // Vérifier les accès selon le rôle
      if (path.startsWith('/dashboard/client') && user.role !== 'client') {
        // Rediriger le non-client vers le bon tableau de bord
        const redirectPath = roleService.getDefaultDashboard(user);
        url.pathname = redirectPath;
        return NextResponse.redirect(url);
      }
      
      if (path.startsWith('/dashboard/freelance') && user.role !== 'freelance') {
        // Rediriger le non-freelancer vers le bon tableau de bord
        const redirectPath = roleService.getDefaultDashboard(user);
        url.pathname = redirectPath;
        return NextResponse.redirect(url);
      }
      
      if (path.startsWith('/dashboard/admin') && user.role !== 'admin') {
        // Rediriger le non-admin vers le bon tableau de bord
        const redirectPath = roleService.getDefaultDashboard(user);
        url.pathname = redirectPath;
        return NextResponse.redirect(url);
      }
      
      // Si l'utilisateur accède à /dashboard sans précision
      if (path === '/dashboard') {
        // Rediriger vers le tableau de bord spécifique selon le rôle
        const redirectPath = roleService.getDefaultDashboard(user);
        url.pathname = redirectPath;
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // En cas d'erreur de parsing JSON, rediriger vers la page de connexion
      console.error('Middleware error:', error);
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }
  
  // Si c'est une route d'API et que c'est une requête POST pour login ou register
  // Assurons-nous que les en-têtes CORS adéquats sont ajoutés
  if (path.startsWith('/api/auth') && (path.includes('/login') || path.includes('/register'))) {
    // Déjà géré par les en-têtes globaux ajoutés plus haut
    return response;
  }
  
  // Si aucune redirection n'est nécessaire, continuer normalement avec les en-têtes CORS
  return response;
}

// Appliquer le middleware à toutes les routes concernées
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/dashboard',
    '/api/auth/:path*'
  ]
}; 