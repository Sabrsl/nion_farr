import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour le récapitulatif des messages non lus
 */
export const messageDigestTemplate: EmailTemplate = {
  name: 'message-digest',
  defaultSubject: 'Récapitulatif de vos messages non lus',
  render: (data) => {
    const {
      recipientName,
      unreadCount,
      conversations,
      digestPeriod = 'daily', // 'daily' ou 'weekly'
    } = data;

    const periodText = digestPeriod === 'weekly' ? 'cette semaine' : 'aujourd\'hui';
    const conversationsData = Array.isArray(conversations) ? conversations : [];
    
    const messagesLink = `${EMAIL_CONFIG.baseUrl}/dashboard/messages`;

    // Création de la liste HTML des conversations
    const conversationListHtml = conversationsData.map(conv => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>${conv.withName}${conv.withRole ? ` (${conv.withRole === 'client' ? 'Client' : 'Prestataire'})` : ''}</strong>
          <span style="color: #666;">${conv.lastMessageTime}</span>
        </div>
        
        ${conv.orderTitle ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Commande :</strong> ${conv.orderTitle} ${conv.orderId ? `(#${conv.orderId})` : ''}</p>` : ''}
        
        <p style="margin: 8px 0; padding: 10px; background-color: #f7f7f7; border-radius: 4px; font-style: italic;">"${
          conv.previewText ? 
            (conv.previewText.length > 100 ? conv.previewText.substring(0, 100) + '...' : conv.previewText) 
            : '...'
        }"</p>
        
        <p style="margin: 8px 0 0 0; color: #1a73e8; text-align: right;">
          <a href="${conv.conversationLink || (conv.orderId ? `${EMAIL_CONFIG.baseUrl}/dashboard/messages/order/${conv.orderId}` : messagesLink)}" style="color: #1a73e8; text-decoration: none;">
            ${conv.unreadCount > 1 ? `${conv.unreadCount} messages non lus` : '1 message non lu'} &rarr;
          </a>
        </p>
      </div>
    `).join('');

    const htmlContent = `
      <h2>Vos messages non lus ${periodText}</h2>
      <p>Bonjour ${recipientName},</p>
      
      <p>Vous avez <strong>${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}</strong> ${periodText} sur Nionfar.</p>
      
      ${conversationListHtml ? `
        <div class="highlight-box">
          <h3>Récapitulatif de vos conversations</h3>
          ${conversationListHtml}
        </div>
      ` : `
        <p>Consultez votre boîte de réception pour voir tous vos messages.</p>
      `}
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${messagesLink}" class="button">Voir tous mes messages</a>
      </p>
      
      <div class="notice-box">
        <h3>Une communication rapide est essentielle</h3>
        <p>Répondre rapidement à vos messages permet :</p>
        <ul style="margin-top: 5px;">
          <li>D'accélérer le processus de vos commandes</li>
          <li>De maintenir une bonne relation avec vos clients ou prestataires</li>
          <li>D'améliorer votre réputation sur Nionfar</li>
        </ul>
      </div>
      
      <p><em>Vous pouvez modifier la fréquence de ces notifications dans les paramètres de votre compte.</em></p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    // Version texte
    const conversationListText = conversationsData.map(conv => `
      • De : ${conv.withName}${conv.withRole ? ` (${conv.withRole === 'client' ? 'Client' : 'Prestataire'})` : ''}
      ${conv.orderTitle ? `  Commande : ${conv.orderTitle} ${conv.orderId ? `(#${conv.orderId})` : ''}` : ''}
      ${conv.lastMessageTime ? `  Dernier message : ${conv.lastMessageTime}` : ''}
      ${conv.previewText ? `  "${
        conv.previewText.length > 100 ? conv.previewText.substring(0, 100) + '...' : conv.previewText
      }"` : ''}
      ${conv.unreadCount > 1 ? `  ${conv.unreadCount} messages non lus` : '  1 message non lu'}
      ${conv.conversationLink || (conv.orderId ? `  Lien : ${EMAIL_CONFIG.baseUrl}/dashboard/messages/order/${conv.orderId}` : '')}
    `).join('\n');

    const textContent = `
      Vos messages non lus ${periodText}
      
      Bonjour ${recipientName},
      
      Vous avez ${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''} ${periodText} sur Nionfar.
      
      ${conversationListText ? `RÉCAPITULATIF DE VOS CONVERSATIONS\n\n${conversationListText}` : 'Consultez votre boîte de réception pour voir tous vos messages.'}
      
      Voir tous mes messages : ${messagesLink}
      
      UNE COMMUNICATION RAPIDE EST ESSENTIELLE
      Répondre rapidement à vos messages permet :
      - D'accélérer le processus de vos commandes
      - De maintenir une bonne relation avec vos clients ou prestataires
      - D'améliorer votre réputation sur Nionfar
      
      Vous pouvez modifier la fréquence de ces notifications dans les paramètres de votre compte.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate(`Récapitulatif des messages non lus ${periodText}`, htmlContent);
    const text = createBaseTextTemplate(`Récapitulatif des messages non lus ${periodText}`, textContent);

    return { html, text };
  },
}; 