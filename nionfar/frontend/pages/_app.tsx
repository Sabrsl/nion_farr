import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
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