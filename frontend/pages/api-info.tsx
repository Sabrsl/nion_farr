import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ApiInfo() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [storedApiUrl, setStoredApiUrl] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // URL correcte de l'API
  const correctApiUrl = 'https://nionfar-backend.onrender.com/api';
  
  useEffect(() => {
    setIsClient(true);
    
    // Lire l'URL de l'API stockée
    if (typeof window !== 'undefined') {
      setStoredApiUrl(localStorage.getItem('NEXT_PUBLIC_API_URL'));
    }
  }, []);
  
  // Fonction pour corriger l'URL de l'API
  const fixApiUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('NEXT_PUBLIC_API_URL', correctApiUrl);
      setStoredApiUrl(correctApiUrl);
      
      // Exécuter le script fix-api-urls.js
      const script = document.createElement('script');
      script.src = '/fix-api-urls.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Démarrer le compte à rebours pour la redirection
      setIsRedirecting(true);
      let count = 5;
      
      const intervalId = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count <= 0) {
          clearInterval(intervalId);
          router.push('/auth/login');
        }
      }, 1000);
    }
  };
  
  return (
    <>
      <Head>
        <title>Informations sur l'API | NionFar</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="mx-auto h-16 w-auto" src="/logo.png" alt="NionFar" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuration de l'API
          </h2>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isRedirecting ? (
              <div className="text-center">
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Configuration réussie!</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>L'URL de l'API a été mise à jour avec succès.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-lg">Redirection dans <span className="font-bold">{countdown}</span> secondes...</p>
                <p className="mt-4 text-sm text-gray-500">Vous allez être redirigé vers la page de connexion</p>
              </div>
            ) : (
              <>
                <div className="rounded-md bg-yellow-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Information importante</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Cette page permet de corriger les problèmes de connexion liés à l'API.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Statut actuel</h3>
                <p className="mb-4">URL de l'API stockée : {isClient ? (
                  <code className={`px-2 py-1 rounded ${storedApiUrl === correctApiUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {storedApiUrl || 'Non définie'}
                  </code>
                ) : 'Chargement...'}</p>
                
                <h3 className="text-lg font-medium mb-2 mt-6">URL correcte</h3>
                <p className="mb-6">
                  <code className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    {correctApiUrl}
                  </code>
                </p>
                
                {isClient && storedApiUrl !== correctApiUrl && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={fixApiUrl}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Corriger l'URL de l'API
                    </button>
                  </div>
                )}
                
                {isClient && storedApiUrl === correctApiUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-green-700 mb-4">✅ L'URL de l'API est correctement configurée.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/auth/login')}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Retour à la page de connexion
                    </button>
                  </div>
                )}
              </>
            )}
            
            <div className="mt-6">
              <p className="text-xs text-center text-gray-500">
                Si vous continuez à rencontrer des problèmes, veuillez contacter le support technique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 