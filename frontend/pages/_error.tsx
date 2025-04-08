import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

const Error: NextPage<ErrorProps> = ({ statusCode, message }) => {
  const errorMessage = message || 
    (statusCode === 404 
      ? 'Cette page n\'existe pas' 
      : 'Une erreur s\'est produite');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>{statusCode ? `${statusCode}: Erreur` : 'Erreur'} | NionFar.sn</title>
      </Head>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">{statusCode || 'Erreur'}</h1>
          <div className="w-16 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-medium text-gray-800 mb-4">{errorMessage}</h2>
          <p className="text-gray-600 mb-8">
            Nous vous invitons à retourner à l'accueil ou à réessayer plus tard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Retour à l'accueil
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Réessayer
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 