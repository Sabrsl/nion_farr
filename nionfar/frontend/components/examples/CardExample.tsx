import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Button 
} from '../ui';
import { FiInfo, FiStar, FiUser, FiCalendar } from 'react-icons/fi';

export const CardExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Exemples de composants Card</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte simple */}
        <Card>
          <CardContent>
            <p>Carte simple avec seulement du contenu</p>
          </CardContent>
        </Card>
        
        {/* Carte avec en-tête et contenu */}
        <Card variant="outlined">
          <CardHeader 
            title="Carte avec en-tête" 
            subtitle="Exemple avec sous-titre" 
            icon={<FiInfo />}
            divider
          />
          <CardContent>
            <p>Contenu de la carte avec en-tête</p>
          </CardContent>
        </Card>
        
        {/* Carte complète */}
        <Card variant="elevated" shadow="sm" hoverable>
          <CardHeader 
            title="Carte complète" 
            subtitle="Avec en-tête, contenu et pied de page"
            icon={<FiStar />}
            divider
          />
          <CardContent>
            <div className="space-y-4">
              <p>Contenu principal de la carte</p>
              <div className="flex items-center text-sm text-gray-500">
                <FiUser className="mr-2" />
                <span>John Doe</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar className="mr-2" />
                <span>12 Mai 2023</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Action principale</Button>
            <Button variant="outline">Annuler</Button>
          </CardFooter>
        </Card>
        
        {/* Carte avec padding et radius personnalisés */}
        <Card 
          padding="large" 
          radius="large" 
          className="bg-gradient-to-br from-purple-600 to-blue-500 text-white"
        >
          <CardContent padding="none">
            <h3 className="text-xl font-bold mb-2">Carte personnalisée</h3>
            <p>Avec un style personnalisé et des bords arrondis</p>
          </CardContent>
        </Card>
        
        {/* Carte avec lien */}
        <Card 
          href="/exemple" 
          hoverable 
          className="border-2 border-blue-500"
        >
          <CardHeader 
            title="Carte cliquable" 
            action={<FiStar className="text-yellow-500" />}
          />
          <CardContent>
            <p>Cette carte entière est un lien cliquable</p>
          </CardContent>
        </Card>
        
        {/* Carte avec centrage du contenu */}
        <Card variant="outlined" className="text-center">
          <CardHeader 
            title="Contenu centré" 
            align="center"
            divider
          />
          <CardContent>
            <div className="py-8">
              <p className="mb-4">Exemple de contenu centré</p>
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
                <FiStar size={24} />
              </div>
            </div>
          </CardContent>
          <CardFooter align="center">
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CardExamples; 