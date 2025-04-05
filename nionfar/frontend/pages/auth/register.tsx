import React, { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiAlertCircle, FiCheckCircle, FiUser, FiBriefcase, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import { authService } from '../../services/authService';

type UserRole = 'client' | 'freelance';

const Register: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<UserRole>('client');

  // Validation des champs
  const validateForm = useCallback(() => {
    // Réinitialiser les erreurs
    setError('');

    // Vérifier l'acceptation des termes
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales d\'utilisation.');
      return false;
    }

    // Vérifier les champs obligatoires
    if ((!email && !phone) || !password || !username || !fullName) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return false;
    }

    // Validation de l'email si fourni
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }

    // Validation du téléphone si fourni
    if (phone && !phone.match(/^[0-9]{9,10}$/)) {
      setError('Veuillez entrer un numéro de téléphone valide (9-10 chiffres).');
      return false;
    }

    // Validation du mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }

    // Vérification de la concordance des mots de passe
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }

    // Validation du nom d'utilisateur (alphanumériques + quelques caractères spéciaux)
    if (!username.match(/^[a-zA-Z0-9._-]{3,20}$/)) {
      setError('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, ., _, -).');
      return false;
    }

    return true;
  }, [email, phone, password, confirmPassword, username, fullName, acceptTerms]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Valider le formulaire
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        username,
        email: email || undefined,
        phone: phone || undefined,
        password,
        fullName,
        acceptTerms,
        role: userType
      });

      if (response.success) {
        setSuccess('Inscription réussie!');
        
        if (phone) {
          // Si un numéro de téléphone est fourni, redirection vers la page de vérification OTP
          setTimeout(() => {
            router.push({
              pathname: '/auth/verify-otp',
              query: { phone }
            });
          }, 1000);
        } else {
          // Redirection vers le tableau de bord après un court délai
          setTimeout(() => {
            const redirectPath = userType === 'client' ? '/dashboard/client' : '/dashboard/freelance';
            router.push(redirectPath);
          }, 1000);
        }
      } else {
        setError(response.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setError(error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h2 className="text-center text-3xl font-extrabold text-indigo-600">
              NionFar<span className="text-violet-500">.sn</span>
            </h2>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Type d'utilisateur */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('client')}
              className={`relative py-3 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                userType === 'client'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FiUser className="h-5 w-5 mr-2" />
                <span>Client</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('freelance')}
              className={`relative py-3 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                userType === 'freelance'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FiBriefcase className="h-5 w-5 mr-2" />
                <span>Freelance</span>
              </div>
            </button>
          </div>

          {/* Nom complet */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Prénom et nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="nom_utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email {!phone && <span className="text-red-500">*</span>}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone {!email && <span className="text-red-500">*</span>}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="775555555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <Link
                href="/terms"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                target="_blank"
              >
                conditions générales d'utilisation
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </div>
              ) : (
                'Créer un compte'
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          En vous inscrivant, vous acceptez notre {' '}
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
            politique de confidentialité
          </Link>
          {' '} et nos {' '}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
            conditions d'utilisation
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;