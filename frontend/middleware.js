import { NextResponse } from 'next/server';

export function middleware(request) {
  // Corriger les problèmes de méthode HTTP pour les appels d'API d'inscription
  if (request.nextUrl.pathname === '/api/auth/register') {
    console.log(`📝 Middleware - Méthode détectée: ${request.method} pour ${request.nextUrl.pathname}`);

    // Si c'est une requête OPTIONS, la laisser passer pour le CORS
    if (request.method === 'OPTIONS') {
      return NextResponse.next();
    }

    // Si c'est une requête GET, la rediriger vers la bonne API avec la méthode POST
    if (request.method === 'GET') {
      console.log('⚠️ Middleware - Convertissant GET en POST pour l\'inscription');
      
      // Créer une nouvelle requête avec la méthode POST
      const url = request.nextUrl.clone();
      
      // On crée une nouvelle requête en conservant tous les headers et en changeant la méthode
      const requestInit = {
        method: 'POST',
        headers: new Headers(request.headers),
        body: request.body || null,
        cache: 'no-store',
        redirect: 'manual'
      };

      // Ajouter des en-têtes spécifiques
      requestInit.headers.set('X-HTTP-Method-Override', 'POST');
      
      // Retourner la réponse modifiée
      return NextResponse.rewrite(url, requestInit);
    }
  }

  // Continuer avec les autres requêtes sans modification
  return NextResponse.next();
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: ['/api/auth/:path*']
}; 