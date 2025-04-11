/**
 * Utilitaire pour calculer les scores de performance basés sur les métriques Web Vitals
 */
import { WebVitalMetric, MetricRating } from './types';
import { getRating } from './webVitals';

// Poids pour chaque métrique dans le calcul du score global
const METRIC_WEIGHTS = {
  LCP: 0.25,   // Largest Contentful Paint
  FID: 0.25,   // First Input Delay
  CLS: 0.15,   // Cumulative Layout Shift
  TTFB: 0.15,  // Time to First Byte
  FCP: 0.1,    // First Contentful Paint
  INP: 0.1     // Interaction to Next Paint
};

/**
 * Calcule un score pour une métrique spécifique basé sur sa valeur et son évaluation
 * @param metric Le nom de la métrique
 * @param value La valeur de la métrique
 * @param rating L'évaluation de la métrique (good, needs-improvement, poor)
 * @returns Un score entre 0 et 100
 */
export const getMetricScore = (metric: string, value: number, rating: MetricRating): number => {
  // Scores de base pour chaque niveau d'évaluation
  const baseScores = {
    good: 90,
    'needs-improvement': 50,
    poor: 10
  };
  
  // Score de base selon l'évaluation
  let score = baseScores[rating];
  
  // Ajustement du score en fonction de la valeur exacte au sein de sa catégorie
  if (metric === 'LCP') {
    if (rating === 'good') {
      // Bonus pour LCP très rapide (< 1.8s)
      score += (2500 - value) / 50;
    } else if (rating === 'needs-improvement') {
      // Ajustement linéaire entre les seuils
      score += (4000 - value) / 30;
    } else {
      // Malus pour LCP très lent
      score -= (value - 4000) / 100;
    }
  } else if (metric === 'FID') {
    if (rating === 'good') {
      // Bonus pour FID très rapide
      score += (100 - value) / 5;
    } else if (rating === 'needs-improvement') {
      // Ajustement linéaire entre les seuils
      score += (300 - value) / 10;
    } else {
      // Malus pour FID très lent
      score -= (value - 300) / 50;
    }
  } else if (metric === 'CLS') {
    if (rating === 'good') {
      // Bonus pour CLS très bas
      score += (0.1 - value) * 100;
    } else if (rating === 'needs-improvement') {
      // Ajustement linéaire entre les seuils
      score += (0.25 - value) * 200;
    } else {
      // Malus pour CLS très élevé
      score -= (value - 0.25) * 100;
    }
  } else if (metric === 'TTFB') {
    if (rating === 'good') {
      // Bonus pour TTFB très rapide
      score += (800 - value) / 40;
    } else if (rating === 'needs-improvement') {
      // Ajustement linéaire entre les seuils
      score += (1800 - value) / 20;
    } else {
      // Malus pour TTFB très lent
      score -= (value - 1800) / 100;
    }
  }
  
  // Garantie que le score est dans la plage [0, 100]
  return Math.max(0, Math.min(100, score));
};

/**
 * Calcule un score global de performance basé sur toutes les métriques Web Vitals
 * @param webVitals Un tableau de métriques Web Vitals
 * @returns Un score entre 0 et 100
 */
export const getWebVitalsScore = (webVitals: WebVitalMetric[]): number => {
  if (!webVitals || webVitals.length === 0) {
    return 0;
  }
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  // Calculer le score pondéré pour chaque métrique
  webVitals.forEach(metric => {
    const rating = getRating(metric.name, metric.value);
    const weight = METRIC_WEIGHTS[metric.name as keyof typeof METRIC_WEIGHTS] || 0.1;
    
    totalWeight += weight;
    weightedScore += getMetricScore(metric.name, metric.value, rating) * weight;
  });
  
  // Éviter la division par zéro
  if (totalWeight === 0) {
    return 0;
  }
  
  // Normaliser le score
  return weightedScore / totalWeight;
};

/**
 * Évalue la qualité d'un score de performance
 * @param score Le score de performance (0-100)
 * @returns Une évaluation qualitative (good, needs-improvement, poor)
 */
export const getRatingFromScore = (score: number): MetricRating => {
  if (score >= 90) {
    return 'good';
  } else if (score >= 50) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
};

/**
 * Génère un message de feedback basé sur le score de performance
 * @param score Le score de performance (0-100)
 * @returns Un message de feedback
 */
export const getFeedbackFromScore = (score: number): string => {
  if (score >= 90) {
    return "Excellent ! Votre site offre une expérience utilisateur très performante.";
  } else if (score >= 80) {
    return "Très bien ! Quelques petites optimisations pourraient encore améliorer l'expérience.";
  } else if (score >= 70) {
    return "Bien. Votre site est rapide, mais des améliorations notables sont possibles.";
  } else if (score >= 50) {
    return "Passable. Des optimisations sont nécessaires pour améliorer l'expérience utilisateur.";
  } else if (score >= 30) {
    return "Médiocre. De sérieux problèmes de performance impactent l'expérience utilisateur.";
  } else {
    return "Critique. Des optimisations majeures sont indispensables pour rendre le site utilisable.";
  }
}; 