import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de retrait de paiement
 */
export const paymentWithdrawalTemplate: EmailTemplate = {
  name: 'payment-withdrawal',
  defaultSubject: 'Confirmation de retrait de fonds - Nionfar',
  render: (data) => {
    const {
      sellerName,
      withdrawalId,
      amount,
      withdrawalMethod,
      accountDetails,
      processingTime,
      withdrawalDate,
      withdrawalStatus,
      balanceLink,
    } = data;

    const formattedAmount = typeof amount === 'number'
      ? new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount)
      : amount;
    
    const formattedDate = typeof withdrawalDate === 'string' 
      ? new Date(withdrawalDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : withdrawalDate;
    
    const walletLink = balanceLink || `${EMAIL_CONFIG.baseUrl}/dashboard/freelance/wallet`;

    const htmlContent = `
      <h2>Retrait de Fonds</h2>
      <p>Bonjour ${sellerName},</p>
      <p>Nous vous confirmons votre demande de retrait de fonds sur Nionfar avec les détails suivants :</p>
      
      <div class="highlight-box">
        <h3>Détails du retrait</h3>
        <p><strong>Référence :</strong> ${withdrawalId}</p>
        <p><strong>Montant :</strong> ${formattedAmount}</p>
        <p><strong>Méthode de retrait :</strong> ${withdrawalMethod}</p>
        <p><strong>Destinataire :</strong> ${accountDetails}</p>
        <p><strong>Date de demande :</strong> ${formattedDate}</p>
        <p><strong>Statut :</strong> ${
          withdrawalStatus === 'completed' ? '<span style="color: #10B981;">Traité avec succès</span>' :
          withdrawalStatus === 'pending' ? '<span style="color: #F59E0B;">En cours de traitement</span>' :
          withdrawalStatus === 'failed' ? '<span style="color: #EF4444;">Échec du traitement</span>' :
          '<span style="color: #6B7280;">En attente</span>'
        }</p>
      </div>
      
      ${withdrawalStatus === 'completed' ? `
      <div class="success-box">
        <h3>Retrait réussi</h3>
        <p>Votre retrait a été traité avec succès. Les fonds ont été envoyés vers votre compte via ${withdrawalMethod}.</p>
      </div>
      ` : withdrawalStatus === 'pending' ? `
      <div class="notice-box">
        <h3>Retrait en cours</h3>
        <p>Votre demande de retrait est en cours de traitement. Le délai habituel pour ce type de transaction est de ${processingTime || '24 à 48 heures ouvrées'}.</p>
      </div>
      ` : withdrawalStatus === 'failed' ? `
      <div class="warning-box">
        <h3>Retrait échoué</h3>
        <p>Nous avons rencontré un problème lors du traitement de votre demande de retrait. Veuillez vérifier les informations de votre compte et réessayer. Si le problème persiste, contactez notre service client.</p>
      </div>
      ` : ''}
      
      <p>Vous pouvez consulter l'historique complet de vos transactions et suivre l'état de vos retraits depuis votre tableau de bord.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${walletLink}" class="button">Accéder à mon portefeuille</a>
      </p>
      
      <p>Si vous avez des questions concernant ce retrait, n'hésitez pas à contacter notre équipe support.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      Bonjour ${sellerName},
      
      Nous vous confirmons votre demande de retrait de fonds sur Nionfar avec les détails suivants :
      
      Détails du retrait:
      - Référence : ${withdrawalId}
      - Montant : ${formattedAmount}
      - Méthode de retrait : ${withdrawalMethod}
      - Destinataire : ${accountDetails}
      - Date de demande : ${formattedDate}
      - Statut : ${
        withdrawalStatus === 'completed' ? 'Traité avec succès' :
        withdrawalStatus === 'pending' ? 'En cours de traitement' :
        withdrawalStatus === 'failed' ? 'Échec du traitement' :
        'En attente'
      }
      
      ${withdrawalStatus === 'completed' ? `Retrait réussi:
      Votre retrait a été traité avec succès. Les fonds ont été envoyés vers votre compte via ${withdrawalMethod}.
      ` : withdrawalStatus === 'pending' ? `Retrait en cours:
      Votre demande de retrait est en cours de traitement. Le délai habituel pour ce type de transaction est de ${processingTime || '24 à 48 heures ouvrées'}.
      ` : withdrawalStatus === 'failed' ? `Retrait échoué:
      Nous avons rencontré un problème lors du traitement de votre demande de retrait. Veuillez vérifier les informations de votre compte et réessayer. Si le problème persiste, contactez notre service client.
      ` : ''}
      
      Vous pouvez consulter l'historique complet de vos transactions et suivre l'état de vos retraits depuis votre tableau de bord.
      
      Accéder à mon portefeuille: ${walletLink}
      
      Si vous avez des questions concernant ce retrait, n'hésitez pas à contacter notre équipe support.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate('Confirmation de retrait', htmlContent);
    const text = createBaseTextTemplate('Confirmation de retrait de fonds - Nionfar', textContent);

    return { html, text };
  },
}; 