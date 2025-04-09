import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi/index.js';

interface ServerStatus {
  status: 'online' | 'offline' | 'checking';
  timestamp: string;
  error?: string;
  details?: any;
}

const StatusPage: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'checking',
    timestamp: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkServerStatus = async () => {
    setIsLoading(true);
    setServerStatus({
      status: 'checking',
      timestamp: new Date().toISOString()
    });
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';
      console.log('Vérification du statut du serveur à:', backendUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus({
          status: 'online',
          timestamp: new Date().toISOString(),
          details: data
        });
        
        localStorage.setItem('backendStatus', 'online');
        localStorage.setItem('lastBackendCheck', new Date().toISOString());
        console.log('✅ Serveur backend en ligne:', data);
      } else {
        setServerStatus({
          status: 'offline',
          timestamp: new Date().toISOString(),
          error: `Code d'erreur: ${response.status} - ${response.statusText}`
        });
        
        localStorage.setItem('backendStatus', 'offline');
        localStorage.setItem('lastBackendCheck', new Date().toISOString());
        console.error('❌ Serveur backend hors ligne:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      setServerStatus({
        status: 'offline',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      
      localStorage.setItem('backendStatus', 'offline');
      localStorage.setItem('lastBackendCheck', new Date().toISOString());
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier le statut au chargement de la page
  useEffect(() => {
    checkServerStatus();
  }, []);

  return (
    <>
      <Head>
        <title>Statut du Système | NionFar</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-semibold text-gray-900">Statut du Système</h1>
              
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Serveur backend</h2>
                  <button
                    onClick={checkServerStatus}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Vérifier
                  </button>
                </div>
                
                <div className="mt-4">
                  {serverStatus.status === 'checking' && (
                    <div className="flex items-center text-gray-500">
                      <FiRefreshCw className="animate-spin mr-2" />
                      Vérification en cours...
                    </div>
                  )}
                  
                  {serverStatus.status === 'online' && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Le serveur est en ligne et fonctionne correctement
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Dernière vérification: {new Date(serverStatus.timestamp).toLocaleString()}</p>
                            {serverStatus.details && (
                              <div className="mt-2 overflow-auto max-h-64 border border-green-200 rounded p-2 bg-white">
                                <pre className="text-xs">{JSON.stringify(serverStatus.details, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {serverStatus.status === 'offline' && (
                    <div className="bg-red-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Le serveur est hors ligne ou inaccessible
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Dernière vérification: {new Date(serverStatus.timestamp).toLocaleString()}</p>
                            {serverStatus.error && (
                              <p className="mt-1">
                                <span className="font-medium">Erreur:</span> {serverStatus.error}
                              </p>
                            )}
                            <div className="mt-4">
                              <p className="font-medium">Que faire ?</p>
                              <ul className="list-disc list-inside mt-1">
                                <li>Vérifiez votre connexion internet</li>
                                <li>Si le problème persiste, il peut s'agir d'une maintenance temporaire</li>
                                <li>Contactez le support technique si le problème persiste plus de 30 minutes</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h2 className="text-lg font-medium text-gray-900">Informations système</h2>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL du backend</dt>
                    <dd className="mt-1 text-sm text-gray-900">{process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Environnement</dt>
                    <dd className="mt-1 text-sm text-gray-900">{process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL de l'application</dt>
                    <dd className="mt-1 text-sm text-gray-900">{process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Navigateur</dt>
                    <dd className="mt-1 text-sm text-gray-900">{typeof navigator !== 'undefined' ? navigator.userAgent : 'Non disponible'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusPage; 