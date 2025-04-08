import { EMAIL_CONFIG } from '../emailConfig';
import { EmailTemplate } from '../emailTemplates';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour les emails de confirmation d'acceptation de commande
 */
export const orderAcceptedTemplate: EmailTemplate = {
  name: 'ORDER_ACCEPTED',
  defaultSubject: 'Votre commande a été acceptée',
  render: (data) => {
    const {
      clientName,
      orderId,
      orderDetails,
      sellerName,
      orderLink,
      nextSteps
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h1>Commande acceptée</h1>
      <p>Bonjour ${clientName},</p>
      <p>Bonne nouvelle ! Votre commande a été acceptée par <strong>${sellerName}</strong>.</p>
      
      <div class="info-block">
        <p><strong>Détails de la commande :</strong></p>
        <p>ID de commande : ${orderId}</p>
        <p>Service : ${orderDetails.title}</p>
        <p>Prix : ${orderDetails.price}</p>
        <p>Date de livraison prévue : ${orderDetails.deadline}</p>
      </div>
      
      <p>Le prestataire va maintenant commencer à travailler sur votre commande. Vous pouvez suivre son avancement à tout moment en cliquant sur le bouton ci-dessous.</p>
      
      <a href="${orderLink}" class="button">Suivre ma commande</a>
      
      <p>Si vous avez des questions ou besoin de précisions, n'hésitez pas à contacter le prestataire via la messagerie de la plateforme.</p>
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    // Contenu texte
    const textContent = `
      Commande acceptée
      
      Bonjour ${clientName},
      
      Bonne nouvelle ! Votre commande a été acceptée par ${sellerName}.
      
      Détails de la commande :
      ID de commande : ${orderId}
      Service : ${orderDetails.title}
      Prix : ${orderDetails.price}
      Date de livraison prévue : ${orderDetails.deadline}
      
      Le prestataire va maintenant commencer à travailler sur votre commande. Vous pouvez suivre son avancement à tout moment en cliquant sur le lien suivant :
      ${orderLink}
      
      Si vous avez des questions ou besoin de précisions, n'hésitez pas à contacter le prestataire via la messagerie de la plateforme.
      
      Cordialement,
      L'équipe Nionfar
    `;

    return {
      html: createBaseHtmlTemplate(htmlContent, "Votre commande a été acceptée"),
      text: createBaseTextTemplate(textContent, "Votre commande a été acceptée")
    };
  }
};

export default orderAcceptedTemplate; 