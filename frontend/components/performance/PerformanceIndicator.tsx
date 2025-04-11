import React, { useState, useEffect } from 'react';
import { analyzePagePerformance, PagePerformanceData } from '../../utils/performance';

interface PerformanceIndicatorProps {
  pageType: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * Composant permettant d'afficher un indicateur de performance pour la page actuelle
 */
const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ 
  pageType, 
  showDetails = false,
  className = ''
}) => {
  const [performance, setPerformance] = useState<PagePerformanceData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Attendre que la page soit complètement chargée
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const url = window.location.pathname;
        const performanceData = analyzePagePerformance(url, pageType);
        setPerformance(performanceData);
      }, 2000); // Attendre 2 secondes après que la page soit chargée
      
      return () => clearTimeout(timer);
    }
  }, [pageType]);

  if (!performance) {
    return null; // Ne rien afficher pendant l'analyse
  }

  // Déterminer la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500 bg-green-50';
    if (score >= 70) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  // Affichage simple (juste le score)
  if (!showDetails && !expanded) {
    return (
      <div 
        className={`fixed bottom-4 right-4 rounded-full p-2 cursor-pointer shadow-md ${getScoreColor(performance.performanceScore)} ${className}`}
        onClick={() => setExpanded(true)}
        title="Score de performance de la page"
      >
        <div className="text-xs font-bold">
          {performance.performanceScore}
        </div>
      </div>
    );
  }

  // Trouver les métriques Web Vitals spécifiques
  const lcpMetric = performance.webVitals.find(metric => metric.name === 'LCP');
  const clsMetric = performance.webVitals.find(metric => metric.name === 'CLS');
  const fidMetric = performance.webVitals.find(metric => metric.name === 'FID');

  // Affichage détaillé
  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Performance</h3>
        {expanded && (
          <button 
            onClick={() => setExpanded(false)} 
            className="text-gray-500 hover:text-gray-700"
          >
            {showDetails ? '−' : '×'}
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Score</span>
          <span className={`text-sm font-semibold ${getScoreColor(performance.performanceScore)}`}>
            {performance.performanceScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              performance.performanceScore >= 90 ? 'bg-green-500' : 
              performance.performanceScore >= 70 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} 
            style={{ width: `${performance.performanceScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* Métriques Web Vitals */}
      {(lcpMetric || clsMetric || fidMetric) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Métriques Core Web Vitals</h4>
          <div className="grid grid-cols-3 gap-2">
            {lcpMetric && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">LCP</div>
                <div className="text-sm font-semibold">{Math.round(lcpMetric.value)} ms</div>
              </div>
            )}
            {clsMetric && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">CLS</div>
                <div className="text-sm font-semibold">{clsMetric.value.toFixed(3)}</div>
              </div>
            )}
            {fidMetric && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">FID</div>
                <div className="text-sm font-semibold">{Math.round(fidMetric.value)} ms</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Conseils d'optimisation */}
      {performance.optimizationTips && performance.optimizationTips.length > 0 && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Conseils d'optimisation</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {performance.optimizationTips.slice(0, 3).map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
            {performance.optimizationTips.length > 3 && (
              <li className="text-xs text-blue-500 cursor-pointer" onClick={() => setExpanded(true)}>
                Voir {performance.optimizationTips.length - 3} conseils supplémentaires...
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Ressources lentes */}
      {expanded && performance.slowResources && performance.slowResources.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Ressources lentes</h4>
          <ul className="text-xs text-gray-600">
            {performance.slowResources.map((resource, index) => (
              <li key={index} className="mb-1">
                <div className="flex justify-between">
                  <span className="truncate max-w-[200px]">{resource.name}</span>
                  <span className="font-medium">{resource.duration} ms</span>
                </div>
                <div className="text-gray-400 text-[10px]">{resource.type}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PerformanceIndicator;