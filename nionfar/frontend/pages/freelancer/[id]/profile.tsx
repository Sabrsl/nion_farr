import React from 'react';
import { useRouter } from 'next/router';
import FreelancerProfile from '../../../components/freelancer/FreelancerProfile';
import FreelancerRankingCard from '../../../components/freelancer/FreelancerRankingCard';
import Layout from '../../../components/layout/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';

const FreelancerProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const freelancerId = Array.isArray(id) ? id[0] : id || '';

  return (
    <Layout title="Profil Freelancer">
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne de gauche: Profil du freelancer */}
          <div className="md:col-span-2">
            <FreelancerProfile userId={freelancerId} />
            
            <Tabs defaultValue="portfolio" className="mt-6">
              <TabsList>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="disputes">Litiges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Portfolio</h3>
                  <p className="text-gray-600">Aucun élément de portfolio n'a encore été ajouté.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Avis clients</h3>
                  <p className="text-gray-600">Aucun avis n'a encore été publié.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="services">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Services proposés</h3>
                  <p className="text-gray-600">Aucun service n'est actuellement proposé.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="disputes">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des litiges</h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-600">
                    <p>Cette section n'est visible que par les administrateurs et le freelancer concerné.</p>
                    <p className="mt-2">L'historique complet des litiges et leur résolution est disponible dans le tableau de bord d'administration.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Colonne de droite: Classement et autres informations */}
          <div className="space-y-6">
            {/* Nouveau composant de classement */}
            <FreelancerRankingCard userId={freelancerId} showDetailed={true} />
            
            {/* Statistiques rapides */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">98%</div>
                  <div className="text-xs text-gray-500">Taux de satisfaction</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">24h</div>
                  <div className="text-xs text-gray-500">Temps de réponse</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">56</div>
                  <div className="text-xs text-gray-500">Projets terminés</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">3</div>
                  <div className="text-xs text-gray-500">Années d'expérience</div>
                </div>
              </div>
            </div>
            
            {/* Disponibilité */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Disponibilité</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Statut actuel</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Disponible</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Délai de livraison moyen</span>
                <span className="text-sm font-medium text-gray-800">3 jours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Prochaine disponibilité</span>
                <span className="text-sm font-medium text-gray-800">Immédiate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerProfilePage; 