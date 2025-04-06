import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Paper, Box, Button, Alert, AlertTitle } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EmailIcon from '@mui/icons-material/Email';
import Link from 'next/link';

export default function VerificationPendingPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'email stocké lors de l'inscription
    const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  // Rediriger vers la page d'inscription si aucun email n'est stocké
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (!email && document) {
        router.push('/auth/register');
      }
    }, 1500);

    return () => clearTimeout(redirectTimeout);
  }, [email, router]);

  // Gérer le renvoi du code de vérification
  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Un nouveau code de vérification a été envoyé à votre adresse email.');
      } else {
        alert(data.error || 'Une erreur est survenue lors de l\'envoi du code de vérification.');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
      alert('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.');
    }
  };

  if (!email) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">Redirection en cours...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <MarkEmailReadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom align="center">
            Vérifiez votre email
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Un email de confirmation a été envoyé à :
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold" align="center" sx={{ mb: 2 }}>
            {email}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>Instructions</AlertTitle>
          <Typography variant="body2">
            1. Vérifiez votre boîte de réception (et éventuellement vos spams)
          </Typography>
          <Typography variant="body2">
            2. Cliquez sur le lien de confirmation dans l'email
          </Typography>
          <Typography variant="body2">
            3. Vous serez redirigé vers la page de connexion une fois votre compte vérifié
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<EmailIcon />}
            onClick={handleResendCode}
            fullWidth
          >
            Renvoyer l'email de confirmation
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            href="/auth/login"
            fullWidth
          >
            Aller à la page de connexion
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 