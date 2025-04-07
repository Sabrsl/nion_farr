import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de résolution de litige
 */
export const disputeResolvedTemplate: EmailTemplate = {
  name: 'dispute-resolved',
  defaultSubject: 'Résolution du litige sur votre commande - Nionfar',
  render: (data) => {
    const {
      recipientName,
      recipientRole, // 'client' ou 'seller'
      orderNumber,
      serviceName,
      disputeReason,
      resolutionDecision,
      resolutionNote,
      resolutionDate,
      resolutionType, // 'in_favor_of_client', 'in_favor_of_seller', 'compromise'
      refundAmount,
      orderLink,
    } = data;

    const formattedResolutionDate = typeof resolutionDate === 'string' 
      ? new Date(resolutionDate).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : resolutionDate;
    
    const formattedRefundAmount = typeof refundAmount === 'number'
      ? new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(refundAmount)
      : refundAmount;

    const isResolutionFavorable = (recipientRole === 'client' && resolutionType === 'in_favor_of_client') 
      || (recipientRole === 'seller' && resolutionType === 'in_favor_of_seller');
    
    const dashboardLink = `${EMAIL_CONFIG.baseUrl}/dashboard/${recipientRole === 'client' ? 'client' : 'freelance'}/orders`;
    const actualOrderLink = orderLink || `${dashboardLink}/${orderNumber}`;

    const htmlContent = `
      <h2>Litige Résolu - Commande #${orderNumber}</h2>
      <p>Bonjour ${recipientName},</p>
      <p>Nous vous informons que le litige concernant la commande <strong>#${orderNumber}</strong> pour <strong>"${serviceName}"</strong> a été résolu par notre équipe de médiation.</p>
      
      ${isResolutionFavorable ? `
      <div class="success-box">
        <h3>Décision</h3>
        <p>La décision a été prise <strong>en votre faveur</strong>.</p>
        <p>${resolutionDecision}</p>
      </div>
      ` : resolutionType === 'compromise' ? `
      <div class="notice-box">
        <h3>Décision</h3>
        <p>Une solution de <strong>compromis</strong> a été trouvée.</p>
        <p>${resolutionDecision}</p>
      </div>
      ` : `
      <div class="warning-box">
        <h3>Décision</h3>
        <p>La décision a été prise <strong>en faveur de ${recipientRole === 'client' ? 'votre prestataire' : 'votre client'}</strong>.</p>
        <p>${resolutionDecision}</p>
      </div>
      `}
      
      <div class="highlight-box">
        <h3>Détails de la résolution</h3>
        <p><strong>Date de résolution :</strong> ${formattedResolutionDate}</p>
        <p><strong>Motif initial du litige :</strong> ${disputeReason}</p>
        ${refundAmount ? `<p><strong>Montant remboursé :</strong> ${formattedRefundAmount}</p>` : ''}
        ${resolutionNote ? `<p><strong>Notes :</strong> ${resolutionNote}</p>` : ''}
      </div>
      
      <p>Suite à cette résolution, votre commande a été mise à jour dans votre tableau de bord. ${
        resolutionType === 'in_favor_of_client' && recipientRole === 'client' 
          ? 'Un remboursement a été initié et sera crédité selon votre mode de paiement initial.'
          : resolutionType === 'in_favor_of_seller' && recipientRole === 'seller'
          ? 'Le paiement a été débloqué et sera disponible dans votre portefeuille.'
          : ''
      }</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actualOrderLink}" class="button">Voir les détails de la commande</a>
      </p>
      
      <p>Nous vous remercions pour votre patience et votre compréhension tout au long de ce processus. Notre objectif est de maintenir une plateforme équitable et transparente pour tous nos utilisateurs.</p>
      
      <p>Si vous avez des questions concernant cette résolution, n'hésitez pas à contacter notre service client.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      Litige Résolu - Commande #${orderNumber}
      
      Bonjour ${recipientName},
      
      Nous vous informons que le litige concernant la commande #${orderNumber} pour "${serviceName}" a été résolu par notre équipe de médiation.
      
      Décision: ${isResolutionFavorable ? 'La décision a été prise en votre faveur.' : resolutionType === 'compromise' ? 'Une solution de compromis a été trouvée.' : `La décision a été prise en faveur de ${recipientRole === 'client' ? 'votre prestataire' : 'votre client'}.`}
      ${resolutionDecision}
      
      Détails de la résolution:
      - Date de résolution : ${formattedResolutionDate}
      - Motif initial du litige : ${disputeReason}
      ${refundAmount ? `- Montant remboursé : ${formattedRefundAmount}` : ''}
      ${resolutionNote ? `- Notes : ${resolutionNote}` : ''}
      
      Suite à cette résolution, votre commande a été mise à jour dans votre tableau de bord. ${
        resolutionType === 'in_favor_of_client' && recipientRole === 'client' 
          ? 'Un remboursement a été initié et sera crédité selon votre mode de paiement initial.'
          : resolutionType === 'in_favor_of_seller' && recipientRole === 'seller'
          ? 'Le paiement a été débloqué et sera disponible dans votre portefeuille.'
          : ''
      }
      
      Voir les détails de la commande: ${actualOrderLink}
      
      Nous vous remercions pour votre patience et votre compréhension tout au long de ce processus. Notre objectif est de maintenir une plateforme équitable et transparente pour tous nos utilisateurs.
      
      Si vous avez des questions concernant cette résolution, n'hésitez pas à contacter notre service client.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate('Résolution du litige', htmlContent);
    const text = createBaseTextTemplate('Résolution du litige sur votre commande - Nionfar', textContent);

    return { html, text };
  },
}; 