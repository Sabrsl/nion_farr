import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification d'ouverture de litige
 */
export const disputeOpenedTemplate: EmailTemplate = {
  name: 'dispute-opened',
  defaultSubject: 'Un litige a été ouvert sur votre commande - Nionfar',
  render: (data) => {
    const {
      recipientName,
      recipientRole, // 'client' ou 'seller'
      otherPartyName,
      orderNumber,
      serviceName,
      disputeReason,
      disputeDescription,
      disputeId,
      orderDate,
      orderAmount,
      disputeLink,
    } = data;

    const formattedOrderDate = typeof orderDate === 'string' 
      ? new Date(orderDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : orderDate;
    
    const formattedAmount = typeof orderAmount === 'number'
      ? new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(orderAmount)
      : orderAmount;
    
    const dashboardLink = `${EMAIL_CONFIG.baseUrl}/dashboard/${recipientRole === 'client' ? 'client' : 'freelance'}/orders`;
    const actualDisputeLink = disputeLink || `${EMAIL_CONFIG.baseUrl}/dashboard/${recipientRole === 'client' ? 'client' : 'freelance'}/disputes/${disputeId}`;

    const htmlContent = `
      <h2>Litige Ouvert - Commande #${orderNumber}</h2>
      <p>Bonjour ${recipientName},</p>
      <p>${
        recipientRole === 'client' 
          ? `Le prestataire ${otherPartyName} a ouvert un litige concernant votre commande.` 
          : `Le client ${otherPartyName} a ouvert un litige concernant la commande que vous avez traitée.`
      }</p>
      
      <div class="warning-box">
        <h3>Détails du litige</h3>
        <p><strong>Raison indiquée :</strong> ${disputeReason}</p>
        <p><strong>Description :</strong> ${disputeDescription}</p>
      </div>
      
      <div class="highlight-box">
        <h3>Informations sur la commande</h3>
        <p><strong>Numéro de commande :</strong> #${orderNumber}</p>
        <p><strong>Service :</strong> ${serviceName}</p>
        <p><strong>Date de la commande :</strong> ${formattedOrderDate}</p>
        <p><strong>Montant :</strong> ${formattedAmount}</p>
      </div>
      
      <p>Nous vous invitons à consulter le détail du litige et à y répondre dans les plus brefs délais. Notre équipe de médiation examinera attentivement la situation et travaillera avec les deux parties pour trouver une solution équitable.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actualDisputeLink}" class="button">Consulter le litige</a>
      </p>
      
      <div class="notice-box">
        <h3>Prochaines étapes</h3>
        <ol style="margin-top: 10px; padding-left: 20px;">
          <li>Consultez les détails du litige</li>
          <li>Fournissez votre version des faits et d'éventuelles preuves</li>
          <li>Notre équipe de médiation analysera la situation</li>
          <li>Une décision sera prise dans un délai de 5 jours ouvrés</li>
        </ol>
      </div>
      
      <p>Pendant la durée du litige, les fonds associés à cette commande sont temporairement bloqués jusqu'à la résolution du différend.</p>
      
      <p>Si vous avez des questions supplémentaires, n'hésitez pas à contacter notre service client.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      Litige Ouvert - Commande #${orderNumber}
      
      Bonjour ${recipientName},
      
      ${
        recipientRole === 'client' 
          ? `Le prestataire ${otherPartyName} a ouvert un litige concernant votre commande.` 
          : `Le client ${otherPartyName} a ouvert un litige concernant la commande que vous avez traitée.`
      }
      
      Détails du litige:
      - Raison indiquée : ${disputeReason}
      - Description : ${disputeDescription}
      
      Informations sur la commande:
      - Numéro de commande : #${orderNumber}
      - Service : ${serviceName}
      - Date de la commande : ${formattedOrderDate}
      - Montant : ${formattedAmount}
      
      Nous vous invitons à consulter le détail du litige et à y répondre dans les plus brefs délais. Notre équipe de médiation examinera attentivement la situation et travaillera avec les deux parties pour trouver une solution équitable.
      
      Consulter le litige: ${actualDisputeLink}
      
      Prochaines étapes:
      1. Consultez les détails du litige
      2. Fournissez votre version des faits et d'éventuelles preuves
      3. Notre équipe de médiation analysera la situation
      4. Une décision sera prise dans un délai de 5 jours ouvrés
      
      Pendant la durée du litige, les fonds associés à cette commande sont temporairement bloqués jusqu'à la résolution du différend.
      
      Si vous avez des questions supplémentaires, n'hésitez pas à contacter notre service client.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate('Litige ouvert sur votre commande', htmlContent);
    const text = createBaseTextTemplate('Un litige a été ouvert sur votre commande - Nionfar', textContent);

    return { html, text };
  },
}; 