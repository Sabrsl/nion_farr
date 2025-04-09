import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
// Import Tailwind depuis le bon chemin (styles globaux)
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }: AppProps) {
  // Initialiser MSW uniquement côté client et en développement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initMockApi = async () => {
        if (process.env.NODE_ENV === 'development') {
          // Importer les mocks directement depuis le dossier mocks/browser.ts
          try {
            const { worker } = await import('../mocks/browser');
            // Démarrer le worker MSW
            await worker.start({
              onUnhandledRequest: 'bypass'
            });
            console.log('✅ Mock Service Worker initialisé avec succès');
            
            // Configurer la variable globale pour utiliser les données mockées
            // @ts-ignore
            window.__USE_REAL_DATA__ = false;
            
            console.log('⚙️ Mode développement: données mockées activées');
          } catch (err) {
            console.error('❌ Erreur lors de l\'initialisation des mocks:', err);
          }
        }
      };
      
      initMockApi();
    }
  }, []);
  
  // Mettre à jour le titre de la page uniquement côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log les erreurs JavaScript qui pourraient affecter la navigation
      window.addEventListener('error', (event) => {
        console.error('Erreur JavaScript capturée:', event.error);
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default MyApp;
