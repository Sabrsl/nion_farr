import { NextRequest, NextResponse } from 'next/server';
import roleService from './services/roleService';

export async function middleware(request: NextRequest) {
  // Obtenir l'URL actuelle
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Récupérer les informations de l'utilisateur depuis le localStorage
  // Note: Comme le middleware s'exécute côté serveur, nous devons utiliser les cookies
  // car le localStorage n'est pas accessible côté serveur
  const userCookie = request.cookies.get('nionfarUser')?.value;
  
  // Si c'est une page du tableau de bord
  if (path.startsWith('/dashboard')) {
    // Si pas d'utilisateur connecté
    if (!userCookie) {
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
      
      if (path.startsWith('/dashboard/freelance') && user.role !== 'provider') {
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
      return NextResponse.redirect(url);
    }
  }
  
  // Si aucune redirection n'est nécessaire, continuer normalement
  return NextResponse.next();
}

// Ne s'applique qu'aux pages du tableau de bord et au /dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard']
}; 