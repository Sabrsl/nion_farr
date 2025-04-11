import React, { useState, useEffect } from 'react';
import { FiDownload, FiBarChart2, FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi/index.js';
import AdminLayout from '../../components/layouts/AdminLayout';

// Types pour les rapports
interface Report {
  id: string;
  title: string;
  description: string;
  type: 'sales' | 'users' | 'services' | 'finance' | 'performance';
  generatedAt: string;
  period: string;
  downloadUrl: string;
  size: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Rapport de ventes mensuel',
    description: 'Analyse des ventes et revenus par service et catégorie',
    type: 'sales',
    generatedAt: '2023-10-31T08:00:00Z',
    period: 'Octobre 2023',
    downloadUrl: '/reports/sales-report-oct-2023.pdf',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Rapport d\'activité utilisateurs',
    description: 'Analyse de l\'acquisition et rétention des utilisateurs',
    type: 'users',
    generatedAt: '2023-10-25T10:15:00Z',
    period: 'T3 2023',
    downloadUrl: '/reports/user-activity-q3-2023.pdf',
    size: '3.1 MB'
  },
  {
    id: '3',
    title: 'Rapport des services populaires',
    description: 'Analyse des services les plus vendus et les mieux notés',
    type: 'services',
    generatedAt: '2023-10-15T14:30:00Z',
    period: 'T3 2023',
    downloadUrl: '/reports/popular-services-q3-2023.pdf',
    size: '1.8 MB'
  },
  {
    id: '4',
    title: 'Rapport financier trimestriel',
    description: 'Revenus, commissions et transactions du trimestre',
    type: 'finance',
    generatedAt: '2023-10-10T09:45:00Z',
    period: 'T3 2023',
    downloadUrl: '/reports/financial-q3-2023.pdf',
    size: '4.2 MB'
  },
  {
    id: '5',
    title: 'Rapport de performance du site',
    description: 'Analyses des métriques de performance et temps de chargement',
    type: 'performance',
    generatedAt: '2023-10-05T16:20:00Z',
    period: 'Septembre 2023',
    downloadUrl: '/reports/performance-sep-2023.pdf',
    size: '1.5 MB'
  }
];

// Données pour les graphiques
const salesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  datasets: [
    {
      current: [10000, 15000, 13000, 22000, 18000, 21000, 25000, 27000, 32000, 35000],
      previous: [8000, 10000, 12000, 15000, 16000, 18000, 20000, 22000, 24000, 26000]
    }
  ]
};

// Formatage de la date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  
  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setReports(mockReports);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrer les rapports
  const filteredReports = reports.filter(report => {
    const matchesType = !selectedType || report.type === selectedType;
    const matchesPeriod = !selectedPeriod || report.period.includes(selectedPeriod);
    
    return matchesType && matchesPeriod;
  });
  
  // Options de période
  const periods = Array.from(new Set(reports.map(report => report.period)));
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Rapports</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Rapports</h1>
        
        {/* Résumé statistique */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiBarChart2 className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Ventes Totales</h3>
                <p className="text-2xl font-semibold">35,000 XOF</p>
                <p className="text-xs text-green-500">+12% vs dernier mois</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FiUsers className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Nouveaux Utilisateurs</h3>
                <p className="text-2xl font-semibold">284</p>
                <p className="text-xs text-green-500">+8% vs dernier mois</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiShoppingBag className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Services Vendus</h3>
                <p className="text-2xl font-semibold">153</p>
                <p className="text-xs text-green-500">+15% vs dernier mois</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiDollarSign className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Commissions</h3>
                <p className="text-2xl font-semibold">7,250 XOF</p>
                <p className="text-xs text-green-500">+10% vs dernier mois</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Graphique de tendance des ventes */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Tendance des Ventes</h2>
          <div className="relative h-80">
            {/* Le graphique serait normalement implémenté ici avec une bibliothèque comme Chart.js */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-gray-500">
                Le graphique des ventes s'afficherait ici.
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Utilise une bibliothèque comme Chart.js pour l'implémentation complète
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-4">
            {salesData.labels.map((label, index) => (
              <div key={index} className="text-center">
                <div>{label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Filtres et génération de rapports */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between">
            <h2 className="text-lg font-medium mb-4 md:mb-0">Générer un nouveau rapport</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Type de rapport</option>
                <option value="sales">Ventes</option>
                <option value="users">Utilisateurs</option>
                <option value="services">Services</option>
                <option value="finance">Finances</option>
                <option value="performance">Performance</option>
              </select>
              
              <select
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">Période</option>
                {periods.map((period, index) => (
                  <option key={index} value={period}>{period}</option>
                ))}
              </select>
              
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Générer
              </button>
            </div>
          </div>
        </div>
        
        {/* Liste des rapports */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium">Rapports Disponibles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Généré le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.type === 'sales' ? 'bg-blue-100 text-blue-800' :
                          report.type === 'users' ? 'bg-purple-100 text-purple-800' :
                          report.type === 'services' ? 'bg-green-100 text-green-800' :
                          report.type === 'finance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.type === 'sales' ? 'Ventes' :
                           report.type === 'users' ? 'Utilisateurs' :
                           report.type === 'services' ? 'Services' :
                           report.type === 'finance' ? 'Finances' : 'Performance'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.generatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                          href={report.downloadUrl} 
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiDownload className="mr-1" /> Télécharger
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucun rapport ne correspond à vos critères
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage; 