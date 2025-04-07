import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface PasswordStrengthMeterProps {
  password: string;
  onScoreChange: (score: number) => void;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  onScoreChange 
}) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!password) {
      setScore(0);
      setFeedback('');
      onScoreChange(0);
      return;
    }

    // Évaluer la force du mot de passe
    let newScore = 0;
    let newFeedback = '';

    // Vérifier la longueur
    if (password.length >= 8) {
      newScore += 1;
    } else {
      newFeedback = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Vérifier les minuscules
    if (/[a-z]/.test(password)) {
      newScore += 1;
    } else if (!newFeedback) {
      newFeedback = 'Ajoutez au moins une lettre minuscule';
    }

    // Vérifier les majuscules
    if (/[A-Z]/.test(password)) {
      newScore += 1;
    } else if (!newFeedback) {
      newFeedback = 'Ajoutez au moins une lettre majuscule';
    }

    // Vérifier les chiffres
    if (/[0-9]/.test(password)) {
      newScore += 1;
    } else if (!newFeedback) {
      newFeedback = 'Ajoutez au moins un chiffre';
    }

    // Vérifier les caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) {
      newScore += 1;
    } else if (!newFeedback) {
      newFeedback = 'Ajoutez au moins un caractère spécial';
    }

    setScore(newScore);
    setFeedback(newFeedback);
    onScoreChange(newScore);
  }, [password, onScoreChange]);

  // Ne rien afficher si le champ est vide
  if (!password) {
    return null;
  }

  const getStrengthLabel = (score: number): string => {
    if (score <= 1) return 'Très faible';
    if (score === 2) return 'Faible';
    if (score === 3) return 'Moyen';
    if (score === 4) return 'Fort';
    return 'Très fort';
  };

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return 'error';
    if (score === 2) return 'warning';
    if (score === 3) return 'info';
    return 'success';
  };

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          Force du mot de passe: {getStrengthLabel(score)}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {score}/5
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={score * 20} 
        color={getStrengthColor(score) as 'error' | 'warning' | 'info' | 'success'}
        sx={{ height: 8, borderRadius: 4 }}
      />
      
      {feedback && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
          {feedback}
        </Typography>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter; 