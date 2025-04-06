import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  // Mettre à jour le titre de la page uniquement côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Nionfar';
      
      // Log les erreurs JavaScript qui pourraient affecter la navigation
      window.addEventListener('error', (event) => {
        console.error('Erreur JavaScript capturée:', event.error);
      });
    }
  }, []);

  // Ajouter des logs de débogage pour comprendre les problèmes de navigation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        console.log('Lien cliqué:', href);
        
        // Ne pas interférer avec les liens externes ou les liens avec target="_blank"
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !anchor.getAttribute('target')) {
          e.preventDefault();
          
          // Forcer la navigation par window.location
          console.log('Forçage de la navigation vers:', href);
          window.location.href = href;
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>Nionfar.sn | La plateforme de freelance au Sénégal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 