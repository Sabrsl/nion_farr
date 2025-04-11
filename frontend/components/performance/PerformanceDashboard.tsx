import React, { useState, useEffect } from 'react';
import { 
  getPageLoadMetrics, 
  getStoredWebVitals, 
  getResourceMetrics
} from '../../utils/performance';

/**
 * Tableau de bord de performances pour les administrateurs
 */
const PerformanceDashboard: React.FC = () => {
  const [pageMetrics, setPageMetrics] = useState<any[]>([]);
  const [webVitals, setWebVitals] = useState<any[]>([]);
  const [resources, setResources] = useState<Record<string, any>>({});
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Charger les métriques stockées
      const loadMetrics = getPageLoadMetrics();
      setPageMetrics(loadMetrics);
      
      // Charger les web vitals
      const vitals = getStoredWebVitals();
      setWebVitals(vitals);
      
      // Récupérer les pages uniques pour le sélecteur
      const uniquePages = Array.from(new Set(loadMetrics.map(metric => metric.pathname)));
      
      // Charger les ressources pour chaque page
      const allResources: Record<string, any> = {};
      uniquePages.forEach(url => {
        allResources[url as string] = getResourceMetrics(url as string);
      });
      setResources(allResources);
    }
  }, []);
  
  // Filtrer les métriques par page
  const filteredPageMetrics = selectedPage === 'all' 
    ? pageMetrics 
    : pageMetrics.filter(metric => metric.pathname === selectedPage);
  
  // Filtrer les métriques par période
  const filteredByTime = filteredPageMetrics.filter(metric => {
    const timestamp = metric.timestamp;
    const now = Date.now();
    
    switch (selectedTimeRange) {
      case '24h':
        return (now - timestamp) < 24 * 60 * 60 * 1000;
      case '7d':
        return (now - timestamp) < 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return (now - timestamp) < 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });
  
  // Calculer les moyennes
  const avgLoadTime = filteredByTime.length > 0 
    ? Math.round(
        filteredByTime.reduce((sum, metric) => sum + metric.loadTime, 0) / filteredByTime.length
      )
    : 0;
  
  const avgServerTime = filteredByTime.length > 0 
    ? Math.round(
        filteredByTime.reduce((sum, metric) => sum + metric.serverResponseTime, 0) / filteredByTime.length
      )
    : 0;
  
  // Obtenir les pages uniques
  const uniquePages = Array.from(new Set(pageMetrics.map(metric => metric.pathname)));
  
  // Obtenir les métriques Web Vitals moyennes
  const filteredWebVitals = selectedPage === 'all'
    ? webVitals
    : webVitals.filter(metric => metric.pathname === selectedPage);
  
  // Calculer les moyennes de Web Vitals
  let avgLCP = 0, avgFID = 0, avgCLS = 0;
  const lcpMetrics = filteredWebVitals.filter(metric => metric.name === 'LCP' && metric.isFinal);
  const fidMetrics = filteredWebVitals.filter(metric => metric.name === 'FID' && metric.isFinal);
  const clsMetrics = filteredWebVitals.filter(metric => metric.name === 'CLS' && metric.isFinal);
  
  if (lcpMetrics.length > 0) {
    avgLCP = Math.round(lcpMetrics.reduce((sum, metric) => sum + metric.value, 0) / lcpMetrics.length);
  }
  
  if (fidMetrics.length > 0) {
    avgFID = Math.round(fidMetrics.reduce((sum, metric) => sum + metric.value, 0) / fidMetrics.length);
  }
  
  if (clsMetrics.length > 0) {
    avgCLS = parseFloat((clsMetrics.reduce((sum, metric) => sum + metric.value, 0) / clsMetrics.length).toFixed(3));
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Tableau de bord des performances</h2>
      
      <div className="flex justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-1">
              Page
            </label>
            <select
              id="page-select"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Toutes les pages</option>
              {uniquePages.map((page, index) => (
                <option key={index} value={page as string}>
                  {(page as string).replace(/^\//, '')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <select
              id="time-range"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>
        </div>
        
        <div>
          <span className="text-sm text-gray-500 block mb-1">Échantillons</span>
          <span className="text-lg font-medium">{filteredByTime.length}</span>
        </div>
      </div>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Temps de chargement</h3>
          <p className="text-2xl font-bold text-blue-900">{avgLoadTime} ms</p>
          <p className="text-xs text-blue-700 mt-2">Moyenne sur {filteredByTime.length} pages</p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-indigo-800 mb-1">Temps serveur</h3>
          <p className="text-2xl font-bold text-indigo-900">{avgServerTime} ms</p>
          <p className="text-xs text-indigo-700 mt-2">Temps de réponse moyen</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Largest Contentful Paint</h3>
          <p className="text-2xl font-bold text-purple-900">{avgLCP} ms</p>
          <p className="text-xs text-purple-700 mt-2">
            {avgLCP < 2500 ? 'Bon' : avgLCP < 4000 ? 'À améliorer' : 'Mauvais'}
          </p>
        </div>
        
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-pink-800 mb-1">Cumulative Layout Shift</h3>
          <p className="text-2xl font-bold text-pink-900">{avgCLS}</p>
          <p className="text-xs text-pink-700 mt-2">
            {avgCLS < 0.1 ? 'Bon' : avgCLS < 0.25 ? 'À améliorer' : 'Mauvais'}
          </p>
        </div>
      </div>
      
      {/* Pages les plus lentes */}
      {selectedPage === 'all' && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Pages les plus lentes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">URL</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Temps de chargement</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Premier rendu</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Temps serveur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageMetrics
                  .reduce((acc, metric) => {
                    const existingMetric = acc.find(m => m.pathname === metric.pathname);
                    if (!existingMetric) {
                      acc.push(metric);
                    } else if (metric.timestamp > existingMetric.timestamp) {
                      // Remplacer avec la métrique plus récente
                      const index = acc.indexOf(existingMetric);
                      acc[index] = metric;
                    }
                    return acc;
                  }, [] as any[])
                  .sort((a, b) => b.loadTime - a.loadTime)
                  .slice(0, 5)
                  .map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 truncate max-w-xs">
                        {metric.pathname.replace(/^\//, '')}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {metric.loadTime} ms
                      </td>
                      <td className="px-4 py-3">
                        {metric.firstContentfulPaint} ms
                      </td>
                      <td className="px-4 py-3">
                        {metric.serverResponseTime} ms
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Ressources lentes */}
      {selectedPage !== 'all' && resources[selectedPage] && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Ressources lentes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Ressource</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Temps</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Taille</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources[selectedPage]
                  .filter((resource: any) => resource.duration > 200)
                  .sort((a: any, b: any) => b.duration - a.duration)
                  .slice(0, 10)
                  .map((resource: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 truncate max-w-xs">
                        {resource.name}
                      </td>
                      <td className="px-4 py-3">
                        {resource.type}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {resource.duration} ms
                      </td>
                      <td className="px-4 py-3">
                        {(resource.size / 1024).toFixed(1)} KB
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard; 