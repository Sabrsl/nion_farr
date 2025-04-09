import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 500;

// Type pour les messages de litige
type DisputeMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  files?: string[]; // Champ optionnel pour les fichiers
};

// Données mockées pour les litiges
const mockDisputes = [
  {
    id: 'dispute-1',
    orderId: 'order-1',
    clientId: 'user-123',
    providerId: 'user-456',
    title: 'Problème de qualité du livrable',
    description: 'Le logo livré ne correspond pas aux spécifications demandées. Les couleurs sont incorrectes et la résolution est trop basse.',
    status: 'en_cours',
    createdAt: '2023-10-10T14:30:00Z',
    updatedAt: '2023-10-10T14:30:00Z',
    reason: 'qualité',
    evidenceFiles: [
      'https://example.com/evidence1.jpg',
      'https://example.com/evidence2.jpg'
    ],
    messages: [
      {
        id: 'dispute-msg-1',
        senderId: 'user-123',
        content: 'Le logo que j\'ai reçu n\'est pas conforme à mes attentes, voici pourquoi...',
        createdAt: '2023-10-10T14:30:00Z',
        isRead: true
      },
      {
        id: 'dispute-msg-2',
        senderId: 'user-456',
        content: 'Je suis désolé pour cette confusion. Pouvez-vous préciser quels éléments ne correspondent pas à vos attentes ?',
        createdAt: '2023-10-10T15:15:00Z',
        isRead: true
      },
      {
        id: 'dispute-msg-3',
        senderId: 'admin-1',
        content: 'Bonjour, je suis l\'administrateur en charge de votre litige. Je vais examiner votre cas et vous tiendrai informé.',
        createdAt: '2023-10-11T09:30:00Z',
        isRead: true
      }
    ],
    resolution: null,
    refundAmount: null,
    assignedAdminId: 'admin-1'
  },
  {
    id: 'dispute-2',
    orderId: 'order-2',
    clientId: 'user-123',
    providerId: 'user-789',
    title: 'Retard de livraison',
    description: 'Le prestataire n\'a pas livré le site web dans les délais convenus, ce qui a impacté le lancement de mon cabinet médical.',
    status: 'résolu',
    createdAt: '2023-10-16T10:00:00Z',
    updatedAt: '2023-10-18T16:45:00Z',
    closedAt: '2023-10-18T16:45:00Z',
    reason: 'retard',
    evidenceFiles: [],
    messages: [
      {
        id: 'dispute-msg-4',
        senderId: 'user-123',
        content: 'Le site n\'a pas été livré dans les délais prévus, ce qui a causé des problèmes dans mon planning d\'ouverture.',
        createdAt: '2023-10-16T10:00:00Z',
        isRead: true
      },
      {
        id: 'dispute-msg-5',
        senderId: 'user-789',
        content: 'Je présente mes excuses pour ce retard. J\'ai rencontré des difficultés techniques imprévues.',
        createdAt: '2023-10-16T11:20:00Z',
        isRead: true
      },
      {
        id: 'dispute-msg-6',
        senderId: 'admin-2',
        content: 'Après examen du cas, nous proposons une réduction de 20% sur le prix du service.',
        createdAt: '2023-10-17T14:10:00Z',
        isRead: true
      },
      {
        id: 'dispute-msg-7',
        senderId: 'user-123',
        content: 'J\'accepte cette proposition.',
        createdAt: '2023-10-18T09:30:00Z',
        isRead: true
      }
    ],
    resolution: 'remboursement_partiel',
    refundAmount: 10000, // 20% de 50000
    assignedAdminId: 'admin-2'
  }
];

// Données mockées pour les tickets de support
const mockSupportTickets = [
  {
    id: 'ticket-1',
    userId: 'user-123',
    title: 'Question sur le processus de paiement',
    description: 'Je voudrais comprendre comment fonctionne le processus de paiement sur la plateforme, notamment les frais appliqués.',
    category: 'paiement',
    priority: 'normale',
    status: 'ouvert',
    createdAt: '2023-10-15T11:20:00Z',
    updatedAt: '2023-10-15T11:20:00Z',
    messages: [
      {
        id: 'ticket-msg-1',
        senderId: 'user-123',
        content: 'Bonjour, pourriez-vous m\'expliquer comment fonctionnent les paiements sur la plateforme ?',
        createdAt: '2023-10-15T11:20:00Z',
        isRead: true
      }
    ],
    assignedAgentId: null
  },
  {
    id: 'ticket-2',
    userId: 'user-456',
    title: 'Problème technique lors de la livraison',
    description: 'Je n\'arrive pas à télécharger des fichiers de plus de 10MB lors de la livraison d\'une commande.',
    category: 'technique',
    priority: 'élevée',
    status: 'en_cours',
    createdAt: '2023-10-14T09:45:00Z',
    updatedAt: '2023-10-14T15:30:00Z',
    messages: [
      {
        id: 'ticket-msg-2',
        senderId: 'user-456',
        content: 'Je rencontre un problème lors de l\'upload de fichiers volumineux.',
        createdAt: '2023-10-14T09:45:00Z',
        isRead: true
      },
      {
        id: 'ticket-msg-3',
        senderId: 'support-1',
        content: 'Bonjour, merci pour votre message. Pouvez-vous me préciser le navigateur et le système d\'exploitation que vous utilisez ?',
        createdAt: '2023-10-14T10:30:00Z',
        isRead: true
      },
      {
        id: 'ticket-msg-4',
        senderId: 'user-456',
        content: 'J\'utilise Chrome sur Windows 10.',
        createdAt: '2023-10-14T11:15:00Z',
        isRead: true
      },
      {
        id: 'ticket-msg-5',
        senderId: 'support-1',
        content: 'Merci pour ces précisions. Nous avons identifié le problème et nos équipes techniques travaillent à sa résolution. Nous vous tiendrons informé.',
        createdAt: '2023-10-14T15:30:00Z',
        isRead: false
      }
    ],
    assignedAgentId: 'support-1'
  }
];

