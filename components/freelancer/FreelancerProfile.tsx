import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Alert, Spinner } from '../ui/common';
import { User, FreelancerRanking } from '../../types';
import { FiUserCheck, FiStar, FiCalendar, FiShield, FiAlertTriangle, FiAward } from 'react-icons/fi';
import rankingService from '../../services/rankingService';
import FreelancerRankingCard from './FreelancerRankingCard';
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from '../ui/CustomTabs';

interface FreelancerProfileProps {
  freelancer: User;
  showDetailed?: boolean;
  className?: string;
}

// Interface pour les données du profil (à adapter selon vos besoins)
interface FreelancerData {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  coverImage?: string;
  title: string;
  description: string;
  location: string;
  joinedDate: string;
  isVerified: boolean;
  languages: { language: string; level: string }[];
  skills: string[];
  socialLinks: { platform: string; url: string }[];
  contactEmail?: string;
  phone?: string;
  categories: string[];
  responseTime: string;
}

const FreelancerProfile: React.FC<FreelancerProfileProps> = ({
  freelancer,
  showDetailed = false,
  className = ''
}) => {
  const [ranking, setRanking] = useState<FreelancerRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const rankingData = await rankingService.calculateFreelancerRanking(freelancer.id);
        setRanking(rankingData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du classement:', err);
        setError('Impossible de charger les informations de classement');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, [freelancer.id]);
  
  // Fonction pour déterminer le niveau de risque basé sur les badges
  const getRiskLevel = (): { label: string; color: string; icon: React.ReactElement } => {
    if (!ranking || !ranking.warningBadges || ranking.warningBadges.length === 0) {
      return {
        label: 'Risque faible',
        color: 'text-green-600',
        icon: <FiShield className="mr-1 h-5 w-5" />
      };
    }
    
    // Vérifier la présence de badges à sévérité élevée
    const hasHighSeverity = ranking.warningBadges.some(badge => badge.severity === 'high');
    
    // Vérifier le nombre total de badges
    const totalBadges = ranking.warningBadges.length;
    
    if (hasHighSeverity || totalBadges >= 3) {
      return {
        label: 'Risque élevé',
        color: 'text-red-600',
        icon: <FiAlertTriangle className="mr-1 h-5 w-5" />
      };
    } else if (totalBadges >= 1) {
      return {
        label: 'Risque modéré',
        color: 'text-amber-600',
        icon: <FiAlertTriangle className="mr-1 h-5 w-5" />
      };
    }
    
    return {
      label: 'Risque faible',
      color: 'text-green-600',
      icon: <FiShield className="mr-1 h-5 w-5" />
    };
  };
  
  // Obtenir l'affichage du niveau de risque
  const riskLevel = getRiskLevel();
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* En-tête du profil avec avatar et informations de base */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            {freelancer.avatar ? (
              <img 
                src={freelancer.avatar} 
                alt={`${freelancer.name} avatar`}
                className="h-24 w-24 rounded-full border-4 border-white object-cover" 
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">
                  {freelancer.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">{freelancer.name}</h1>
            <p className="text-indigo-100">{(freelancer as any).specialty || 'Freelancer professionnel'}</p>
            
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              {/* Badge de vérification */}
              {freelancer.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FiUserCheck className="mr-1 h-4 w-4" />
                  Vérifié
                </span>
              )}
              
              {/* Badge de niveau */}
              {ranking && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${ranking.tier === 'elite' ? 'bg-purple-100 text-purple-800' :
                   ranking.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                   ranking.tier === 'établi' ? 'bg-green-100 text-green-800' :
                   'bg-gray-100 text-gray-800'}`
                }>
                  <FiAward className="mr-1 h-4 w-4" />
                  {ranking.tier.charAt(0).toUpperCase() + ranking.tier.slice(1)}
                </span>
              )}
              
              {/* Badge d'expérience */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FiCalendar className="mr-1 h-4 w-4" />
                Depuis {new Date((freelancer as any).createdAt || '2023').getFullYear()}
              </span>
              
              {/* Badge de risque, basé sur les badges d'avertissement */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${riskLevel.color === 'text-green-600' ? 'bg-green-100 text-green-800' :
                 riskLevel.color === 'text-amber-600' ? 'bg-amber-100 text-amber-800' :
                 'bg-red-100 text-red-800'}`
              }>
                {riskLevel.icon}
                {riskLevel.label}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onglets du profil */}
      <CustomTabs defaultValue="about" className="mt-6">
        <CustomTabsList>
          <CustomTabsTrigger value="about">
            <FiUserCheck className="mr-2" />
            À propos
          </CustomTabsTrigger>
          <CustomTabsTrigger value="portfolio">Portfolio</CustomTabsTrigger>
          <CustomTabsTrigger value="reviews">Avis</CustomTabsTrigger>
          <CustomTabsTrigger value="services">Services</CustomTabsTrigger>
        </CustomTabsList>
        
        <CustomTabsContent value="about">
          {/* Contenu de l'onglet À propos */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">À propos</h3>
            <p className="text-gray-600">Informations à propos du freelancer...</p>
          </div>
        </CustomTabsContent>
        
        <CustomTabsContent value="portfolio">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Portfolio</h3>
            <p className="text-gray-600">Aucun élément de portfolio n'a encore été ajouté.</p>
          </div>
        </CustomTabsContent>
        
        <CustomTabsContent value="reviews">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avis clients</h3>
            <p className="text-gray-600">Aucun avis n'a encore été publié.</p>
          </div>
        </CustomTabsContent>
        
        <CustomTabsContent value="services">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Services proposés</h3>
            <p className="text-gray-600">Aucun service n'est actuellement proposé.</p>
          </div>
        </CustomTabsContent>
      </CustomTabs>
    </div>
  );
};

export default FreelancerProfile; 