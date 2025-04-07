import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';

/**
 * Template pour la notification de livraison de commande
 */
export const orderDeliveredTemplate: EmailTemplate = {
  name: 'order-delivered',
  defaultSubject: 'Votre commande a été livrée - Nionfar',
  render: (data) => {
    const {
      clientName,
      orderNumber,
      serviceName,
      sellerName,
      deliveryDate,
      deliveryMessage,
      orderLink,
    } = data;

    const dashboardLink = `${EMAIL_CONFIG.baseUrl}/dashboard/client/orders`;
    const formattedDate = new Date(deliveryDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commande livrée</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .secondary-button { display: inline-block; background-color: #6B7280; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-left: 10px; }
          .delivery-details { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .delivery-message { background-color: #e9f7ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .notice { background-color: #FFFBEB; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #F59E0B; }
          @media only screen and (max-width: 600px) { body { width: 100%; } .button, .secondary-button { display: block; margin: 10px 0; text-align: center; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Commande Livrée</h1>
        </div>
        <div class="content">
          <p>Bonjour ${clientName},</p>
          <p>Bonne nouvelle ! Votre commande <strong>#${orderNumber}</strong> a été livrée par ${sellerName}.</p>
          
          <div class="delivery-details">
            <h3>Détails de la livraison</h3>
            <p><strong>Service :</strong> ${serviceName}</p>
            <p><strong>Prestataire :</strong> ${sellerName}</p>
            <p><strong>Date de livraison :</strong> ${formattedDate}</p>
          </div>
          
          ${deliveryMessage ? `
          <div class="delivery-message">
            <h3>Message du prestataire</h3>
            <p>${deliveryMessage}</p>
          </div>
          ` : ''}
          
          <div class="notice">
            <h3>Action requise</h3>
            <p>Veuillez examiner la livraison et la valider ou demander des modifications si nécessaire dans un délai de 3 jours. Passé ce délai, la commande sera automatiquement validée.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${orderLink}" class="button">Consulter ma livraison</a>
          </p>
          
          <p>Si vous avez des questions concernant cette livraison, n'hésitez pas à contacter directement le prestataire via la messagerie de notre plateforme.</p>
          
          <p>Merci de votre confiance,<br>L'équipe Nionfar</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nionfar. Tous droits réservés.</p>
          <p>
            <a href="${EMAIL_CONFIG.baseUrl}/conditions-utilisation">Conditions d'utilisation</a> | 
            <a href="${EMAIL_CONFIG.baseUrl}/politique-confidentialite">Politique de confidentialité</a>
          </p>
          <p>Cet email a été envoyé à ${data.clientEmail}.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Votre commande a été livrée - Nionfar
      
      Bonjour ${clientName},
      
      Bonne nouvelle ! Votre commande #${orderNumber} a été livrée par ${sellerName}.
      
      Détails de la livraison:
      - Service: ${serviceName}
      - Prestataire: ${sellerName}
      - Date de livraison: ${formattedDate}
      
      ${deliveryMessage ? `Message du prestataire:
      ${deliveryMessage}
      
      ` : ''}
      ACTION REQUISE: Veuillez examiner la livraison et la valider ou demander des modifications si nécessaire dans un délai de 3 jours. Passé ce délai, la commande sera automatiquement validée.
      
      Pour consulter votre livraison: ${orderLink}
      
      Si vous avez des questions concernant cette livraison, n'hésitez pas à contacter directement le prestataire via la messagerie de notre plateforme.
      
      Merci de votre confiance,
      L'équipe Nionfar
      
      © ${new Date().getFullYear()} Nionfar. Tous droits réservés.
      ${EMAIL_CONFIG.baseUrl}
      
      Cet email a été envoyé à ${data.clientEmail}.
    `;

    return { html, text };
  },
}; 