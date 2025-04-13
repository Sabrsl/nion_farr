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
import Head from 'next/head';

// Déclarer les propriétés globales
declare global {
  interface Window {
    __redirectTo: (url: string) => void;
    forceRedirect: (url: string) => void;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  // Monitor for JavaScript errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        console.error('JavaScript error captured:', event.error);
      });
    }
  }, []);

  // Gérer les redirections et l'état d'authentification au niveau de l'application
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fonction pour traiter les paramètres de redirection
      const handleRedirectParams = () => {
        // Vérifier s'il y a des paramètres indiquant une authentification réussie
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParam = urlParams.get('_auth') === '1' || urlParams.get('auth_success') === 'true';
        
        // Vérifier si un formulaire a été soumis avec des données d'authentification
        const authInput = document.querySelector('input[name="auth_success"]');
        const hasAuthElement = authInput instanceof HTMLInputElement && authInput.value === 'true';
        
        if (hasAuthParam || hasAuthElement) {
          console.log('🔒 Authentification détectée dans _app.tsx');
          
          // Nettoyer l'URL des paramètres de redirection
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          // Forcer la mise à jour des composants d'authentification
          localStorage.setItem('auth_updated', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
        }
      };
      
      // Exécuter immédiatement
      handleRedirectParams();
      
      // Ajouter une fonction globale pour forcer les redirections
      window.__redirectTo = (url: string) => {
        console.log(`🌍 Redirection globale vers: ${url}`);
        
        // 1. Essayer avec window.location.replace
        try {
          window.location.replace(url);
        } catch (error) {
          console.error('Échec de window.location.replace:', error);
          
          // 2. Essayer avec une balise form (plus fiable)
          try {
            const form = document.createElement('form');
            form.method = 'GET';
            form.action = url;
            document.body.appendChild(form);
            form.submit();
          } catch (formError) {
            console.error('Échec de la redirection par formulaire:', formError);
            
            // 3. Dernier recours
            window.location.href = url;
          }
        }
      };
      
      // Exposer la fonction pour les autres composants
      window.forceRedirect = window.__redirectTo;
    }
  }, []);

  // Initialiser le monitoring des performances
  useEffect(() => {
    // Initialiser la collecte des web vitals
    initWebVitals();
    
    // Analyser les ressources de la page
    analyzePageResources();
  }, []);

  // Détection et correction des problèmes de backend
  useEffect(() => {
    // Fonction pour détecter un problème de connexion au backend
    const detectBackendIssue = () => {
      if (typeof window === 'undefined') return false;
      
      // Vérifier le statut stocké du backend
      const backendStatus = localStorage.getItem('backendStatus');
      
      // Vérifier si un correctif a déjà été appliqué
      const alreadyFixed = localStorage.getItem('backend_fixed') === 'true';
      
      // Si le backend est marqué comme offline et que le correctif n'a pas été appliqué
      return backendStatus === 'offline' && !alreadyFixed;
    };
    
    // Fonction pour injecter le script de correction
    const injectFixScript = () => {
      console.log('🔧 Injection du script de correction Railway...');
      const script = document.createElement('script');
      script.src = '/fix-railway.js';
      script.async = true;
      document.head.appendChild(script);
    };
    
    // Si un problème est détecté, injecter le script de correction
    if (detectBackendIssue()) {
      injectFixScript();
    }
  }, []);

  return (
    <>
      <Head>
        {/* Meta tags existantes */}
        
        {/* Script de correction pour les problèmes de backend */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Vérifier si le backend est inaccessible
              if (localStorage.getItem('backendStatus') === 'offline' && !localStorage.getItem('backend_fixed')) {
                console.log('⚠️ Problème de backend détecté, chargement du correctif...');
                const script = document.createElement('script');
                script.src = '/fix-railway.js';
                script.async = true;
                document.head.appendChild(script);
              }
            `
          }}
        />
      </Head>
      
      <AuthProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthProvider>
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
    </>
  );
}

export default MyApp;
