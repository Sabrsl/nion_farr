import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiCheck, 
  FiChevronLeft, 
  FiUserPlus, 
  FiEye, 
  FiEyeOff 
} from 'react-icons/fi/index.js';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { authService } from '../services/authService';

const Register: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    termsAccepted: false,
    accountType: 'freelance' as 'freelance' | 'client', // Par défaut: freelance
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectAccountType = (type: 'freelance' | 'client') => {
    setFormData(prev => ({
      ...prev,
      accountType: type
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validation simple pour le premier formulaire
      if (currentStep === 1) {
        if (!formData.firstName || !formData.lastName || !formData.email) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires.');
          return;
        }
        // Validation basique d'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setErrorMessage('Veuillez entrer une adresse email valide.');
          return;
        }
      }
      setErrorMessage('');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validation de base
    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMessage('Vous devez accepter les conditions d\'utilisation.');
      setIsLoading(false);
      return;
    }

    // Validation de la force du mot de passe
    if (formData.password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.');
      setIsLoading(false);
      return;
    }
    
    // Validation des critères de complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setErrorMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.');
      setIsLoading(false);
      return;
    }

    try {
      // Préparation des données pour l'inscription en adaptant au format attendu par le backend
      const registrationData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        termsAccepted: formData.termsAccepted,
        role: formData.accountType as 'client' | 'provider'
      };

      console.log('Données d\'inscription envoyées:', registrationData);

      // Appel au service d'authentification pour l'inscription
      const response = await authService.register({
        username: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`,
        email: formData.email,
        phone: formData.phoneNumber || undefined,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`,
        acceptTerms: formData.termsAccepted,
        role: formData.accountType as 'client' | 'provider'
      });

      if (response.success) {
        setSuccessMessage('Inscription réussie! Vous allez être redirigé...');
        // L'utilisateur sera redirigé automatiquement par le service d'auth
      } else {
        setErrorMessage(response.error || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      // Gestion d'erreur plus détaillée
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Une erreur est survenue lors de l\'inscription.');
      } else {
        setErrorMessage('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    // Récupérer le type à partir de l'URL si disponible
    if (router.query.type) {
      const accountType = router.query.type === 'freelance' ? 'freelance' : 'client';
      setFormData(prev => ({
        ...prev,
        accountType: accountType as 'freelance' | 'client'
      }));
    }
  }, [router.query.type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-purple-300 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
      </div>

      <Head>
        <title>Inscription | NionFar.sn</title>
        <meta name="description" content="Créez votre compte NionFar pour proposer ou acheter des services freelance au Sénégal." />
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
            Créer un compte
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
          className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          {/* Progress indicator */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-4/5 sm:w-2/3 flex items-center">
              {[...Array(totalSteps)].map((_, index) => (
                <div key={index} className="flex-1 flex items-center">
                  <div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                      index + 1 <= currentStep 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/50 backdrop-blur-sm text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`h-1 flex-1 ${
                      index + 1 < currentStep ? 'bg-indigo-600' : 'bg-white/30'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div 
            id="register-card"
            className="bg-white/85 backdrop-blur-xl py-6 sm:py-8 px-4 shadow-2xl rounded-xl sm:px-8 border border-white/20 transition-all duration-300 mx-auto w-full"
          >
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="mb-5 sm:mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md p-3 sm:p-4 flex items-start"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-5 sm:mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md p-3 sm:p-4 flex items-start"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{successMessage}</p>
                </div>
              </motion.div>
            )}

            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Choisissez votre type de compte</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div 
                        className={`cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center relative ${formData.accountType === 'freelance' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                        onClick={() => handleSelectAccountType('freelance')}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 sm:mb-3">
                          <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">Freelance</h4>
                          <p className="text-xs text-gray-500 mt-1">Je souhaite offrir mes services</p>
                        </div>
                        {formData.accountType === 'freelance' && (
                          <div className="absolute top-2 right-2 text-indigo-600">
                            <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </div>
                      <div 
                        className={`cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center relative ${formData.accountType === 'client' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                        onClick={() => handleSelectAccountType('client')}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 sm:mb-3">
                          <FiUserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">Client</h4>
                          <p className="text-xs text-gray-500 mt-1">Je cherche des services</p>
                        </div>
                        {formData.accountType === 'client' && (
                          <div className="absolute top-2 right-2 text-indigo-600">
                            <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                          placeholder="Nom"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Numéro de téléphone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                        placeholder="+221 XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="group relative flex justify-center py-2.5 sm:py-3 px-5 sm:px-6 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      Continuer
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
                        >
                          {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        className="pl-10 appearance-none block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-base"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
                        >
                          {showPasswordConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="termsAccepted"
                          name="termsAccepted"
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-150"
                        />
                      </div>
                      <div className="ml-3 text-xs sm:text-sm">
                        <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                          J'accepte les{' '}
                          <Link href="/conditions" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            conditions d'utilisation
                          </Link>{' '}
                          et la{' '}
                          <Link href="/confidentialite" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            politique de confidentialité
                          </Link>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2.5 sm:py-3 px-5 sm:px-6 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`group relative flex justify-center py-2.5 sm:py-3 px-5 sm:px-6 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {/* Floating features badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-md py-2 px-4 rounded-full shadow-lg text-xs text-gray-700 hidden sm:flex items-center"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        NionFar - La plateforme leader du freelancing au Sénégal
      </motion.div>
    </div>
  );
};

export default Register; 