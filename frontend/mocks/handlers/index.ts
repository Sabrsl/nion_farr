import { authHandlers } from './auth';
import { serviceHandlers } from './service';
import { userHandlers } from './user';
import { orderHandlers } from './order';
import { paymentHandlers } from './payment';
import { messageHandlers } from './message';

// Imprimer un message lors de l'initialisation
console.log('[MSW] Initialisation des handlers:');
console.log(`[MSW] - ${authHandlers.length} handlers d'authentification`);
console.log(`[MSW] - ${serviceHandlers.length} handlers de services`);
console.log(`[MSW] - ${userHandlers.length} handlers d'utilisateurs`);
console.log(`[MSW] - ${orderHandlers.length} handlers de commandes`);
console.log(`[MSW] - ${paymentHandlers.length} handlers de paiements`);
console.log(`[MSW] - ${messageHandlers.length} handlers de messages`);

// Exporter tous les handlers pour être utilisés par le worker MSW
export const handlers = [
  ...authHandlers,
  ...serviceHandlers,
  ...userHandlers,
  ...orderHandlers,
  ...paymentHandlers,
  ...messageHandlers
]; 