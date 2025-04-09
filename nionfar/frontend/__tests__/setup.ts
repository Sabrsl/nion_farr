import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from '@jest/globals';
import { server } from './server';

beforeAll(() => {
  // Démarrer le serveur MSW pour les tests
  server.listen();
});

afterEach(() => {
  // Réinitialiser les handlers après chaque test
  server.resetHandlers();
});

afterAll(() => {
  // Fermer le serveur MSW après tous les tests
  server.close();
}); 