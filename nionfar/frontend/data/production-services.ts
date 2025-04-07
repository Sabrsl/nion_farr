/**
 * @deprecated Ce fichier est obsolète et ne doit plus être utilisé.
 * Toutes les données de services doivent désormais provenir de l'API via serviceExplorer.
 * Voir /services/serviceExplorerService.ts pour les méthodes à utiliser.
 */

import { Service } from '../types';
import { categories } from './categories';

// Template de service minimal
const emptyServiceTemplate: Partial<Service> = {
  rating: 0,
  totalReviews: 0,
  price: 0,
  deliveryTime: 0,
  images: [],
  tags: [],
  orderCount: 0,
  isActive: true,
  createdAt: new Date().toISOString()
};

// Services vides pour la production - un placeholder par catégorie
export const productionServices: Service[] = categories.map((category, index) => ({
  ...emptyServiceTemplate,
  id: `${index + 1}`,
  title: `Service ${category.name}`,
  description: `Description du service ${category.name}`,
  slug: `service-${category.slug}`,
  provider: {
    id: "admin",
    name: "Administrateur",
    avatar: "/img/avatars/default.jpg",
    level: "Admin"
  },
  category: {
    id: category.id,
    name: category.name
  }
} as Service));

// Export d'une fonction pour obtenir les services par catégorie
export const getServicesByCategory = (categoryId: string) => {
  return productionServices.filter(service => 
    service.category && typeof service.category === 'object' && service.category.id === categoryId
  );
};

// Export d'une fonction pour obtenir un service par son ID
export const getServiceById = (id: string) => {
  return productionServices.find(service => service.id === id);
};

// Export d'une fonction pour obtenir un service par son slug
export const getServiceBySlug = (slug: string) => {
  return productionServices.find(service => service.slug === slug);
}; 