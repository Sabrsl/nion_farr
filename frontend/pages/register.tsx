import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';
import RegisterForm from '../components/auth/RegisterForm';

const Register: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const accountType = (type === 'freelance' || type === 'client') ? type : 'client';

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