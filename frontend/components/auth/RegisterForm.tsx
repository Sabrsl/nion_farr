import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiCheck,
  FiUserPlus, 
  FiEye, 
  FiEyeOff,
  FiArrowRight
} from 'react-icons/fi';
import { authService } from '../../services/authService';
import PasswordStrengthMeter from './PasswordStrengthMeter';

interface RegisterFormProps {
  defaultAccountType?: 'freelance' | 'client';
}

const RegisterForm: React.FC<RegisterFormProps> = ({ defaultAccountType = 'client' }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    termsAccepted: false,
    accountType: defaultAccountType as 'freelance' | 'client',
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
      // Appel au service d'authentification pour l'inscription
      const response = await authService.register({
        username: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`,
        email: formData.email,
        phone: formData.phoneNumber || undefined,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`,
        acceptTerms: formData.termsAccepted,
        role: formData.accountType
      });

      if (response.success) {
        setSuccessMessage('Inscription réussie! Vous allez être redirigé...');
        // L'utilisateur sera redirigé automatiquement par le service d'auth
      } else {
        setErrorMessage(response.error || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Une erreur est survenue lors de l\'inscription.');
      } else {
        setErrorMessage('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800">Type de compte</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectAccountType('client')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center justify-center border-2 transition-all hover:shadow-md ${
              formData.accountType === 'client'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">Client</span>
            <span className="text-xs mt-1 text-center opacity-70">Commander des services</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSelectAccountType('freelance')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center justify-center border-2 transition-all hover:shadow-md ${
              formData.accountType === 'freelance'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12.2H15" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16.2H12.38" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">Freelance</span>
            <span className="text-xs mt-1 text-center opacity-70">Proposer des services</span>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
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
            required
            value={formData.email}
            onChange={handleChange}
            className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="votre@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nom"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Téléphone (facultatif)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPhone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="+221 XX XXX XX XX"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Nous vous recommandons d'ajouter votre numéro pour des fonctionnalités supplémentaires
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Suivant
          <FiArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
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
            className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <PasswordStrengthMeter 
          password={formData.password} 
          onScoreChange={(score) => {
            // Optionnel: faire quelque chose avec le score si nécessaire
            console.log('Password strength score:', score);
          }} 
        />
      </div>

      <div>
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
            className={`pl-10 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formData.password !== formData.passwordConfirm && formData.passwordConfirm
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPasswordConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {formData.password !== formData.passwordConfirm && formData.passwordConfirm && (
          <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="termsAccepted" className="font-medium text-gray-700">
            J'accepte les <a href="/conditions" className="text-indigo-600 hover:text-indigo-500">conditions d'utilisation</a> et la <a href="/confidentialite" className="text-indigo-600 hover:text-indigo-500">politique de confidentialité</a> <span className="text-red-500">*</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between space-x-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <FiUserPlus className="mr-2" />
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md bg-red-50 p-4 border-l-4 border-red-400"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Une erreur est survenue</h3>
              <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
            </div>
          </div>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md bg-green-50 p-4 border-l-4 border-green-400"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Inscription réussie</h3>
              <div className="mt-2 text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
        </div>
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </form>
  );
};

export default RegisterForm; 