import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiAlertTriangle, FiHome, FiSearch, FiRefreshCw, FiServer } from 'react-icons/fi/index.js';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { Button, Box, Heading, Text, Container, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react';

const ServiceUnavailablePage: NextPage = () => {
  const router = useRouter();
  const { reason } = router.query;
  
  const getTitle = () => {
    if (reason === 'deleted') return 'Ce service a été supprimé';
    if (reason === 'inactive') return 'Ce service est temporairement indisponible';
    return 'Service indisponible';
  };
  
  const getMessage = () => {
    if (reason === 'deleted') {
      return 'Le service que vous recherchez a été supprimé par son créateur ou par nos modérateurs.';
    }
    if (reason === 'inactive') {
      return 'Le service que vous recherchez est actuellement désactivé par son créateur et n\'est pas disponible pour le moment.';
    }
    return 'Le service que vous recherchez n\'est pas disponible actuellement.';
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Fonction pour tenter de corriger le problème
  const tryToFix = () => {
    // Nettoyer les valeurs problématiques du localStorage
    localStorage.removeItem('backendStatus');
    localStorage.removeItem('lastBackendCheck');
    
    // Mettre à jour les URLs vers Vercel
    localStorage.setItem('NEXT_PUBLIC_API_URL', 'https://nion-farr-backend.vercel.app/api');
    localStorage.setItem('NEXT_PUBLIC_APP_URL', 'https://nion-farr.vercel.app');
    
    // Rafraîchir la page
    window.location.reload();
  };

  // Injecter automatiquement le script de correction
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/fix-railway.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Vérifier le statut après 3 secondes et rafraîchir si corrigé
    const checkTimeout = setTimeout(() => {
      if (localStorage.getItem('backend_fixed') === 'true') {
        window.location.href = '/';
      }
    }, 3000);
    
    return () => clearTimeout(checkTimeout);
  }, []);

  return (
    <Layout
      title={`${getTitle()} | Nionfar`}
      description="Service indisponible ou supprimé sur Nionfar"
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Service temporairement indisponible | Nionfar</title>
        <meta name="description" content="Notre service est temporairement indisponible. Nous travaillons à résoudre ce problème dans les plus brefs délais." />
        
        {/* Script de correction automatique */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Correction automatique des références à Railway
              const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';
              const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';
              
              // Nettoyer le localStorage
              localStorage.removeItem('backendStatus');
              localStorage.removeItem('lastBackendCheck');
              
              // Mettre à jour les URLs
              localStorage.setItem('NEXT_PUBLIC_API_URL', VERCEL_API_URL);
              localStorage.setItem('NEXT_PUBLIC_APP_URL', 'https://nion-farr.vercel.app');
              localStorage.setItem('backend_fixed', 'true');
              
              // Tenter une redirection automatique après un délai
              setTimeout(() => {
                window.location.href = '/';
              }, 5000);
            `
          }}
        />
      </Head>
      
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <FiServer className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{getTitle()}</h1>
          
          <p className="mt-3 text-base text-gray-500">{getMessage()}</p>
          
          <div className="mt-8 space-y-4">
            <Link
              href="/explorer"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiSearch className="mr-2 h-5 w-5" />
              Explorer d'autres services
            </Link>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiHome className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceUnavailablePage; 