import { authHandlers } from './auth';
import { serviceHandlers } from './service';
import { orderHandlers } from './order';
import { paymentHandlers } from './payment';
import { userHandlers } from './user';
import { disputeHandlers } from './dispute';

// Exporter tous les handlers pour être utilisés par le worker MSW
export const handlers = [
  ...authHandlers,
  ...serviceHandlers,
  ...orderHandlers,
  ...paymentHandlers,
  ...userHandlers,
  ...disputeHandlers,
]; 