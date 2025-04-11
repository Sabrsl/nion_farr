import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  Alert,
  AlertTitle,
  AlertIcon,
  Stack,
  Center,
  Icon
} from '@chakra-ui/react';
import Link from 'next/link';

export default function VerificationPendingPage() {
  const router = useRouter();
  const [emailFromQuery, setEmailFromQuery] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Récupérer l'email de la query ou du sessionStorage
    if (router.isReady) {
      const queryEmail = router.query.email as string;
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
      
      if (queryEmail) {
        setEmailFromQuery(queryEmail);
      } else if (pendingEmail) {
        setEmailFromQuery(pendingEmail);
      }
    }
  }, [router.isReady, router.query]);

  // Rediriger vers la page d'inscription si aucun email n'est stocké
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (!emailFromQuery && document) {
        router.push('/auth/register');
      }
    }, 1500);

    return () => clearTimeout(redirectTimeout);
  }, [emailFromQuery, router]);

  // Gérer le renvoi du code de vérification
  const handleResendVerification = async () => {
    if (!emailFromQuery) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailFromQuery }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResendSuccess(true);
      } else {
        setError(data.error || 'Une erreur est survenue lors de l\'envoi du code de vérification.');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
      setError('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!emailFromQuery) {
    return (
      <Container maxW="sm" mt={8} mb={8}>
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" textAlign="center">
          <Heading as="h2" size="md">Redirection en cours...</Heading>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="md" mt={8} mb={8}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md" textAlign="center">
        <Heading as="h1" size="lg" mb={4}>
          Vérification de compte requise
        </Heading>
        
        <Text mb={2}>
          Un lien de vérification a été envoyé à :
        </Text>
        <Text fontWeight="bold" color="blue.500" mb={6}>
          {emailFromQuery}
        </Text>
        
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Instructions</AlertTitle>
            <Text fontSize="sm">1. Vérifiez votre boîte de réception (et vos spams)</Text>
            <Text fontSize="sm">2. Cliquez sur le lien de confirmation dans l'email</Text>
            <Text fontSize="sm">3. Vous serez redirigé vers la page de connexion</Text>
          </Box>
        </Alert>
        
        {resendSuccess && (
          <Alert status="success" mb={6}>
            <AlertIcon />
            Un nouveau lien de vérification a été envoyé !
          </Alert>
        )}
        
        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }} justifyContent="center">
          <Button
            colorScheme="blue"
            onClick={handleResendVerification}
            isDisabled={isSubmitting}
          >
            Renvoyer le lien
          </Button>
          
          <Button
            variant="outline"
            as={Link}
            href="/auth/login"
          >
            Aller à la connexion
          </Button>
        </Stack>
      </Box>
    </Container>
  );
} 