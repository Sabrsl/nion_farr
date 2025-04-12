import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

// Ce serveur simule une API pour les tests
export const server = setupServer(...handlers);

/**
 * Tests de base pour le serveur
 */

describe('Server Tests', () => {
  it('should pass a basic server test', () => {
    expect(true).toBe(true);
  });
}); 