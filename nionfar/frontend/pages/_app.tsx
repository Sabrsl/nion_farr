import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }: AppProps) {
  // Initialiser MSW uniquement côté client et en développement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initMockApi = async () => {
        if (process.env.NODE_ENV === 'development') {
          const initMSW = (await import('../src/msw-init')).default;
          await initMSW();
        }
      };
      
      initMockApi().catch(err => 
        console.error('Erreur lors de l\'initialisation des mocks:', err)
      );
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
