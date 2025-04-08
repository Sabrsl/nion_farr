import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Paper, CircularProgress, Button, Box, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline.js';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline.js';

export default function VerifyPage() {
  const router = useRouter();
  const { email, code } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre compte...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email || !code) {
      setStatus('error');
      setError('Paramètres de vérification manquants');
      return;
    }

    const verifyAccount = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Votre compte a été vérifié avec succès');
          
          // Stockage du token dans le localStorage
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          
          // Redirection automatique vers la page d'accueil après 3 secondes
          setTimeout(() => {
            router.push(data.redirectTo || '/');
          }, 3000);
        } else {
          setStatus('error');
          setError(data.error || 'Échec de la vérification');
        }
      } catch (error) {
        setStatus('error');
        setError('Une erreur est survenue lors de la vérification de votre compte');
        console.error('Erreur de vérification:', error);
      }
    };

    verifyAccount();
  }, [email, code, router]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vérification du compte
        </Typography>

        {status === 'loading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="body1">{message}</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ my: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Compte vérifié !
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Vous allez être redirigé automatiquement vers la page d'accueil...
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Aller à l'accueil
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ my: 4 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Échec de la vérification
            </Typography>
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => router.push('/auth/login')}
              sx={{ mr: 2 }}
            >
              Se connecter
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/auth/register')}
            >
              S'inscrire
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 