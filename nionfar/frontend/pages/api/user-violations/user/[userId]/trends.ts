import { NextApiRequest, NextApiResponse } from 'next';

// Endpoint pour analyser les tendances des violations d'un utilisateur
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
    
    // Simuler l'analyse des tendances
    // Dans une implémentation réelle, cela impliquerait des analyses sur des données réelles
    const trendAnalysis = analyzeUserViolationTrends(userId);
    
    // Retourner le résultat
    return res.status(200).json(trendAnalysis);
  } catch (error) {
    console.error('Erreur lors de l\'analyse des tendances:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'analyse des tendances' 
    });
  }
}

/**
 * Analyse les tendances de violations pour un utilisateur
 * @param userId ID de l'utilisateur à analyser
 */
function analyzeUserViolationTrends(userId: string): {
  improvingBehavior: boolean;
  violationFrequency: 'decreasing' | 'stable' | 'increasing';
  recommendedActions?: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  // Simuler des résultats d'analyse avec des valeurs aléatoires
  // Dans une implémentation réelle, cela se baserait sur l'historique réel
  
  // Générer une valeur aléatoire pour simuler différents résultats
  const randomValue = Math.random();
  
  // Déterminer la tendance
  let violationFrequency: 'decreasing' | 'stable' | 'increasing' = 'stable';
  if (randomValue < 0.33) {
    violationFrequency = 'decreasing';
  } else if (randomValue > 0.66) {
    violationFrequency = 'increasing';
  }
  
  // Déterminer si le comportement s'améliore
  const improvingBehavior = violationFrequency === 'decreasing' || 
    (violationFrequency === 'stable' && randomValue < 0.5);
  
  // Déterminer le niveau de risque
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (violationFrequency === 'increasing') {
    riskLevel = randomValue > 0.8 ? 'high' : 'medium';
  } else if (violationFrequency === 'stable') {
    riskLevel = randomValue > 0.7 ? 'medium' : 'low';
  } else {
    riskLevel = randomValue > 0.9 ? 'medium' : 'low';
  }
  
  // Recommandations basées sur l'analyse
  const recommendedActions: string[] = [];
  
  if (riskLevel === 'high') {
    recommendedActions.push('Examiner manuellement le profil et l\'historique de l\'utilisateur');
    recommendedActions.push('Contacter l\'utilisateur pour un avertissement formel');
    
    if (randomValue > 0.7) {
      recommendedActions.push('Envisager une restriction temporaire des fonctionnalités');
    }
  } else if (riskLevel === 'medium') {
    recommendedActions.push('Surveiller l\'activité dans les 30 prochains jours');
    
    if (randomValue > 0.6) {
      recommendedActions.push('Envoyer un rappel des conditions d\'utilisation');
    }
  } else if (!improvingBehavior) {
    recommendedActions.push('Aucune action immédiate requise, continuer la surveillance régulière');
  }
  
  // Si comportement s'améliore, suggérer de réduire les restrictions
  if (improvingBehavior && randomValue > 0.7) {
    recommendedActions.push('Envisager de réduire les restrictions si applicables');
  }
  
  return {
    improvingBehavior,
    violationFrequency,
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : undefined,
    riskLevel
  };
} 