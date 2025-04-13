import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (router.isReady && token) {
      verifyToken(token as string);
    }
  }, [router.isReady, token]);

  const verifyToken = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Votre compte a été vérifié avec succès !');
        
        // Redirection automatique vers la connexion après 3 secondes
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Le lien de vérification est invalide ou a expiré.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setStatus('error');
      setMessage('Une erreur est survenue lors de la communication avec le serveur.');
    }
  };

  return (
    <Container maxW="md" mt={8} mb={8}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md" textAlign="center">
        {status === 'loading' && (
          <>
            <Heading as="h1" size="lg" mb={4}>
              Vérification en cours...
            </Heading>
            <Center my={8}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
            <Text mb={4}>
              Nous sommes en train de vérifier votre compte...
            </Text>
          </>
        )}
        
        {status === 'success' && (
          <>
            <Heading as="h1" size="lg" mb={4}>
              Vérification réussie !
            </Heading>
            
            <Alert status="success" mb={6}>
              <AlertIcon />
              {message}
            </Alert>
            
            <Text mb={6}>
              Vous allez être redirigé vers la page de connexion automatiquement...
            </Text>
            
            <div className="text-center mt-8">
              <p className="mb-4 text-gray-600">
                Vous pouvez maintenant vous connecter avec votre compte vérifié.
              </p>
              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Se connecter
              </Link>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <Heading as="h1" size="lg" mb={4}>
              Échec de la vérification
            </Heading>
            
            <Alert status="error" mb={6}>
              <AlertIcon />
              {message}
            </Alert>
            
            <div className="text-center mt-8">
              <p className="mb-4 text-gray-600">
                Vous pouvez réessayer de vérifier votre compte ultérieurement.
              </p>
              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Se connecter
              </Link>
            </div>
          </>
        )}
      </Box>
    </Container>
  );
} 