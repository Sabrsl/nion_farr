import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Paper, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Lien invalide
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Le lien de réinitialisation est invalide ou a expiré.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/auth/forgot-password')}
          >
            Demander un nouveau lien
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {status === 'form' && (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LockResetIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Réinitialisation du mot de passe
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Veuillez entrer votre nouveau mot de passe
              </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
              />
              
              <PasswordStrengthMeter 
                password={password} 
                onScoreChange={setPasswordScore}
              />
              
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Confirmer le mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isSubmitting}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting || passwordScore < 2}
                sx={{ mt: 3, mb: 2 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          </>
        )}
        
        {status === 'success' && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Mot de passe réinitialisé
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Vous allez être redirigé automatiquement vers la page d'accueil...
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/')}
            >
              Aller à l'accueil
            </Button>
          </Box>
        )}
        
        {status === 'error' && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Échec de la réinitialisation
            </Typography>
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {message}
            </Typography>
            {message.includes('expiré') ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push('/auth/forgot-password')}
              >
                Demander un nouveau lien
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setStatus('form')}
              >
                Réessayer
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
} 