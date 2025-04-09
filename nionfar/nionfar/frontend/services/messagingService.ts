import { Message, User, Conversation } from '../types';
import { toast } from 'react-toastify';

class MessagingService {
  private apiUrl = '/api/messages';
  
  /**
   * Modère un message avant de l'envoyer
   * @param content Contenu du message à modérer
   * @returns Résultat de la modération
   */
  async moderateMessage(content: string): Promise<{
    isValid: boolean;
    filteredContent?: string;
    violations: Array<{
      type: 'personal_data' | 'inappropriate' | 'threat' | 'insult';
      severity: 'warning' | 'block';
      description: string;
    }>;
    message?: string;
  }> {
    try {
      // Vérifier les données personnelles
      const personalDataViolations = this.detectPersonalData(content);
      
      // Vérifier le contenu inapproprié
      const inappropriateContentViolations = this.detectInappropriateContent(content);
      
      // Regrouper toutes les violations
      const violations = [...personalDataViolations, ...inappropriateContentViolations];
      
      // Si des violations critiques sont détectées, bloquer le message
      const hasCriticalViolations = violations.some(v => v.severity === 'block');
      
      if (hasCriticalViolations) {
        return {
          isValid: false,
          violations,
          message: 'Ce message contient des éléments interdits et ne peut pas être envoyé.'
        };
      }
      
      // Si des violations non critiques sont détectées, filtrer le contenu
      let filteredContent = content;
      
      if (violations.length > 0) {
        // Remplacer les données personnelles par des astérisques
        personalDataViolations.forEach(violation => {
          const regex = new RegExp(violation.description, 'gi');
          filteredContent = filteredContent.replace(regex, '*'.repeat(violation.description.length));
        });
        
        return {
          isValid: true,
          filteredContent,
          violations,
          message: 'Votre message a été modifié pour respecter nos règles de confidentialité.'
        };
      }
      
      // Si aucune violation n'est détectée, valider tel quel
      return {
        isValid: true,
        violations: [],
      };
    } catch (error) {
      console.error('Erreur lors de la modération du message:', error);
      return {
        isValid: false,
        violations: [],
        message: 'Une erreur est survenue lors de la modération du message.'
      };
    }
  }
  
  /**
   * Détecte les données personnelles dans un message
   * @private
   */
  private detectPersonalData(content: string): Array<{
    type: 'personal_data';
    severity: 'warning' | 'block';
    description: string;
  }> {
    const violations: Array<{
      type: 'personal_data';
      severity: 'warning' | 'block';
      description: string;
    }> = [];
    
    // Regex pour détecter les emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex);
    
    if (emails) {
      emails.forEach(email => {
        violations.push({
          type: 'personal_data',
          severity: 'block',
          description: email
        });
      });
    }
    
    // Regex pour détecter les numéros de téléphone (formats sénégalais et internationaux)
    const phoneRegexes = [
      /(?<!\d)(0?\d{9})(?!\d)/g,                 // Format local: 770000000
      /(?<!\d)(\+221\d{9})(?!\d)/g,              // Format international: +221770000000
      /(?<!\d)(00221\d{9})(?!\d)/g,              // Format international alternatif: 00221770000000
      /(?<!\d)(\d{2}[ .-]?\d{3}[ .-]?\d{2}[ .-]?\d{2})(?!\d)/g  // Format avec séparateurs: 77 000 00 00
    ];
    
    phoneRegexes.forEach(regex => {
      const phones = content.match(regex);
      if (phones) {
        phones.forEach(phone => {
          violations.push({
            type: 'personal_data',
            severity: 'block',
            description: phone
          });
        });
      }
    });
    
    // Détecter les liens WhatsApp, Telegram, etc.
    const socialRegexes = [
      /(?:https?:\/\/)?(?:www\.)?(?:wa\.me|whatsapp\.com)\/(?:send\?phone=|\d+)/gi,
      /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/\w+/gi,
      /(?:https?:\/\/)?(?:fb\.com|facebook\.com)\/\w+/gi,
      /(?:https?:\/\/)?(?:instagram\.com)\/\w+/gi
    ];
    
    socialRegexes.forEach(regex => {
      const socialLinks = content.match(regex);
      if (socialLinks) {
        socialLinks.forEach(link => {
          violations.push({
            type: 'personal_data',
            severity: 'block',
            description: link
          });
        });
      }
    });
    
    return violations;
  }
  
