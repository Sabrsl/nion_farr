import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de finalisation de commande
 */
export const orderCompletedTemplate: EmailTemplate = {
  name: 'order_completed',
  defaultSubject: 'Votre commande est terminée',
  render: (data: any) => {
    const {
      clientName = 'Client',
      orderId = '',
      orderDetails = {},
      deliverables = [],
      sellerName = 'Vendeur',
      reviewLink = '#'
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h2>Commande Terminée: ${orderDetails.title || 'Votre commande'}</h2>
      
      <p>Bonjour ${clientName},</p>
      
      <p>Nous sommes heureux de vous informer que votre commande <strong>${orderId}</strong> a été marquée comme terminée par ${sellerName}.</p>
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Détails de la commande</h3>
        <p><strong>Titre:</strong> ${orderDetails.title || 'Non spécifié'}</p>
        <p><strong>Date d'achèvement:</strong> ${orderDetails.completionDate || 'Non spécifiée'}</p>
        <p><strong>Montant:</strong> ${orderDetails.price || 'Non spécifié'}</p>
        
        ${deliverables.length > 0 ? `
          <h4>Livrables</h4>
          <ul style="padding-left: 20px;">
            ${deliverables.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
      
      <p>Nous vous invitons à examiner le travail livré et, si vous êtes satisfait, à laisser une évaluation pour ${sellerName}. Votre feedback est très important pour la communauté Nionfar.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Évaluer cette commande</a>
      </div>
      
      <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
      
      <p>Cordialement,<br>
      L'équipe Nionfar</p>
    `;

    // Contenu texte brut
    const textContent = `
Commande Terminée: ${orderDetails.title || 'Votre commande'}

Bonjour ${clientName},

Nous sommes heureux de vous informer que votre commande ${orderId} a été marquée comme terminée par ${sellerName}.

Détails de la commande:
- Titre: ${orderDetails.title || 'Non spécifié'}
- Date d'achèvement: ${orderDetails.completionDate || 'Non spécifiée'}
- Montant: ${orderDetails.price || 'Non spécifié'}

${deliverables.length > 0 ? `Livrables:
${deliverables.map((item: string) => `- ${item}`).join('\n')}
` : ''}

Nous vous invitons à examiner le travail livré et, si vous êtes satisfait, à laisser une évaluation pour ${sellerName}. Votre feedback est très important pour la communauté Nionfar.

Pour évaluer cette commande, visitez: ${reviewLink}

Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.

Cordialement,
L'équipe Nionfar
    `;

    return {
      html: createBaseHtmlTemplate('Commande Terminée', htmlContent),
      text: createBaseTextTemplate('Votre commande est terminée', textContent)
    };
  }
};

export default orderCompletedTemplate; 