import React, { useEffect, useState } from 'react';
import { FreelancerRanking, RankingFactor } from '../../types';
import rankingService from '../../services/rankingService';
import { Spinner, Alert } from '../ui/common';

interface FreelancerRankingCardProps {
  userId: string;
  showDetailed?: boolean;
  className?: string;
}

const FreelancerRankingCard: React.FC<FreelancerRankingCardProps> = ({
  userId,
  showDetailed = false,
  className = '',
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<FreelancerRanking | null>(null);
  const [factors, setFactors] = useState<RankingFactor[]>([]);
  
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        // Récupérer le classement du freelancer
        const rankingData = await rankingService.calculateFreelancerRanking(userId);
        setRanking(rankingData);
        
        // Si le mode détaillé est activé, récupérer également les facteurs
        if (showDetailed) {
          const factorsData = await rankingService.getRankingFactors(userId);
          setFactors(factorsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du classement:', err);
        setError('Impossible de charger les informations de classement');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, [userId, showDetailed]);
  
  // Fonction pour déterminer la couleur du niveau
  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'elite':
        return 'bg-purple-600 text-white';
      case 'premium':
        return 'bg-blue-500 text-white';
      case 'établi':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };
  
  // Fonction pour formater le ratio de litiges
  const formatDisputeRatio = (ratio: number): string => {
    const percentage = ratio * 100;
    return `${percentage.toFixed(1)}%`;
  };
  
  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (trend: string): React.ReactElement => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↑</span>;
      case 'down':
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };
  
  if (loading) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow-md flex justify-center items-center ${className}`}>
        <Spinner size="medium" />
        <span className="ml-2 text-gray-600">Chargement du classement...</span>
      </div>
    );
  }
  
  if (error || !ranking) {
    return (
      <Alert 
        type="error" 
        title="Erreur de chargement" 
        message={error || "Données de classement non disponibles"} 
        className={className}
      />
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* En-tête avec niveau et score global */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Classement Freelancer</h3>
            <p className="text-sm text-gray-500">
              Position: <span className="font-medium">{ranking.position}</span> 
              {ranking.categoryPosition && (
                <span className="ml-2">
                  (#{ranking.categoryPosition} dans sa catégorie)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm text-gray-500">Score</span>
              <span className="text-2xl font-bold">{ranking.overallScore}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierColor(ranking.tier)}`}>
              {ranking.tier.charAt(0).toUpperCase() + ranking.tier.slice(1)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistiques de litiges */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Historique des litiges</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{ranking.disputeStats.totalDisputes}</div>
            <div className="text-xs text-gray-500">Total litiges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{ranking.disputeStats.resolvedInFavor}</div>
            <div className="text-xs text-gray-500">Résolus en faveur</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{ranking.disputeStats.resolvedAgainst}</div>
            <div className="text-xs text-gray-500">Résolus contre</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Ratio de litiges:</span>
            <span className={ranking.disputeStats.disputeRatio > 0.1 ? 'text-red-600' : 'text-green-600'}>
              {formatDisputeRatio(ranking.disputeStats.disputeRatio)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${ranking.disputeStats.disputeRatio > 0.1 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(ranking.disputeStats.disputeRatio * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Facteurs de classement détaillés (optionnel) */}
      {showDetailed && factors.length > 0 && (
        <div className="p-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Facteurs de classement</h4>
          <div className="space-y-3">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center">
                <div className="w-1/3">
                  <div className="text-sm font-medium text-gray-700">{factor.name}</div>
                  <div className="text-xs text-gray-500">{(factor.weight * 100).toFixed(0)}%</div>
                </div>
                <div className="w-2/3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{factor.score}/100</span>
                    {getTrendIcon(factor.trend)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${Math.min(factor.score, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 italic">
            Dernière mise à jour: {new Date(ranking.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
      
      {/* Pied de carte avec info-bulle */}
      <div className="bg-gray-50 p-3 text-xs text-gray-500">
        Le classement est basé sur la performance globale, y compris la gestion des litiges, la qualité du travail et le respect des délais.
      </div>
    </div>
  );
};

export default FreelancerRankingCard;