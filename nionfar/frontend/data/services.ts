import { Service } from '../types';
import { productionServices, getServicesByCategory, getServiceById, getServiceBySlug } from './production-services';

// Pour la compatibilité avec le code existant, nous exposons également les mock services
// mais en utilisant les services de production
export const mockServices: Service[] = productionServices;

// Export des fonctions utilitaires
export { getServicesByCategory, getServiceById, getServiceBySlug };

// Export par défaut des services de production
export default productionServices; 