import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
// Import des polyfills pour corriger les avertissements
import '../utils/polyfills';
// Import Tailwind depuis le bon chemin (styles globaux)
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { ChakraProvider } from '@chakra-ui/react';
import initWebVitals from '../utils/performance/webVitals';
import { analyzePageResources } from '../utils/performance/resourceMonitor';

function MyApp({ Component, pageProps }: AppProps) {
  // Monitor for JavaScript errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        console.error('JavaScript error captured:', event.error);
      });
    }
  }, []);

  // Initialiser le monitoring des performances
  useEffect(() => {
    // Initialiser la collecte des web vitals
    initWebVitals();
    
    // Analyser les ressources de la page
    analyzePageResources();
  }, []);

  return (
    <AuthProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
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
