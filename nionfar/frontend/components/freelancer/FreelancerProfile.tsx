import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Alert, Spinner } from '../ui/common';

interface FreelancerProfileProps {
  userId: string;
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

const FreelancerProfile: React.FC<FreelancerProfileProps> = ({ userId, className = '' }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<FreelancerData | null>(null);

  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      try {
        setLoading(true);
        
        // Simuler un appel à l'API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // En production, remplacer par un appel réel à l'API
        const mockProfile: FreelancerData = {
          id: userId,
          username: 'freelancer123',
          fullName: 'Sophie Diouf',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          coverImage: 'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          title: 'Designer graphique & Illustratrice',
          description: 'Je suis une designer graphique passionnée avec plus de 5 ans d\'expérience. Spécialisée dans la création d\'identités visuelles et d\'illustrations pour des marques et des entreprises. Je m\'engage à offrir un travail de qualité dans les délais impartis.',
          location: 'Dakar, Sénégal',
          joinedDate: '2021-03-15',
          isVerified: true,
          languages: [
            { language: 'Français', level: 'Natif' },
            { language: 'Anglais', level: 'Professionnel' },
            { language: 'Wolof', level: 'Natif' }
          ],
          skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'UI/UX Design', 'Branding', 'Illustration'],
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/freelancer123' },
            { platform: 'linkedin', url: 'https://linkedin.com/in/freelancer123' },
            { platform: 'behance', url: 'https://behance.net/freelancer123' }
          ],
          contactEmail: 'contact@sophiediouf.com',
          phone: '+221 xx xx xx xx',
          categories: ['Design graphique', 'Illustration', 'Design d\'identité visuelle'],
          responseTime: '2-3 heures'
        };
        
        setProfile(mockProfile);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Impossible de charger les informations du profil');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchFreelancerProfile();
    }
  }, [userId]);
  
  // Formater la date d'inscription
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 flex justify-center items-center ${className}`}>
        <Spinner size="medium" />
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <Alert 
        type="error"
        title="Erreur de chargement"
        message={error || "Données du profil non disponibles"}
        className={className}
      />
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Image de couverture */}
      <div className="relative h-48 bg-gray-200">
        {profile.coverImage && (
          <div className="w-full h-full relative">
            {/* En production, utilisez l'élément Image de Next.js */}
            <img
              src={profile.coverImage}
              alt="Couverture"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Informations de base */}
      <div className="relative px-6 pb-5">
        {/* Avatar */}
        <div className="absolute -top-16 left-6 rounded-full border-4 border-white bg-white shadow-md">
          <div className="w-32 h-32 rounded-full overflow-hidden relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-2xl text-gray-600">
                  {profile.fullName.charAt(0)}
                </span>
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Informations principales */}
        <div className="mt-16 pt-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profile.fullName}</h1>
              <p className="text-gray-600">{profile.title}</p>
            </div>
            <div className="flex space-x-2">
              {profile.socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {/* Icônes pour les réseaux sociaux (à remplacer par des icônes réelles) */}
                  <span>{link.platform.charAt(0).toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            <span>{profile.location}</span>
            <span className="mx-2">•</span>
            <span>Membre depuis {formatJoinDate(profile.joinedDate)}</span>
          </div>
          
          {/* Description */}
          <div className="mt-4">
            <p className="text-gray-700">{profile.description}</p>
          </div>
          
          {/* Compétences */}
          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Informations supplémentaires */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-2">Langues</h3>
              <ul className="space-y-1">
                {profile.languages.map((lang, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{lang.language}</span>: {lang.level}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-2">Catégories</h3>
              <ul className="space-y-1">
                {profile.categories.map((category, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {category}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Informations de contact */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">Temps de réponse:</span>
              <span className="text-sm text-gray-600">{profile.responseTime}</span>
            </div>
            
            {profile.contactEmail && (
              <div className="mt-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <a href={`mailto:${profile.contactEmail}`} className="text-sm text-blue-600 hover:underline">
                  {profile.contactEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile; 