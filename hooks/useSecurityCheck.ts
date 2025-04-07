import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { securityService, SecurityAlert, KycInfo } from '../services/securityService';

interface UseSecurityCheckResult {
  isLoading: boolean;
  error: string | null;
  isVerified: boolean;
  canWithdraw: boolean;
  isSuspiciousActivity: boolean;
  activityStatus: { isSuspicious: boolean; reasons: string[]; alerts: SecurityAlert[] } | null;
  identityStatus: { isVerified: boolean; kycInfo: KycInfo; canWithdraw: boolean; reasons: string[] } | null;
  checkWithdrawalEligibility: (amount: number) => Promise<{
    isEligible: boolean;
    requiresAdditionalVerification?: boolean;
    reasons?: string[];
  }>;
}

export const useSecurityCheck = (userId: string): UseSecurityCheckResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [canWithdraw, setCanWithdraw] = useState<boolean>(false);
  const [isSuspiciousActivity, setIsSuspiciousActivity] = useState<boolean>(false);
  const [activityStatus, setActivityStatus] = useState<{ isSuspicious: boolean; reasons: string[]; alerts: SecurityAlert[] } | null>(null);
  const [identityStatus, setIdentityStatus] = useState<{ isVerified: boolean; kycInfo: KycInfo; canWithdraw: boolean; reasons: string[] } | null>(null);

  // Vérifier l'activité de l'utilisateur
  const checkActivity = useCallback(async () => {
    try {
      const result = await securityService.checkUserActivity(userId);
      setIsSuspiciousActivity(result.isSuspicious);
      setActivityStatus(result);
      
      // Si activité suspecte, afficher un avertissement
      if (result.isSuspicious) {
        toast.warning("Nous avons détecté une activité inhabituelle sur votre compte.");
      }
      
      // Envoyer une alerte à l'admin si nécessaire
      if (result.isSuspicious && result.alerts.length > 0) {
        securityService.sendAdminAlert({
          userId,
          type: 'login',
          severity: 'high',
          details: "Activité suspecte détectée pour l'utilisateur"
        });
      }
      
      return result;
    } catch (err) {
      setError("Impossible de vérifier l'activité de l'utilisateur");
      console.error("Erreur lors de la vérification de l'activité:", err);
      return null;
    }
  }, [userId]);

  // Vérifier l'identité de l'utilisateur
  const verifyUserIdentity = useCallback(async () => {
    try {
      const result = await securityService.verifyIdentity(userId);
      setIsVerified(result.isVerified);
      setCanWithdraw(result.canWithdraw);
      setIdentityStatus(result);
      
      // Afficher des erreurs si l'identité n'est pas vérifiée
      if (!result.isVerified && result.reasons.length > 0) {
        toast.error("Votre identité n'est pas complètement vérifiée.", {
          autoClose: 5000
        });
      }
      
      return result;
    } catch (err) {
      setError("Impossible de vérifier l'identité de l'utilisateur");
      console.error("Erreur lors de la vérification de l'identité:", err);
      return null;
    }
  }, [userId]);

  // Vérifier l'éligibilité au retrait
  const checkWithdrawalEligibility = useCallback(async (amount: number) => {
    try {
      const result = await securityService.verifyWithdrawalEligibility(userId, amount);
      return {
        isEligible: result.isEligible,
        requiresAdditionalVerification: result.requiresAdditionalVerification,
        reasons: result.reasons
      };
    } catch (err) {
      setError("Impossible de vérifier l'éligibilité au retrait");
      console.error("Erreur lors de la vérification de l'éligibilité au retrait:", err);
      return {
        isEligible: false,
        reasons: ['Une erreur technique est survenue. Veuillez réessayer plus tard.']
      };
    }
  }, [userId]);

  // Effectuer les vérifications au chargement du hook
  useEffect(() => {
    const performChecks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Vérifier en parallèle
        await Promise.all([
          checkActivity(),
          verifyUserIdentity()
        ]);
      } catch (err) {
        setError('Une erreur est survenue lors des vérifications de sécurité');
        console.error('Erreur lors des vérifications de sécurité:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      performChecks();
    } else {
      setIsLoading(false);
      setError('ID utilisateur non spécifié');
    }
  }, [userId, checkActivity, verifyUserIdentity]);

  return {
    isLoading,
    error,
    isVerified,
    canWithdraw,
    isSuspiciousActivity,
    activityStatus,
    identityStatus,
    checkWithdrawalEligibility
  };
};

export default useSecurityCheck; 