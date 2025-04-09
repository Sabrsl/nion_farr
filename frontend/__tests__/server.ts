import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

// Ce serveur simule une API pour les tests
export const server = setupServer(...handlers); 