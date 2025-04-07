import { Service } from '../types';
import { serviceExplorer } from '../services/serviceExplorerService';

// OBSOLÈTE : Cette exportation est maintenue temporairement pour compatibilité
// mais l'application devrait utiliser serviceExplorer directement
// Vous obtiendrez un tableau vide si vous utilisez cette variable
export const mockServices: Service[] = [];

// Ces fonctions sont maintenues pour la compatibilité mais utilisent l'API
// Il est fortement recommandé d'utiliser serviceExplorer directement
export const getServicesByCategory = async (categoryId: string) => {
  const result = await serviceExplorer.getServicesByCategory(categoryId);
  return result.services || [];
};

export const getServiceById = async (id: string) => {
  return await serviceExplorer.getServiceById(id);
};

export const getServiceBySlug = async (slug: string) => {
  return await serviceExplorer.getServiceBySlug(slug);
};

// Export par défaut vide pour compatibilité
export default []; 