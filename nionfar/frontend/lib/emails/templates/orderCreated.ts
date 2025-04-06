import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de création de commande
 */
export const orderCreatedTemplate: EmailTemplate = {
  name: 'order-created',
  defaultSubject: 'Confirmation de votre commande sur Nionfar',
  render: (data) => {
    const {
      clientName,
      orderNumber,
      serviceName,
      servicePrice,
      serviceFee,
      totalAmount,
      paymentMethod,
      sellerName,
      estimatedDelivery,
      orderLink,
    } = data;

    const dashboardLink = `${EMAIL_CONFIG.baseUrl}/dashboard/client/orders`;
    const formattedPrice = new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(servicePrice);
    const formattedTotal = new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(totalAmount);

    const htmlContent = `
      <h2>Commande Confirmée</h2>
      <p>Bonjour ${clientName},</p>
      <p>Nous vous confirmons que votre commande <strong>#${orderNumber}</strong> a bien été enregistrée.</p>
      
      <div class="highlight-box">
        <h3>Détails de votre commande</h3>
        <table>
          <tr>
            <td><strong>Service</strong></td>
            <td>${serviceName}</td>
          </tr>
          <tr>
            <td><strong>Prestataire</strong></td>
            <td>${sellerName}</td>
          </tr>
          <tr>
            <td><strong>Prix du service</strong></td>
            <td>${formattedPrice}</td>
          </tr>
          <tr>
            <td><strong>Frais de service</strong></td>
            <td>${new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(serviceFee)}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>${formattedTotal}</strong></td>
          </tr>
          <tr>
            <td><strong>Méthode de paiement</strong></td>
            <td>${paymentMethod}</td>
          </tr>
          <tr>
            <td><strong>Livraison estimée</strong></td>
            <td>${estimatedDelivery}</td>
          </tr>
        </table>
      </div>
      
      <p>Votre prestataire a été notifié et commencera bientôt à travailler sur votre commande. Vous pouvez suivre l'avancement de votre commande à tout moment depuis votre tableau de bord.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${orderLink}" class="button">Voir les détails de ma commande</a>
      </p>
      
      <p>Pour toute question concernant votre commande, n'hésitez pas à contacter directement le prestataire via la messagerie de notre plateforme ou notre service client.</p>
      
      <p>Merci de votre confiance,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      Bonjour ${clientName},
      
      Nous vous confirmons que votre commande #${orderNumber} a bien été enregistrée.
      
      Détails de votre commande:
      - Service: ${serviceName}
      - Prestataire: ${sellerName}
      - Prix du service: ${formattedPrice}
      - Frais de service: ${new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(serviceFee)}
      - Total: ${formattedTotal}
      - Méthode de paiement: ${paymentMethod}
      - Livraison estimée: ${estimatedDelivery}
      
      Votre prestataire a été notifié et commencera bientôt à travailler sur votre commande. Vous pouvez suivre l'avancement de votre commande à tout moment depuis votre tableau de bord: ${dashboardLink}
      
      Pour voir les détails de votre commande: ${orderLink}
      
      Pour toute question concernant votre commande, n'hésitez pas à contacter directement le prestataire via la messagerie de notre plateforme ou notre service client.
      
      Merci de votre confiance,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate('Confirmation de commande', htmlContent);
    const text = createBaseTextTemplate('Confirmation de votre commande sur Nionfar', textContent);

    return { html, text };
  },
}; 