import { NextApiRequest, NextApiResponse } from 'next';

// Types locaux qui doivent correspondre à ceux dans userViolationService.ts
type ViolationType = 
  | 'message_inappropriate' 
  | 'contact_external' 
  | 'circumvention_payment' 
  | 'impersonation' 
  | 'fake_reviews' 
  | 'multi_account' 
  | 'abusive_behavior' 
  | 'fraud_attempt' 
  | 'service_misrepresentation' 
  | 'intellectual_property';

type ViolationSeverity = 'warning' | 'minor' | 'moderate' | 'severe' | 'critical';

// Points de sévérité utilisés pour déterminer les actions à prendre
const severityPoints = {
  'warning': 1,
  'minor': 2,
  'moderate': 3,
  'severe': 4,
  'critical': 5
};

// Simuler une base de données pour stocker les violations
// Dans une implémentation réelle, cela utiliserait une base de données
let violationsDB: Array<{
  id: string;
  userId: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  createdAt: string;
  expiresAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'message' | 'service' | 'review';
  status: 'active' | 'expired' | 'appealed' | 'dismissed';
}> = [];

/**
 * Calcule l'action appropriée basée sur l'historique des violations
 */
function determineAction(
  userId: string,
  newViolationType: ViolationType,
  newViolationSeverity: ViolationSeverity
): {
  actionTaken: 'none' | 'warning' | 'restriction' | 'temporary_suspension' | 'permanent_ban';
  suspensionDuration?: number; // en heures
} {
  // Récupérer les violations existantes de l'utilisateur
  const userViolations = violationsDB.filter(v => v.userId === userId && v.status === 'active');
  
  // Violations récentes (moins de 90 jours)
  const recentViolations = userViolations.filter(v => {
    const creationDate = new Date(v.createdAt);
    const now = new Date();
    const daysDifference = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDifference <= 90;
  });
  
  // Violations du même type
  const sameTypeViolations = recentViolations.filter(v => v.type === newViolationType);
  
  // Total des points de violation récents
  const totalRecentPoints = recentViolations.reduce(
    (sum, v) => sum + severityPoints[v.severity], 0
  ) + severityPoints[newViolationSeverity];
  
  // Récidive du même type (facteur aggravant)
  const isRepeatOffense = sameTypeViolations.length > 0;
  
  // Déterminer l'action en fonction des points et de la sévérité
  if (newViolationSeverity === 'critical' || totalRecentPoints >= 15 || 
      (isRepeatOffense && newViolationSeverity === 'severe')) {
    return { 
      actionTaken: 'permanent_ban'
    };
  } else if (newViolationSeverity === 'severe' || totalRecentPoints >= 10) {
    return { 
      actionTaken: 'temporary_suspension',
      suspensionDuration: 168 // 7 jours
    };
  } else if (newViolationSeverity === 'moderate' || (isRepeatOffense && newViolationSeverity === 'minor') || 
             totalRecentPoints >= 5) {
    return { 
      actionTaken: 'temporary_suspension',
      suspensionDuration: 48 // 48 heures
    };
  } else if (newViolationSeverity === 'minor' || totalRecentPoints >= 3) {
    return { 
      actionTaken: 'temporary_suspension',
      suspensionDuration: 24 // 24 heures
    };
  } else if (isRepeatOffense || recentViolations.length > 1) {
    return { 
      actionTaken: 'restriction',
      suspensionDuration: 24 // 24 heures de restriction
    };
  } else {
    return { 
      actionTaken: 'warning'
    };
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * Dans une implémentation réelle, ceci utiliserait le système d'authentification approprié
 */
function isAuthenticated(req: NextApiRequest): boolean {
  // Simuler une vérification d'authentification
  return req.headers.authorization ? true : false;
}

/**
 * Vérifie si l'utilisateur a le rôle d'admin ou de modérateur
 * Dans une implémentation réelle, ceci vérifierait les rôles dans un système d'autorisation
 */
function hasModeratorRole(req: NextApiRequest): boolean {
  // Simuler une vérification de rôle
  // Dans une vraie implémentation, vérifiez les claims JWT ou la base de données
  return true; // Toujours autoriser pour la démo
}

/**
 * API endpoint pour enregistrer une violation d'utilisateur
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Seules les requêtes POST sont autorisées
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  // Vérifier l'authentification
  if (!isAuthenticated(req)) {
    return res.status(401).json({ success: false, message: 'Authentification requise' });
  }

  // Vérifier le rôle
  if (!hasModeratorRole(req)) {
    return res.status(403).json({ success: false, message: 'Accès interdit: rôle modérateur requis' });
  }

  try {
    const { userId, type, severity, description, relatedEntityId, relatedEntityType } = req.body;
    
    // Valider les données requises
    if (!userId || !type || !severity || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données manquantes: userId, type, severity et description sont requis' 
      });
    }
    
    // Créer un ID unique pour la violation
    const violationId = `viol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculer la date d'expiration (90 jours par défaut)
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // +90 jours
    
    // Créer l'enregistrement de violation
    const violation = {
      id: violationId,
      userId,
      type: type as ViolationType,
      severity: severity as ViolationSeverity,
      description,
      createdAt: now.toISOString(),
      expiresAt: expirationDate.toISOString(),
      relatedEntityId,
      relatedEntityType,
      status: 'active' as const
    };
    
    // Ajouter à la "base de données"
    violationsDB.push(violation);
    
    // Déterminer l'action à prendre
    const actionResult = determineAction(userId, type as ViolationType, severity as ViolationSeverity);
    
    // Dans une implémentation réelle, appliquer l'action ici (suspension, ban, etc.)
    console.log(`Action taken for user ${userId}: ${actionResult.actionTaken}`, 
      actionResult.suspensionDuration ? `Duration: ${actionResult.suspensionDuration}h` : '');
    
    // Retourner le résultat
    return res.status(200).json({
      success: true,
      violationId,
      message: 'Violation enregistrée avec succès',
      actionTaken: actionResult.actionTaken,
      suspensionDuration: actionResult.suspensionDuration
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la violation:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'enregistrement de la violation' 
    });
  }
}; 