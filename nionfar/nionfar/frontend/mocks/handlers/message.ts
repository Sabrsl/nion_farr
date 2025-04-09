import { http, HttpResponse, delay } from 'msw';

const NETWORK_DELAY = 100;

// Types pour les messages
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  orderId?: string;
  title?: string;
}

interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
}

interface CreateConversationRequest {
  senderId: string;
  receiverId: string;
  initialMessage: string;
  orderId?: string;
  title?: string;
}

// Conversations et messages simulés
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-123', 'user-456'],
    createdAt: '2025-04-01T10:15:00Z',
    updatedAt: '2025-04-03T14:30:00Z',
    orderId: 'order-1',
    title: 'Création de logo pour entreprise'
  },
  {
    id: 'conv-2',
    participants: ['user-123', 'user-789'],
    createdAt: '2025-04-02T09:20:00Z',
    updatedAt: '2025-04-05T11:45:00Z',
    orderId: 'order-2',
    title: 'Développement site web vitrine'
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-123',
    receiverId: 'user-456',
    content: 'Bonjour, j\'ai besoin d\'un logo pour mon entreprise',
    createdAt: '2025-04-01T10:15:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-456',
    receiverId: 'user-123',
    content: 'Bonjour ! Je serais ravi de vous aider. Pouvez-vous me donner plus de détails sur votre entreprise ?',
    createdAt: '2025-04-01T10:45:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    conversationId: 'conv-2',
    senderId: 'user-123',
    receiverId: 'user-789',
    content: 'Bonjour, je souhaite créer un site web pour ma société',
    createdAt: '2025-04-02T09:20:00Z',
    isRead: true
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'user-789',
    receiverId: 'user-123',
    content: 'Bonjour, merci pour votre message. Quels sont vos besoins exacts pour ce site ?',
    createdAt: '2025-04-02T09:35:00Z',
    isRead: false
  }
];

// Mettre à jour les conversations avec le dernier message
mockConversations.forEach(conv => {
  const messages = mockMessages.filter(msg => msg.conversationId === conv.id);
  if (messages.length > 0) {
    // Trier les messages par date de création (du plus récent au plus ancien)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    conv.lastMessage = sortedMessages[0];
  }
});

export const messageHandlers = [
  // Récupérer toutes les conversations d'un utilisateur
  http.get('/api/conversations', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log(`[MSW] Récupération des conversations pour userId: ${userId || 'non spécifié'}`);
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'UserId requis' },
        { status: 400 }
      );
    }
    
    // Filtrer les conversations où l'utilisateur est un participant
    const userConversations = mockConversations.filter(conv => 
      conv.participants.includes(userId)
    );
    
    return HttpResponse.json({
      success: true,
      conversations: userConversations,
      unreadCount: userConversations.filter(conv => 
        conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.receiverId === userId
      ).length
    });
  }),
  
  // Récupérer les messages d'une conversation
  http.get('/api/conversations/:conversationId/messages', async ({ params }) => {
    await delay(NETWORK_DELAY);
    
    const { conversationId } = params;
    console.log(`[MSW] Récupération des messages pour la conversation: ${conversationId}`);
    
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }
    
    // Récupérer tous les messages de cette conversation
    const messages = mockMessages.filter(msg => msg.conversationId === conversationId);
    
    // Trier les messages par date (du plus ancien au plus récent)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return HttpResponse.json({
      success: true,
      conversation,
      messages: sortedMessages
    });
  }),
  
  // Envoyer un nouveau message
  http.post('/api/messages/send', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const data = await request.json() as SendMessageRequest;
      console.log('[MSW] Envoi d\'un nouveau message:', data);
      
      if (!data.conversationId || !data.senderId || !data.receiverId || !data.content.trim()) {
        return HttpResponse.json(
          { success: false, error: 'Données incomplètes' },
          { status: 400 }
        );
      }
      
      // Vérifier que la conversation existe
      const conversation = mockConversations.find(conv => conv.id === data.conversationId);
      
      if (!conversation) {
        return HttpResponse.json(
          { success: false, error: 'Conversation non trouvée' },
          { status: 404 }
        );
      }
      
      // Créer un nouveau message
      const newMessage: Message = {
        id: 'msg-' + Date.now(),
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        createdAt: new Date().toISOString(),
        isRead: false,
        attachments: data.attachments
      };
      
      // Ajouter le message aux messages simulés
      mockMessages.push(newMessage);
      
      // Mettre à jour la conversation
      const conversationIndex = mockConversations.findIndex(conv => conv.id === data.conversationId);
      if (conversationIndex !== -1) {
        mockConversations[conversationIndex].lastMessage = newMessage;
        mockConversations[conversationIndex].updatedAt = newMessage.createdAt;
      }
      
      return HttpResponse.json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de l\'envoi du message:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi du message' },
        { status: 400 }
      );
    }
  }),
  
  // Créer une nouvelle conversation
  http.post('/api/conversations/create', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const data = await request.json() as CreateConversationRequest;
      console.log('[MSW] Création d\'une nouvelle conversation:', data);
      
      if (!data.senderId || !data.receiverId || !data.initialMessage.trim()) {
        return HttpResponse.json(
          { success: false, error: 'Données incomplètes' },
          { status: 400 }
        );
      }
      
      // Créer une nouvelle conversation
      const newConversationId = 'conv-' + Date.now();
      const now = new Date().toISOString();
      
      const newConversation: Conversation = {
        id: newConversationId,
        participants: [data.senderId, data.receiverId],
        createdAt: now,
        updatedAt: now,
        isNew: true,
        orderId: data.orderId,
        title: data.title
      };
      
      // Créer le premier message
      const newMessage: Message = {
        id: 'msg-' + Date.now(),
        conversationId: newConversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.initialMessage,
        createdAt: now,
        isRead: false
      };
      
      // Mettre à jour les collections simulées
      mockConversations.push(newConversation);
      mockMessages.push(newMessage);
      
      // Mettre à jour le dernier message de la conversation
      newConversation.lastMessage = newMessage;
      
      return HttpResponse.json({
        success: true,
        conversation: newConversation,
        message: newMessage
      });
    } catch (error) {
      console.error('[MSW] Erreur lors de la création de la conversation:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors de la création de la conversation' },
        { status: 400 }
      );
    }
  }),
  
  // Marquer les messages comme lus
  http.put('/api/messages/mark-read', async ({ request }) => {
    await delay(NETWORK_DELAY);
    
    try {
      const { conversationId, userId } = await request.json() as { conversationId: string, userId: string };
      console.log(`[MSW] Marquer les messages comme lus - conversationId: ${conversationId}, userId: ${userId}`);
      
      if (!conversationId || !userId) {
        return HttpResponse.json(
          { success: false, error: 'Données incomplètes' },
          { status: 400 }
        );
      }
      
      // Trouver les messages non lus adressés à cet utilisateur
      const unreadMessages = mockMessages.filter(msg => 
        msg.conversationId === conversationId && 
        msg.receiverId === userId && 
        !msg.isRead
      );
      
      // Marquer ces messages comme lus
      unreadMessages.forEach(msg => {
        const msgIndex = mockMessages.findIndex(m => m.id === msg.id);
        if (msgIndex !== -1) {
          mockMessages[msgIndex].isRead = true;
        }
      });
      
      return HttpResponse.json({
        success: true,
        markedCount: unreadMessages.length,
        message: 'Messages marqués comme lus'
      });
    } catch (error) {
      console.error('[MSW] Erreur lors du marquage des messages:', error);
      return HttpResponse.json(
        { success: false, error: 'Erreur lors du marquage des messages' },
        { status: 400 }
      );
    }
  })
]; 