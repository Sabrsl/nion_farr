import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertTriangle, FiMail } from 'react-icons/fi/index.js';
import { authService } from '../services/authService';

const VerifyEmail: NextPage = () => {
  const router = useRouter();
  const { token, redirect } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Vérification de votre email...');

  useEffect(() => {
    // Ne pas vérifier tant que le token n'est pas disponible
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token as string);

        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Votre email a été vérifié avec succès');
          
          // Rediriger vers la page spécifiée ou le tableau de bord après 3 secondes
          setTimeout(() => {
            router.push(redirect as string || '/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.error || 'Échec de la vérification de l\'email');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification de votre email');
      }
    };

    verifyEmail();
  }, [token, redirect, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-300 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
      </div>

      <Head>
        <title>Vérification d'email | NionFar.sn</title>
        <meta name="description" content="Vérifiez votre email pour activer votre compte NionFar." />
      </Head>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-2xl font-bold text-white hover:opacity-90 transition-opacity">
            <span>NionFar<span className="text-indigo-200">.sn</span></span>
          </Link>
        </div>

        <div className="mt-8 bg-white/85 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-xl sm:px-10 border border-white/20">
          <div className="text-center">
            {status === 'loading' && (
              <div className="mb-4 flex justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
              </div>
            )}

            {status === 'success' && (
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <FiCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <FiAlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            )}

            <h2 className={`text-2xl font-bold ${
              status === 'loading' ? 'text-gray-700' : 
              status === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {status === 'loading' ? 'Vérification en cours' : 
               status === 'success' ? 'Vérification réussie' : 'Échec de la vérification'}
            </h2>

            <p className="mt-2 text-gray-600">{message}</p>

            {status === 'success' && (
              <p className="mt-4 text-sm text-gray-500">
                Vous allez être redirigé automatiquement...
              </p>
            )}

            {status === 'error' && (
              <div className="mt-6">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Retour à la page de connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail; 