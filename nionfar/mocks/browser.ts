import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Ce worker sera responsable de l'interception des requêtes dans l'environnement du navigateur
export const worker = setupWorker(...handlers); 