  /**
   * Détecte le contenu inapproprié dans un message
   * @private
   */
  private detectInappropriateContent(content: string): Array<{
    type: 'inappropriate' | 'threat' | 'insult';
    severity: 'warning' | 'block';
    description: string;
  }> {
    const violations: Array<{
      type: 'inappropriate' | 'threat' | 'insult';
      severity: 'warning' | 'block';
      description: string;
    }> = [];
    
    // Liste d'insultes et de mots inappropriés (à élargir)
    const insultWords = [
      'connard', 'connasse', 'salope', 'pute', 'enculé', 'fils de pute', 'fdp', 
      'putain', 'merde', 'bâtard', 'va te faire foutre', 'vtff', 'nique ta mère', 'ntm'
    ];
    
    // Liste de mots indiquant des menaces (à élargir)
    const threatWords = [
      'tuer', 'frapper', 'détruire', 'menacer', 'vengeance',
      'je vais te', 'je vais vous', 'je te retrouverai', 'je vous retrouverai',
      'attention à toi', 'attention à vous', 'tu vas payer', 'vous allez payer'
    ];
    
    // Vérifier les insultes
    insultWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(content)) {
        violations.push({
          type: 'insult',
          severity: 'block',
          description: word
        });
      }
    });
    
    // Vérifier les menaces
    threatWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(content)) {
        violations.push({
          type: 'threat',
          severity: 'block',
          description: word
        });
      }
    });
    
    return violations;
  }
  
  /**
   * Envoie un message avec modération automatique
   * @param conversationId ID de la conversation
   * @param content Contenu du message
   * @param senderId ID de l'expéditeur
   * @param attachments Pièces jointes (optionnel)
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    attachments: string[] = []
  ): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
    moderationResult?: any;
  }> {
    try {
      // Modérer le message avant l'envoi
      const moderationResult = await this.moderateMessage(content);
      
      // Si le message contient des violations critiques, annuler l'envoi
      if (!moderationResult.isValid) {
        // Si le message contient des menaces ou insultes, suspendre l'utilisateur
        if (moderationResult.violations.some(v => 
          (v.type === 'threat' || v.type === 'insult') && v.severity === 'block')
        ) {
          await this.suspendUser(senderId, moderationResult.violations);
          return {
            success: false,
            error: 'Votre compte a été temporairement suspendu en raison du contenu inapproprié de votre message.',
            moderationResult
          };
        }
        
        return {
          success: false,
          error: moderationResult.message,
          moderationResult
        };
      }
      
      // Utiliser le contenu filtré s'il existe
      const finalContent = moderationResult.filteredContent || content;
      
      // Envoyer le message à l'API
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content: finalContent,
          senderId,
          attachments
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      // Si le message a été filtré, notifier l'utilisateur
      if (moderationResult.filteredContent) {
        toast.info('Votre message a été modifié pour respecter nos règles de confidentialité.');
      }
      
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de l\'envoi du message.'
      };
    }
  }
  
  /**
   * Suspend un utilisateur pour violation des règles
   * @private
   */
  private async suspendUser(
    userId: string,
    violations: Array<{
      type: string;
      severity: string;
      description: string;
    }>
  ): Promise<void> {
    try {
      // Log des violations
      console.error('Violations graves détectées, suspension de l\'utilisateur:', userId, violations);
      
      // Suspendre l'utilisateur
      const response = await fetch('/api/users/suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          reason: 'Violation des règles de messagerie',
          violations,
          duration: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
          type: 'messaging_violation'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suspension de l\'utilisateur');
      }
      
      // Notifier l'administration
      await this.notifyAdminOfSuspension(userId, violations);
    } catch (error) {
      console.error('Erreur lors de la suspension de l\'utilisateur:', error);
    }
  }
  
  /**
   * Notifie l'administration d'une suspension
   * @private
   */
  private async notifyAdminOfSuspension(
    userId: string,
    violations: Array<{
      type: string;
      severity: string;
      description: string;
    }>
  ): Promise<void> {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'user_suspension',
          title: 'Suspension utilisateur - Violation des règles de messagerie',
          message: `L'utilisateur ${userId} a été suspendu pour violations graves des règles de messagerie.`,
          priority: 'high',
          details: {
            userId,
            violations,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Erreur lors de la notification admin:', error);
    }
  }
  
  /**
   * Récupère les messages d'une conversation
   */
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 20
  ): Promise<{
    success: boolean;
    messages?: Message[];
    totalCount?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}?conversationId=${conversationId}&page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        messages: data.messages,
        totalCount: data.totalCount
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la récupération des messages.'
      };
    }
  }
  
  /**
   * Récupère les conversations d'un utilisateur
   */
  async getConversations(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    success: boolean;
    conversations?: Conversation[];
    totalCount?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `/api/conversations?userId=${userId}&page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversations: data.conversations,
        totalCount: data.totalCount
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la récupération des conversations.'
      };
    }
  }
  
  /**
   * Marque un message comme lu
   */
  async markAsRead(
    messageId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/${messageId}/read`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage du message comme lu');
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors du marquage du message comme lu.'
      };
    }
  }
  
  /**
   * Crée une nouvelle conversation
   */
  async createConversation(
    participants: string[],
    initialMessage?: string,
    orderId?: string
  ): Promise<{
    success: boolean;
    conversation?: Conversation;
    error?: string;
  }> {
    try {
      // Si un message initial est fourni, le modérer
      let moderationResult;
      if (initialMessage) {
        moderationResult = await this.moderateMessage(initialMessage);
        
        if (!moderationResult.isValid) {
          return {
            success: false,
            error: moderationResult.message
          };
        }
      }
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants,
          initialMessage: moderationResult?.filteredContent || initialMessage,
          orderId
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la conversation');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversation: data.conversation
      };
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la création de la conversation.'
      };
    }
  }
}

// Exporter une instance unique du service
const messagingService = new MessagingService();
export default messagingService; 