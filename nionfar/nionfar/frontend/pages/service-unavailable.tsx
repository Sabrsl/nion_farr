import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiAlertTriangle, FiHome, FiSearch } from 'react-icons/fi/index.js';
import Link from 'next/link';
import Layout from '../components/layout/Layout';

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

  return (
    <Layout
      title={`${getTitle()} | Nionfar`}
      description="Service indisponible ou supprimé sur Nionfar"
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <FiAlertTriangle className="h-8 w-8 text-red-600" />
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