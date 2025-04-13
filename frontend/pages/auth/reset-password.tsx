import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Heading,
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Stack,
  Center
} from '@chakra-ui/react';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';

// Page de réinitialisation de mot de passe
export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);

  // Récupérer le jeton CSRF au chargement de la page
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        // Essayer d'abord via le proxy local
        const response = await fetch('/api/security/csrf-tokens', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('csrf_token', data.token);
            console.log('✅ Token CSRF récupéré avec succès');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du token CSRF:', error);
      }
    }
    
    fetchCsrfToken();
  }, []);

  // Vérifier si un token est présent
  useEffect(() => {
    if (!token && router.isReady) {
      setStatus('error');
      setMessage('Token de réinitialisation manquant');
    }
  }, [token, router.isReady]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password) {
      newErrors.password = 'Veuillez entrer un mot de passe';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Récupérer le jeton CSRF du localStorage
      const csrfToken = localStorage.getItem('csrf_token');
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Votre mot de passe a été réinitialisé avec succès');
        
        // Redirection automatique vers la page d'accueil après 3 secondes
        setTimeout(() => {
          router.push(data.redirectTo || '/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue lors de la réinitialisation du mot de passe');
        
        // Mettre à jour les erreurs de champ si renvoyées par l'API
        if (data.details) {
          setErrors(data.details);
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue lors de la communication avec le serveur');
      console.error('Erreur de réinitialisation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si le token est manquant
  if (!token && router.isReady) {
    return (
      <Container maxW="sm" mt={8} mb={8}>
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" textAlign="center">
          <Heading as="h1" size="lg" mb={2}>
            Lien invalide
          </Heading>
          <Text mb={6}>
            Le lien de réinitialisation est invalide ou a expiré.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/auth/forgot-password')}
          >
            Demander un nouveau lien
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="sm" mt={8} mb={8}>
      <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
        {status === 'form' && (
          <>
            <Box textAlign="center" mb={6}>
              <Heading as="h1" size="lg" mb={2}>
                Réinitialisation du mot de passe
              </Heading>
              <Text color="gray.600">
                Veuillez entrer votre nouveau mot de passe
              </Text>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.password} mb={4}>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  isDisabled={isSubmitting}
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <PasswordStrengthMeter 
                password={password} 
                onScoreChange={setPasswordScore}
              />
              
              <FormControl isInvalid={!!errors.confirmPassword} mb={4}>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  isDisabled={isSubmitting}
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isDisabled={isSubmitting || passwordScore < 2}
                mt={4}
                mb={2}
              >
                {isSubmitting ? (
                  <Spinner size="sm" />
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          </>
        )}
        
        {status === 'success' && (
          <Box textAlign="center" my={4}>
            <Heading as="h1" size="lg" mb={2}>
              Mot de passe réinitialisé
            </Heading>
            <Text mb={6}>
              {message}
            </Text>
            <Alert status="info" mb={6}>
              <AlertIcon />
              Vous allez être redirigé automatiquement vers la page d'accueil...
            </Alert>
            <Button 
              colorScheme="blue" 
              onClick={() => router.push('/')}
            >
              Aller à l'accueil
            </Button>
          </Box>
        )}
        
        {status === 'error' && (
          <Box textAlign="center" my={4}>
            <Heading as="h1" size="lg" mb={2}>
              Échec de la réinitialisation
            </Heading>
            <Text color="red.500" mb={6}>
              {message}
            </Text>
            {message.includes('expiré') ? (
              <Button 
                colorScheme="blue" 
                onClick={() => router.push('/auth/forgot-password')}
              >
                Demander un nouveau lien
              </Button>
            ) : (
              <Button 
                colorScheme="blue" 
                onClick={() => setStatus('form')}
              >
                Réessayer
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
} 