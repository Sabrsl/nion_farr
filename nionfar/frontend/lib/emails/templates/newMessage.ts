import { EmailTemplate } from '../emailTemplates';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de nouveau message
 */
export const newMessageTemplate: EmailTemplate = {
  name: 'new_message',
  defaultSubject: 'Nouveau message reçu',
  render: (data: any) => {
    const {
      recipientName = 'Utilisateur',
      senderName = 'Expéditeur',
      messagePreview = '',
      conversationLink = '#',
      orderId = '',
      projectTitle = ''
    } = data;

    // Déterminer si le message est lié à une commande
    const isOrderRelated = orderId && projectTitle;

    // Contenu HTML
    const htmlContent = `
      <h2>Nouveau Message</h2>
      
      <p>Bonjour ${recipientName},</p>
      
      <p>Vous avez reçu un nouveau message de <strong>${senderName}</strong>.</p>
      
      <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6366f1;">
        <p style="margin: 0; font-style: italic;">"${messagePreview || 'Voir le message complet en cliquant sur le bouton ci-dessous.'}"</p>
      </div>
      
      ${isOrderRelated ? `
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0369a1;">Détails de la commande</h3>
        <p><strong>Commande:</strong> ${orderId}</p>
        <p><strong>Projet:</strong> ${projectTitle}</p>
      </div>
      ` : ''}
      
      <p>Une réponse rapide aide à maintenir une bonne communication et satisfaction client.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${conversationLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir le message</a>
      </div>
      
      <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
      
      <p>Cordialement,<br>
      L'équipe Nionfar</p>
    `;

    // Contenu texte brut
    const textContent = `
Nouveau Message

Bonjour ${recipientName},

Vous avez reçu un nouveau message de ${senderName}.

Message:
"${messagePreview || 'Voir le message complet en cliquant sur le lien ci-dessous.'}"

${isOrderRelated ? `Détails de la commande:
- Commande: ${orderId}
- Projet: ${projectTitle}
` : ''}

Une réponse rapide aide à maintenir une bonne communication et satisfaction client.

Pour voir le message complet et répondre: ${conversationLink}

Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.

Cordialement,
L'équipe Nionfar
    `;

    // Titre personnalisé pour le sujet
    const customSubject = `Nouveau message de ${senderName}${isOrderRelated ? ` - ${projectTitle}` : ''}`;

    return {
      html: createBaseHtmlTemplate('Nouveau Message', htmlContent),
      text: createBaseTextTemplate(customSubject, textContent),
      subject: customSubject
    };
  }
};

export default newMessageTemplate; 