import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 500;

// Données mockées pour les paiements
const mockPayments = [
  {
    id: 'payment-1',
    orderId: 'order-1',
    clientId: 'user-123',
    providerId: 'user-456',
    amount: 15000,
    currency: 'XOF',
    status: 'succès',
    paymentMethod: 'orange_money',
    transactionId: 'tx-789012',
    paymentDate: '2023-10-08T10:30:00Z',
    createdAt: '2023-10-08T10:30:00Z',
    updatedAt: '2023-10-08T10:30:00Z'
  },
  {
    id: 'payment-2',
    orderId: 'order-2',
    clientId: 'user-123',
    providerId: 'user-789',
    amount: 50000,
    currency: 'XOF',
    status: 'succès',
    paymentMethod: 'wave',
    transactionId: 'tx-345678',
    paymentDate: '2023-10-15T14:20:00Z',
    createdAt: '2023-10-15T14:20:00Z',
    updatedAt: '2023-10-15T14:20:00Z'
  }
];

export const paymentHandlers = [
  // Récupérer l'historique des paiements d'un utilisateur
  http.get('/api/payments/history', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role') || 'client'; // 'client' ou 'provider'
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    let filteredPayments = [...mockPayments];
    
    if (role === 'client') {
      filteredPayments = filteredPayments.filter(payment => payment.clientId === userId);
    } else if (role === 'provider') {
      filteredPayments = filteredPayments.filter(payment => payment.providerId === userId);
    }
    
    return HttpResponse.json({
      success: true,
      payments: filteredPayments,
      totalCount: filteredPayments.length
    });
  }),
  
  // Récupérer les détails d'un paiement
  http.get('/api/payments/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const payment = mockPayments.find(p => p.id === id);
    
    if (!payment) {
      return HttpResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      payment
    });
  }),
  
  // Initier un paiement
  http.post('/api/payments/initiate', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const paymentData = await request.json();
    
    // Validation basique
    if (!paymentData.orderId || !paymentData.clientId || !paymentData.amount || !paymentData.paymentMethod) {
      return HttpResponse.json(
        { success: false, error: 'Informations de paiement manquantes' },
        { status: 400 }
      );
    }
    
    // Vérifier que la méthode de paiement est valide
    const validMethods = ['orange_money', 'wave', 'free_money', 'carte_bancaire'];
    if (!validMethods.includes(paymentData.paymentMethod)) {
      return HttpResponse.json(
        { success: false, error: 'Méthode de paiement non supportée' },
        { status: 400 }
      );
    }
    
    // Simulation de l'initialisation du paiement
    const paymentSession = {
      id: `session-${Date.now()}`,
      ...paymentData,
      status: 'initié',
      redirectUrl: `https://nionfar.sn/payment/session-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };
    
    return HttpResponse.json({
      success: true,
      paymentSession,
      message: 'Session de paiement initiée'
    }, { status: 201 });
  }),
  
  // Confirmer un paiement (webhook simulé)
  http.post('/api/payments/confirm', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { sessionId, status, transactionId } = await request.json();
    
    if (!sessionId || !status) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    // Simuler un échec aléatoire (20% de chances)
    const isSuccessful = Math.random() > 0.2;
    
    if (!isSuccessful) {
      return HttpResponse.json({
        success: false,
        status: 'échec',
        error: 'Paiement échoué. Veuillez réessayer.'
      });
    }
    
    // Créer un nouveau paiement réussi
    const newPayment = {
      id: `payment-${Date.now()}`,
      // Ces valeurs seraient normalement extraites de la session de paiement dans une implémentation réelle
      orderId: `order-${Math.floor(Math.random() * 100)}`,
      clientId: 'user-123',
      providerId: 'user-456', 
      amount: Math.floor(Math.random() * 50000) + 5000,
      currency: 'XOF',
      status: 'succès',
      paymentMethod: ['orange_money', 'wave', 'free_money', 'carte_bancaire'][Math.floor(Math.random() * 4)],
      transactionId: transactionId || `tx-${Date.now()}`,
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      payment: newPayment,
      message: 'Paiement confirmé avec succès'
    });
  }),
  
  // Vérifier le statut d'un paiement
  http.get('/api/payments/status/:sessionId', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { sessionId } = params;
    
    // Simuler différents statuts aléatoirement
    const statuses = ['en_attente', 'traitement', 'succès', 'échec', 'expiré'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return HttpResponse.json({
      success: true,
      sessionId,
      status: randomStatus,
      updatedAt: new Date().toISOString()
    });
  }),
  
  // Rembourser un paiement
  http.post('/api/payments/refund', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { paymentId, reason, adminId } = await request.json();
    
    if (!paymentId || !adminId) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    const payment = mockPayments.find(p => p.id === paymentId);
    
    if (!payment) {
      return HttpResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }
    
    // Simuler le remboursement
    const refund = {
      id: `refund-${Date.now()}`,
      paymentId,
      amount: payment.amount,
      currency: payment.currency,
      reason: reason || 'Remboursement demandé par l\'administrateur',
      status: 'traitement',
      refundedBy: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      refund,
      message: 'Demande de remboursement initiée'
    });
  })
]; 