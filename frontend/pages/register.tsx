import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft } from 'react-icons/fi/index.js';
import { useRouter } from 'next/router';
import RegisterForm from '../components/auth/RegisterForm';

const Register: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const accountType = (type === 'freelance' || type === 'client') ? type : 'client';
  const [isRegistered, setIsRegistered] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Détecteur d'inscription réussie
  useEffect(() => {
    // Vérifier dans un intervalle plus rapide et fiable
    const intervalId = setInterval(() => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const user = localStorage.getItem('nionfarUser');
        
        if (user) {
          console.log('👤 Utilisateur détecté dans register.tsx');
          setIsRegistered(true);
          
          let countdown = 5;
          // Compte à rebours avant redirection forcée
          const countdownId = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
            
            if (countdown <= 0) {
              clearInterval(countdownId);
              try {
                console.log('⏱️ Compte à rebours terminé, redirection forcée');
                window.location.replace('/');
              } catch (error) {
                console.error('Erreur lors de la redirection forcée:', error);
                document.location.href = '/';
              }
            }
          }, 1000);
          
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
      }
    }, 100); // Vérifier toutes les 100ms
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Pour ajouter un effet de glassmorphism au scroll
    const handleScroll = () => {
      const registerCard = document.getElementById('register-card');
      if (registerCard) {
        const scrollY = window.scrollY;
        const opacity = Math.min(0.85 + scrollY * 0.001, 0.95);
        registerCard.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Si l'utilisateur est inscrit, afficher un message de chargement
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex flex-col justify-center items-center py-8 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center text-white max-w-md px-6 py-8 bg-indigo-900/30 backdrop-blur-md rounded-xl shadow-xl border border-white/10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-2">Inscription réussie!</h1>
          <p className="mb-6">Vous êtes maintenant inscrit sur notre plateforme.</p>
          
          <div className="mb-6">
            <div className="inline-block w-10 h-10 rounded-full border-4 border-t-white border-r-white border-l-white border-b-transparent animate-spin"></div>
          </div>
          
          <p>Redirection vers la page d'accueil dans <span className="font-bold text-xl">{redirectCountdown}</span> secondes...</p>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Accéder maintenant
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex flex-col justify-center py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-purple-300 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
      </div>

      <Head>
        <title>Inscription | NionFar.sn</title>
        <meta name="description" content="Créez votre compte NionFar pour commencer à utiliser nos services freelance au Sénégal." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="relative z-10 w-full px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-xl sm:text-2xl font-bold text-white hover:opacity-90 transition-opacity">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mr-2 text-white"
              >
                <FiChevronLeft className="inline-block" />
              </motion.span>
              <span>
                NionFar<span className="text-indigo-200">.sn</span>
              </span>
            </Link>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white"
          >
            Créez votre compte
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-center text-sm sm:text-base text-indigo-100"
          >
            Ou{' '}
            <Link href="/login" className="font-medium text-white hover:text-indigo-200 transition-colors underline">
              connectez-vous à votre compte existant
            </Link>
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div 
            id="register-card"
            className="bg-white/85 backdrop-blur-xl py-6 sm:py-8 px-4 shadow-xl rounded-xl sm:px-8 border border-white/20 transition-all duration-300 mx-auto w-full"
          >
            <RegisterForm defaultAccountType={accountType as 'freelance' | 'client'} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 