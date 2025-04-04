import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import { Alert, Spinner } from '../../../components/ui/common';
import rankingService from '../../../services/rankingService';

interface RankedFreelancer {
  userId: string;
  username: string;
  avatar?: string;
  tier: string;
  score: number;
  specialty: string;
  ranking: number;
}

const FreelancerRankingPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [freelancers, setFreelancers] = useState<RankedFreelancer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Liste des catégories pour le filtre
  const categories = [
    { id: '', name: 'Toutes les catégories' },
    { id: 'design', name: 'Design graphique' },
    { id: 'dev', name: 'Développement web' },
    { id: 'writing', name: 'Rédaction' },
    { id: 'translation', name: 'Traduction' },
    { id: 'marketing', name: 'Marketing digital' },
  ];
  
  useEffect(() => {
    const fetchRankedFreelancers = async () => {
      try {
        setLoading(true);
        const data = await rankingService.getTopRankedFreelancers(selectedCategory, 50);
        setFreelancers(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des freelancers:', err);
        setError('Impossible de charger le classement des freelancers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankedFreelancers();
  }, [selectedCategory]);
  
  // Filtrer les freelancers par recherche
  const filteredFreelancers = freelancers.filter(freelancer => 
    freelancer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    freelancer.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Fonction pour naviguer vers le profil du freelancer
  const navigateToProfile = (userId: string) => {
    router.push(`/freelancer/${userId}/profile`);
  };
  
  // Fonction pour déterminer la couleur du niveau
  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'elite':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'établi':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Layout title="Classement des Freelancers">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Classement des Freelancers</h1>
          <p className="text-gray-600">
            Consultez et gérez le classement des freelancers basé sur leurs performances, 
            la qualité de service et leur historique de litiges.
          </p>
        </div>
        
        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par catégorie
              </label>
              <select
                id="category-filter"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <input
                type="text"
                id="search-filter"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom ou spécialité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => window.print()}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Exporter
            </button>
          </div>
        </div>
        
        {/* Tableau de classement */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="large" />
            <span className="ml-3 text-gray-600">Chargement du classement...</span>
          </div>
        ) : error ? (
          <Alert 
            type="error" 
            title="Erreur de chargement" 
            message={error} 
          />
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rang
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Freelancer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spécialité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFreelancers.length > 0 ? (
                    filteredFreelancers.map((freelancer) => (
                      <tr key={freelancer.userId} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigateToProfile(freelancer.userId)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`
                              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                              ${freelancer.ranking <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                            `}>
                              {freelancer.ranking}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {freelancer.avatar ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={freelancer.avatar} alt={freelancer.username} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                  {freelancer.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{freelancer.username}</div>
                              <div className="text-sm text-gray-500">ID: {freelancer.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{freelancer.specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierColor(freelancer.tier)}`}>
                            {freelancer.tier.charAt(0).toUpperCase() + freelancer.tier.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{freelancer.score}/100</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(freelancer.userId);
                            }}
                          >
                            Voir
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Recalcul du score pour ${freelancer.username}`);
                            }}
                          >
                            Recalculer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun freelancer trouvé pour les critères spécifiés.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Informations sur le système de classement */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">À propos du système de classement</h2>
          <p className="text-sm text-blue-700 mb-3">
            Le classement des freelancers est basé sur plusieurs facteurs, dont:
          </p>
          <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
            <li>Historique des litiges (résolutions, fréquence)</li>
            <li>Qualité du travail (évaluations clients)</li>
            <li>Respect des délais de livraison</li>
            <li>Temps de réponse aux messages</li>
            <li>Vérification et complétude du profil</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            Le score est recalculé automatiquement chaque semaine, ou manuellement par les administrateurs.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerRankingPage; 