export const disputeHandlers = [
  // Récupérer les litiges d'un utilisateur
  http.get('/api/disputes', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role'); // 'client' ou 'provider'
    const status = url.searchParams.get('status');
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    let filteredDisputes = [...mockDisputes];
    
    // Filtrer par rôle de l'utilisateur
    if (role === 'client') {
      filteredDisputes = filteredDisputes.filter(dispute => dispute.clientId === userId);
    } else if (role === 'provider') {
      filteredDisputes = filteredDisputes.filter(dispute => dispute.providerId === userId);
    } else if (role === 'admin') {
      // Pour les admins, on peut récupérer tous les litiges ou ceux qui leur sont assignés
      if (url.searchParams.get('assignedToMe') === 'true') {
        filteredDisputes = filteredDisputes.filter(dispute => dispute.assignedAdminId === userId);
      }
    } else {
      // Si aucun rôle n'est spécifié, on vérifie les deux
      filteredDisputes = filteredDisputes.filter(
        dispute => dispute.clientId === userId || dispute.providerId === userId
      );
    }
    
    // Filtrer par statut
    if (status) {
      filteredDisputes = filteredDisputes.filter(dispute => dispute.status === status);
    }
    
    return HttpResponse.json({
      success: true,
      disputes: filteredDisputes,
      totalCount: filteredDisputes.length
    });
  }),
  
  // Récupérer un litige par ID
  http.get('/api/disputes/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const dispute = mockDisputes.find(d => d.id === id);
    
    if (!dispute) {
      return HttpResponse.json(
        { success: false, error: 'Litige non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      dispute
    });
  }),
  
  // Créer un nouveau litige
  http.post('/api/disputes/create', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const disputeData = await request.json();
    
    // Validation basique
    if (!disputeData.orderId || !disputeData.clientId || !disputeData.providerId || !disputeData.title || !disputeData.description || !disputeData.reason) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    // Créer un nouveau litige
    const newDispute = {
      id: `dispute-${Date.now()}`,
      ...disputeData,
      status: 'ouvert',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `dispute-msg-${Date.now()}`,
          senderId: disputeData.clientId,
          content: disputeData.description,
          createdAt: new Date().toISOString(),
          isRead: false
        }
      ],
      resolution: null,
      refundAmount: null,
      assignedAdminId: null
    };
    
    return HttpResponse.json({
      success: true,
      dispute: newDispute,
      message: 'Litige créé avec succès'
    }, { status: 201 });
  }),
  
  // Ajouter un message à un litige
  http.post('/api/disputes/:id/messages', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const { userId, content, files } = await request.json();
    
    if (!userId || !content) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    const disputeIndex = mockDisputes.findIndex(d => d.id === id);
    
    if (disputeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Litige non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est autorisé à ajouter un message
    const dispute = mockDisputes[disputeIndex];
    const isParticipant = userId === dispute.clientId || userId === dispute.providerId || userId === dispute.assignedAdminId;
    
    if (!isParticipant) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à participer à ce litige' },
        { status: 403 }
      );
    }
    
    // Ajouter le message
    const newMessage: DisputeMessage = {
      id: `dispute-msg-${Date.now()}`,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
      files: files || []
    };
    
    const updatedDispute = {
      ...dispute,
      messages: [...dispute.messages, newMessage],
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      message: newMessage,
      dispute: updatedDispute
    });
  }),
  
  // Résoudre un litige
  http.post('/api/disputes/:id/resolve', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const { adminId, resolution, refundAmount, reason } = await request.json();
    
    if (!adminId || !resolution) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    const disputeIndex = mockDisputes.findIndex(d => d.id === id);
    
    if (disputeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Litige non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est un administrateur
    // Dans une vraie implémentation, nous vérifierions le rôle
    // Pour MSW, nous supposons que tous les IDs commençant par 'admin-' sont des administrateurs
    if (!adminId.startsWith('admin-')) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à résoudre des litiges' },
        { status: 403 }
      );
    }
    
    // Créer un message de résolution
    let resolutionMessage = 'Le litige a été résolu.';
    
    if (resolution === 'remboursement_total') {
      resolutionMessage = 'Le litige a été résolu en faveur du client. Un remboursement total a été effectué.';
    } else if (resolution === 'remboursement_partiel') {
      resolutionMessage = `Le litige a été résolu avec un remboursement partiel de ${refundAmount} XOF.`;
    } else if (resolution === 'en_faveur_prestataire') {
      resolutionMessage = 'Le litige a été résolu en faveur du prestataire. Aucun remboursement n\'a été effectué.';
    }
    
    if (reason) {
      resolutionMessage += ` Motif: ${reason}`;
    }
    
    // Mettre à jour le litige
    const updatedDispute = {
      ...mockDisputes[disputeIndex],
      status: 'résolu',
      resolution,
      refundAmount,
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        ...mockDisputes[disputeIndex].messages,
        {
          id: `dispute-msg-${Date.now()}`,
          senderId: adminId,
          content: resolutionMessage,
          createdAt: new Date().toISOString(),
          isRead: false
        }
      ]
    };
    
    return HttpResponse.json({
      success: true,
      dispute: updatedDispute,
      message: 'Litige résolu avec succès'
    });
  }),
  
  // API pour les tickets de support
  
  // Récupérer les tickets de support d'un utilisateur
  http.get('/api/support/tickets', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role'); // 'user' ou 'agent'
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    let filteredTickets = [...mockSupportTickets];
    
    // Filtrer par utilisateur ou agent
    if (role === 'user') {
      filteredTickets = filteredTickets.filter(ticket => ticket.userId === userId);
    } else if (role === 'agent') {
      filteredTickets = filteredTickets.filter(ticket => ticket.assignedAgentId === userId);
    }
    
    // Filtrer par statut
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    return HttpResponse.json({
      success: true,
      tickets: filteredTickets,
      totalCount: filteredTickets.length
    });
  }),
  
  // Récupérer un ticket de support par ID
  http.get('/api/support/tickets/:id', async ({ params }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    
    const ticket = mockSupportTickets.find(t => t.id === id);
    
    if (!ticket) {
      return HttpResponse.json(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      ticket
    });
  }),
  
  // Créer un nouveau ticket de support
  http.post('/api/support/tickets', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const ticketData = await request.json();
    
    // Validation basique
    if (!ticketData.userId || !ticketData.title || !ticketData.description || !ticketData.category) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    // Créer un nouveau ticket
    const newTicket = {
      id: `ticket-${Date.now()}`,
      ...ticketData,
      priority: ticketData.priority || 'normale',
      status: 'ouvert',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `ticket-msg-${Date.now()}`,
          senderId: ticketData.userId,
          content: ticketData.description,
          createdAt: new Date().toISOString(),
          isRead: false
        }
      ],
      assignedAgentId: null
    };
    
    return HttpResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Ticket créé avec succès'
    }, { status: 201 });
  }),
  
  // Ajouter une réponse à un ticket
  http.post('/api/support/tickets/:id/messages', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const { userId, content } = await request.json();
    
    if (!userId || !content) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    const ticketIndex = mockSupportTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est autorisé à répondre
    const ticket = mockSupportTickets[ticketIndex];
    const isAuthorized = userId === ticket.userId || userId === ticket.assignedAgentId || userId.startsWith('support-');
    
    if (!isAuthorized) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à répondre à ce ticket' },
        { status: 403 }
      );
    }
    
    // Ajouter la réponse
    const newMessage = {
      id: `ticket-msg-${Date.now()}`,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Mettre à jour le ticket
    const updatedTicket = {
      ...ticket,
      messages: [...ticket.messages, newMessage],
      status: ticket.status === 'ouvert' ? 'en_cours' : ticket.status,
      updatedAt: new Date().toISOString(),
      // Si c'est un agent de support qui répond et que le ticket n'est pas assigné, l'assigner
      assignedAgentId: ticket.assignedAgentId || (userId.startsWith('support-') ? userId : null)
    };
    
    return HttpResponse.json({
      success: true,
      message: newMessage,
      ticket: updatedTicket
    });
  }),
  
  // Mettre à jour le statut d'un ticket
  http.put('/api/support/tickets/:id/status', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { id } = params;
    const { userId, status } = await request.json();
    
    if (!userId || !status) {
      return HttpResponse.json(
        { success: false, error: 'Informations manquantes' },
        { status: 400 }
      );
    }
    
    const ticketIndex = mockSupportTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est un agent de support
    if (!userId.startsWith('support-')) {
      return HttpResponse.json(
        { success: false, error: 'Non autorisé à modifier le statut de ce ticket' },
        { status: 403 }
      );
    }
    
    // Mettre à jour le ticket
    const updatedTicket = {
      ...mockSupportTickets[ticketIndex],
      status,
      updatedAt: new Date().toISOString(),
      // Si le ticket est fermé, ajouter une date de clôture
      ...(status === 'fermé' && { closedAt: new Date().toISOString() })
    };
    
    return HttpResponse.json({
      success: true,
      ticket: updatedTicket,
      message: `Statut du ticket mis à jour: ${status}`
    });
  })
]; 