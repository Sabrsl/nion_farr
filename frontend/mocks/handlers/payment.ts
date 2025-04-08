import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 100;

// Types pour les requêtes de paiement
interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: 'orange_money' | 'wave' | 'carte_bancaire';
  paymentDetails?: any;
}

interface CheckPaymentStatusRequest {
  paymentId: string;
}

interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  phoneNumber?: string; // Pour Wave/Orange Money
  returnUrl?: string;   // Pour redirection après paiement
}

// Paiements simulés
const mockPayments = [
  {
    id: 'payment-1',
    orderId: 'order-1',
    amount: 15000,
    method: 'orange_money',
    status: 'completed',
    transactionId: 'omn-123456789',
    createdAt: '2025-04-01T12:30:00Z',
    completedAt: '2025-04-01T12:35:00Z'
  },
  {
    id: 'payment-2',
    orderId: 'order-2',
    amount: 50000,
    method: 'wave',
    status: 'pending',
    transactionId: 'wave-987654321',
    createdAt: '2025-04-05T15:45:00Z',
    completedAt: null
  }
];

export const paymentHandlers = [
  // Traiter un paiement
  http.post('/api/payments/process-payment', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const data = await request.json() as ProcessPaymentRequest;
      console.log('[MSW] Traitement de paiement:', data);
      
      // Simuler un paiement réussi
      const paymentId = 'payment-' + Date.now();
      const transactionId = `${data.paymentMethod}-${Date.now()}`;
      
      const newPayment = {
        id: paymentId,
        orderId: data.orderId,
        amount: data.amount,
        method: data.paymentMethod,
        status: 'completed',
        transactionId,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      // Ajouter le paiement à notre liste simulée
      mockPayments.push(newPayment);
      
      return HttpResponse.json({
        success: true,
        payment: newPayment,
        message: 'Paiement traité avec succès'
      });
    } catch (error) {
      console.error('[MSW] Erreur lors du traitement du paiement:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors du traitement du paiement' },
        { status: 400 }
      );
    }
  }),
  
  // Vérifier le statut d'un paiement
  http.get('/api/payments/:paymentId/status', async ({ params }) => {
    await delay(NETWORK_DELAY);
    
    const { paymentId } = params;
    console.log(`[MSW] Vérification du statut du paiement: ${paymentId}`);
    
    const payment = mockPayments.find(p => p.id === paymentId);
    
    if (!payment) {
      return HttpResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      payment,
      status: payment.status
    });
  }),
  
  // Initier un paiement Orange Money
  http.post('/api/payments/orange-money/initiate', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const data = await request.json() as InitiatePaymentRequest;
      console.log('[MSW] Initiation paiement Orange Money:', data);
      
      if (!data.phoneNumber) {
        return HttpResponse.json(
          { success: false, error: 'Numéro de téléphone requis' },
          { status: 400 }
        );
      }
      
      // Simuler une initiation réussie
      const paymentId = 'payment-om-' + Date.now();
      
      return HttpResponse.json({
        success: true,
        paymentId,
        message: `Demande de paiement envoyée au ${data.phoneNumber}. Veuillez confirmer sur votre téléphone.`,
        redirectUrl: data.returnUrl || '/dashboard/payment/status?id=' + paymentId
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de l\'initiation du paiement Orange Money:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de l\'initiation du paiement' },
        { status: 400 }
      );
    }
  }),
  
  // Initier un paiement Wave
  http.post('/api/payments/wave/initiate', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const data = await request.json() as InitiatePaymentRequest;
      console.log('[MSW] Initiation paiement Wave:', data);
      
      if (!data.phoneNumber) {
        return HttpResponse.json(
          { success: false, error: 'Numéro de téléphone requis' },
          { status: 400 }
        );
      }
      
      // Simuler une initiation réussie
      const paymentId = 'payment-wave-' + Date.now();
      
      return HttpResponse.json({
        success: true,
        paymentId,
        message: `Demande de paiement envoyée au ${data.phoneNumber}. Veuillez confirmer sur l'application Wave.`,
        redirectUrl: data.returnUrl || '/dashboard/payment/status?id=' + paymentId
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de l\'initiation du paiement Wave:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de l\'initiation du paiement' },
        { status: 400 }
      );
    }
  })
]; 