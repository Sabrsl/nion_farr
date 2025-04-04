import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect } from 'react';
import schedulerService from '../services/schedulerService';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  // Démarrer le service de planification
  useEffect(() => {
    // Démarrer le service uniquement côté client
    if (typeof window !== 'undefined') {
      schedulerService.start();
    }

    // Nettoyer lors du démontage du composant
    return () => {
      if (typeof window !== 'undefined') {
        schedulerService.stop();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>NionFar</title>
        </Head>
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
          theme="light"
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp; 