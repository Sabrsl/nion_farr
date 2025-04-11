import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layouts/AdminLayout';
import PerformanceDashboard from '../../components/performance/PerformanceDashboard';
import { initPerformanceMonitoring } from '../../utils/performance';
import Head from 'next/head';

/**
 * Page d'administration des performances de la plateforme
 */
const AdminPerformancePage: NextPage = () => {
  const router = useRouter();

  // Initialiser le monitoring des performances
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title>Performances | Admin NionFar</title>
      </Head>
      
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Analyse des performances</h1>
          
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin/performances/settings')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Paramètres
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Actualiser
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-8">
          Analysez les performances de la plateforme et identifiez les pages et ressources à optimiser pour améliorer l'expérience utilisateur.
        </p>
        
        <div className="space-y-6">
          {/* Tableau de bord de performances */}
          <PerformanceDashboard />
          
          {/* Conseils d'optimisation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommandations d'optimisation</h2>
            
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex">
                <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Utilisez la compression d'images avec Next.js Image pour réduire la taille des images jusqu'à 80%.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Implémentez le chargement paresseux (lazy loading) pour les éléments sous la ligne de flottaison.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Utilisez la mise en cache côté serveur pour les requêtes API fréquemment utilisées.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Implémentez la génération statique incrémentale (ISR) pour les pages à faible fréquence de mise à jour.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Optimisez le bundle JavaScript avec le code splitting et le chargement dynamique des composants.</span>
              </li>
            </ul>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <a 
                href="https://nextjs.org/docs/advanced-features/measuring-performance" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Documentation Next.js sur l'optimisation des performances →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPerformancePage; 