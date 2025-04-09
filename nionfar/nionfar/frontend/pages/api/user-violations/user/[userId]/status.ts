import { NextApiRequest, NextApiResponse } from 'next';

// Endpoint pour récupérer le statut des violations d'un utilisateur
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Seules les requêtes GET sont autorisées
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    // Récupérer l'ID de l'utilisateur depuis l'URL
    const { userId } = req.query;
    
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur invalide' 
      });
    }
    
    // Simuler la récupération des données depuis une base de données
    // Dans une implémentation réelle, ces données proviendraient d'une base de données
    
    // Générer un statut simulé
    const mockViolationStatus = generateMockViolationStatus(userId);
    
    // Retourner le résultat
    return res.status(200).json(mockViolationStatus);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut des violations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la récupération du statut des violations' 
    });
  }
}

/**
 * Génère un statut de violation factice pour les tests
 * @param userId ID de l'utilisateur
 */
function generateMockViolationStatus(userId: string) {
  // Générer un nombre aléatoire pour simuler différents statuts
  const randomValue = Math.random();
  
  // Statut basé sur une valeur aléatoire
  let currentStatus: 'good_standing' | 'warning' | 'restricted' | 'suspended' | 'banned' = 'good_standing';
  if (randomValue > 0.95) {
    currentStatus = 'banned';
  } else if (randomValue > 0.9) {
    currentStatus = 'suspended';
  } else if (randomValue > 0.8) {
    currentStatus = 'restricted';
  } else if (randomValue > 0.7) {
    currentStatus = 'warning';
  }
  
  // Générer des violations fictives
  const activeViolations = [];
  const violationHistory = [];
  
  if (randomValue > 0.6) {
    // Ajouter quelques violations actives
    const violationTypes = [
      'message_inappropriate', 'contact_external', 'multi_account', 'abusive_behavior'
    ];
    
    const violationSeverities = ['warning', 'minor', 'moderate', 'severe', 'critical'];
    
    // 1-3 violations actives
    const activeViolationCount = Math.floor(randomValue * 3) + 1;
    for (let i = 0; i < activeViolationCount; i++) {
      const type = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      const severity = violationSeverities[Math.floor(Math.random() * violationSeverities.length)];
      
      activeViolations.push({
        id: `viol_${Date.now()}_${i}`,
        userId,
        type,
        severity,
        description: `Violation ${type} de sévérité ${severity}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      });
    }
    
    // 0-5 violations historiques
    const historyViolationCount = Math.floor(randomValue * 5);
    for (let i = 0; i < historyViolationCount; i++) {
      const type = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      const severity = violationSeverities[Math.floor(Math.random() * violationSeverities.length)];
      const status = ['expired', 'appealed', 'dismissed'][Math.floor(Math.random() * 3)];
      
      violationHistory.push({
        id: `viol_hist_${Date.now()}_${i}`,
        userId,
        type,
        severity,
        description: `Violation historique ${type} de sévérité ${severity}`,
        createdAt: new Date(Date.now() - (30 + Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
        status
      });
    }
  }
  
  // Générer l'historique des suspensions
  const suspensionHistory = [];
  if (currentStatus === 'suspended' || currentStatus === 'banned' || randomValue > 0.85) {
    const suspensionType = currentStatus === 'banned' ? 'permanent' : 'temporary';
    const startDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = suspensionType === 'permanent' ? undefined : 
      new Date(Date.now() + Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString();
    
    suspensionHistory.push({
      startDate,
      endDate,
      reason: 'Violations multiples des conditions d\'utilisation',
      type: suspensionType
    });
    
    // Ajouter d'anciennes suspensions si le score est élevé
    if (randomValue > 0.9) {
      const oldStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const oldEndDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      suspensionHistory.push({
        startDate: oldStartDate,
        endDate: oldEndDate,
        reason: 'Comportement abusif',
        type: 'temporary'
      });
    }
  }
  
  // Calculer les points totaux
  const severityPoints = {
    'warning': 1,
    'minor': 2,
    'moderate': 3,
    'severe': 4,
    'critical': 5
  };
  
  const totalViolationPoints = activeViolations.reduce((sum, violation) => {
    return sum + (severityPoints[violation.severity as keyof typeof severityPoints] || 0);
  }, 0);
  
  // Date du dernier avertissement
  const lastWarningDate = activeViolations.length > 0 ? 
    activeViolations[0].createdAt : undefined;
  
  // Date de révision
  const nextReviewDate = currentStatus !== 'good_standing' ? 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;
  
  return {
    userId,
    activeViolations,
    violationHistory,
    currentStatus,
    suspensionHistory,
    warningCount: Math.floor(randomValue * 5),
    lastWarningDate,
    totalViolationPoints,
    nextReviewDate
  };
} 