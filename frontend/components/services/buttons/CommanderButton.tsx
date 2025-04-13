import React, { useState, useRef } from 'react';
import { FiPackage } from 'react-icons/fi/index.js';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface CommanderButtonProps {
  serviceId: string;
  sellerId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CommanderButton: React.FC<CommanderButtonProps> = ({
  serviceId,
  sellerId,
  className = '',
  variant = 'primary',
  fullWidth = true,
  size = 'md'
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const hasHandledClick = useRef(false);
  
  // État pour la vérification si l'utilisateur peut commander
  const [canOrder, setCanOrder] = useState(true);
  const [cannotOrderReason, setCannotOrderReason] = useState<string | null>(null);
  
  const handleCommander = (e: React.MouseEvent) => {
    // Empêcher la navigation par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Éviter le double-clic ou les actions pendant une redirection
    if (isRedirecting || hasHandledClick.current) {
      return;
    }
    
    // Marquer le clic comme traité
    hasHandledClick.current = true;
    
    // Activer l'état de vérification
    setIsChecking(true);
    
    // Vérifier si l'utilisateur est le vendeur du service
    if (user && user.id === sellerId) {
      setCanOrder(false);
      setCannotOrderReason("Vous ne pouvez pas commander votre propre service");
      setIsChecking(false);
      hasHandledClick.current = false;
      return;
    }
    
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isAuthenticated || !user) {
      const checkoutUrl = `/checkout/${serviceId}`;
      const redirectUrl = `/login?redirect=${encodeURIComponent(checkoutUrl)}`;
      
      setIsRedirecting(true);
      window.location.href = redirectUrl;
      return;
    }
    
    // Si tout est ok, rediriger vers la page de checkout
    setIsRedirecting(true);
    window.location.href = `/checkout/${serviceId}`;
  };
  
  // Déterminer le texte du bouton
  const buttonText = isChecking 
    ? 'Vérification...' 
    : isRedirecting 
      ? 'Redirection...'
      : !isAuthenticated || !user
        ? 'Se connecter pour commander'
        : !canOrder 
          ? cannotOrderReason || 'Non disponible'
          : 'Commander ce service';
  
  return (
    <Button
      onClick={handleCommander}
      className={className}
      disabled={isRedirecting || !canOrder}
      loading={isRedirecting || isChecking}
      variant={canOrder ? variant : 'secondary'}
      fullWidth={fullWidth}
      size={size}
      startIcon={canOrder ? <FiPackage className="h-5 w-5" /> : null}
    >
      {buttonText}
    </Button>
  );
};

export default CommanderButton;