import { useState, useEffect } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  onScoreChange?: (score: number) => void;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  onScoreChange 
}) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Calculer le score du mot de passe
    const calculatePasswordStrength = (password: string): number => {
      if (!password) return 0;
      
      let score = 0;
      
      // Longueur
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      
      // Complexité
      if (/[A-Z]/.test(password)) score += 1; // Majuscules
      if (/[a-z]/.test(password)) score += 1; // Minuscules
      if (/[0-9]/.test(password)) score += 1; // Chiffres
      if (/[^A-Za-z0-9]/.test(password)) score += 1; // Caractères spéciaux
      
      // Pénalités pour les répétitions
      const repetitions = password.match(/(.)\1{2,}/g);
      if (repetitions) score = Math.max(0, score - repetitions.length);
      
      // Normalize score to 0-4 range
      return Math.min(4, Math.floor(score / 1.5));
    };

    const newScore = calculatePasswordStrength(password);
    setScore(newScore);
    
    // Transmettre le score au composant parent si nécessaire
    if (onScoreChange) {
      onScoreChange(newScore);
    }
    
    // Définir le feedback en fonction du score
    switch(newScore) {
      case 0:
        setFeedback('Très faible');
        break;
      case 1:
        setFeedback('Faible');
        break;
      case 2:
        setFeedback('Moyen');
        break;
      case 3:
        setFeedback('Fort');
        break;
      case 4:
        setFeedback('Très fort');
        break;
      default:
        setFeedback('');
    }
  }, [password, onScoreChange]);

  // Obtenir la classe CSS en fonction du score
  const getColorClass = (): string => {
    switch(score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-green-500';
      case 4:
        return 'bg-green-600';
      default:
        return 'bg-gray-200';
    }
  };

  // Obtenir le pourcentage de progression en fonction du score
  const getPercentage = (): number => {
    return (score / 4) * 100;
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass()} transition-all duration-300`} 
            style={{ width: `${getPercentage()}%` }}
          ></div>
        </div>
        <span className={`ml-2 text-xs font-medium ${score < 2 ? 'text-red-600' : score < 3 ? 'text-yellow-600' : 'text-green-600'}`}>
          {feedback}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Utilisez au moins 8 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux
      </p>
    </div>
  );
};

export default PasswordStrengthMeter; 