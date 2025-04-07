import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';

/**
 * Template pour la notification de paiement reçu
 */
export const paymentReceivedTemplate: EmailTemplate = {
  name: 'payment-received',
  defaultSubject: 'Confirmation de paiement - Nionfar',
  render: (data) => {
    const {
      clientName,
      orderNumber,
      transactionId,
      amount,
      paymentMethod,
      paymentDate,
      serviceName,
      orderLink,
    } = data;

    const dashboardLink = `${EMAIL_CONFIG.baseUrl}/dashboard/client/payment`;
    const formattedAmount = new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
    const formattedDate = new Date(paymentDate).toLocaleDateString('fr-FR', {
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
        <title>Confirmation de paiement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .payment-details { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .success-icon { text-align: center; font-size: 48px; margin: 20px 0; color: #10B981; }
          table { width: 100%; border-collapse: collapse; }
          table td, table th { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          @media only screen and (max-width: 600px) { body { width: 100%; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Paiement Confirmé</h1>
        </div>
        <div class="content">
          <p>Bonjour ${clientName},</p>
          <p>Nous vous confirmons que votre paiement pour la commande <strong>#${orderNumber}</strong> a bien été reçu.</p>
          
          <div class="success-icon">✓</div>
          
          <div class="payment-details">
            <h3>Détails du paiement</h3>
            <table>
              <tr>
                <td><strong>Service</strong></td>
                <td>${serviceName}</td>
              </tr>
              <tr>
                <td><strong>Numéro de commande</strong></td>
                <td>#${orderNumber}</td>
              </tr>
              <tr>
                <td><strong>Référence de transaction</strong></td>
                <td>${transactionId}</td>
              </tr>
              <tr>
                <td><strong>Montant</strong></td>
                <td><strong>${formattedAmount}</strong></td>
              </tr>
              <tr>
                <td><strong>Méthode de paiement</strong></td>
                <td>${paymentMethod}</td>
              </tr>
              <tr>
                <td><strong>Date et heure</strong></td>
                <td>${formattedDate}</td>
              </tr>
            </table>
          </div>
          
          <p>Le prestataire peut maintenant commencer à travailler sur votre commande. Vous pouvez suivre l'avancement de votre commande à tout moment depuis votre tableau de bord.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${orderLink}" class="button">Voir ma commande</a>
          </p>
          
          <p>Pour toute question concernant ce paiement, n'hésitez pas à contacter notre service client.</p>
          
          <p>Merci de votre confiance,<br>L'équipe Nionfar</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nionfar. Tous droits réservés.</p>
          <p>
            <a href="${EMAIL_CONFIG.baseUrl}/conditions-utilisation">Conditions d'utilisation</a> | 
            <a href="${EMAIL_CONFIG.baseUrl}/politique-confidentialite">Politique de confidentialité</a>
          </p>
          <p>Cet email a été envoyé à ${data.clientEmail}. Si vous avez reçu cet email par erreur, veuillez nous contacter.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Confirmation de paiement - Nionfar
      
      Bonjour ${clientName},
      
      Nous vous confirmons que votre paiement pour la commande #${orderNumber} a bien été reçu.
      
      Détails du paiement:
      - Service: ${serviceName}
      - Numéro de commande: #${orderNumber}
      - Référence de transaction: ${transactionId}
      - Montant: ${formattedAmount}
      - Méthode de paiement: ${paymentMethod}
      - Date et heure: ${formattedDate}
      
      Le prestataire peut maintenant commencer à travailler sur votre commande. Vous pouvez suivre l'avancement de votre commande à tout moment depuis votre tableau de bord: ${dashboardLink}
      
      Pour voir votre commande: ${orderLink}
      
      Pour toute question concernant ce paiement, n'hésitez pas à contacter notre service client.
      
      Merci de votre confiance,
      L'équipe Nionfar
      
      © ${new Date().getFullYear()} Nionfar. Tous droits réservés.
      ${EMAIL_CONFIG.baseUrl}
      
      Cet email a été envoyé à ${data.clientEmail}. Si vous avez reçu cet email par erreur, veuillez nous contacter.
    `;

    return { html, text };
  },
}; 