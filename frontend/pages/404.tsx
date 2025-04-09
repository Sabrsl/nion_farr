import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiHome } from 'react-icons/fi/index.js';

const NotFound: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>Page non trouvée | NionFar.sn</title>
        <meta name="description" content="Page non trouvée" />
      </Head>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
          <div className="w-16 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-medium text-gray-800 mb-4">Page non trouvée</h2>
          <p className="text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
              <FiHome className="mr-2" />
              Retour à l'accueil
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" />
              Page précédente
            </button>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} NionFar. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default NotFound; 