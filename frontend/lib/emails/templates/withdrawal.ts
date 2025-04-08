import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de retrait
 */
export const withdrawalTemplate: EmailTemplate = {
  name: 'withdrawal',
  defaultSubject: 'Confirmation de votre demande de retrait',
  render: (data) => {
    const {
      recipientName,
      withdrawalAmount,
      withdrawalCurrency = 'XOF',
      withdrawalMethod,
      withdrawalReference,
      estimatedArrivalDate,
      withdrawalStatus = 'pending',
      walletBalance,
      withdrawalHistoryLink,
      withdrawalDate,
    } = data;

    // Format de la date (si fournie)
    const formattedWithdrawalDate = withdrawalDate ? new Date(withdrawalDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    
    // Texte conditionnel selon le statut
    let statusText = '';
    let statusColor = '';
    let titleText = '';

    switch (withdrawalStatus.toLowerCase()) {
      case 'completed':
        statusText = 'Traité et envoyé';
        statusColor = '#4CAF50';
        titleText = 'Votre retrait a été effectué avec succès';
        break;
      case 'rejected':
        statusText = 'Rejeté';
        statusColor = '#F44336';
        titleText = 'Votre demande de retrait a été rejetée';
        break;
      case 'pending':
      default:
        statusText = 'En cours de traitement';
        statusColor = '#FF9800';
        titleText = 'Demande de retrait bien reçue';
        break;
    }

    // Lien vers l'historique des retraits
    const actualHistoryLink = withdrawalHistoryLink || `${EMAIL_CONFIG.baseUrl}/dashboard/freelance/finances/withdrawals`;

    const htmlContent = `
      <h2>${titleText}</h2>
      <p>Bonjour ${recipientName},</p>
      
      <p>Nous vous informons ${withdrawalStatus === 'pending' ? 'que nous avons bien reçu' : 'concernant'} votre demande de retrait en date du ${formattedWithdrawalDate}.</p>
      
      <div class="highlight-box">
        <h3>Détails du retrait</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Montant :</strong> 
            <span style="float: right;">${withdrawalAmount.toLocaleString('fr-FR')} ${withdrawalCurrency}</span>
          </li>
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Méthode de paiement :</strong> 
            <span style="float: right;">${withdrawalMethod}</span>
          </li>
          ${withdrawalReference ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Référence du retrait :</strong> 
            <span style="float: right;">${withdrawalReference}</span>
          </li>
          ` : ''}
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Statut :</strong> 
            <span style="float: right; color: ${statusColor}; font-weight: bold;">${statusText}</span>
          </li>
          ${estimatedArrivalDate && withdrawalStatus !== 'rejected' ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Date d'arrivée estimée :</strong> 
            <span style="float: right;">${estimatedArrivalDate}</span>
          </li>
          ` : ''}
          ${walletBalance !== undefined ? `
          <li style="padding: 8px 0;">
            <strong>Solde restant :</strong> 
            <span style="float: right;">${walletBalance.toLocaleString('fr-FR')} ${withdrawalCurrency}</span>
          </li>
          ` : ''}
        </ul>
      </div>
      
      ${withdrawalStatus === 'pending' ? `
      <div class="notice-box">
        <h3>Informations importantes</h3>
        <ul>
          <li>Les retraits sont généralement traités sous 1 à 3 jours ouvrables.</li>
          <li>Pour tout problème ou question, n'hésitez pas à contacter notre support.</li>
          <li>Vous recevrez une notification dès que votre retrait aura été traité.</li>
        </ul>
      </div>
      ` : withdrawalStatus === 'rejected' ? `
      <div class="notice-box" style="background-color: #FFEBEE;">
        <h3>Votre retrait a été rejeté</h3>
        <p>Raisons possibles :</p>
        <ul>
          <li>Informations de paiement incorrectes ou incomplètes</li>
          <li>Problème technique avec le processeur de paiement</li>
          <li>Vérification de compte requise</li>
        </ul>
        <p>Veuillez contacter notre service client pour plus d'informations.</p>
      </div>
      ` : `
      <div class="notice-box" style="background-color: #E8F5E9;">
        <h3>Votre retrait a été effectué</h3>
        <p>Les fonds ont été envoyés via ${withdrawalMethod} et devraient être disponibles sur votre compte selon les délais habituels de votre établissement financier.</p>
      </div>
      `}
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actualHistoryLink}" class="button">Voir mes retraits</a>
      </p>
      
      <p>Merci de faire confiance à Nionfar pour développer votre activité.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      ${titleText}
      
      Bonjour ${recipientName},
      
      Nous vous informons ${withdrawalStatus === 'pending' ? 'que nous avons bien reçu' : 'concernant'} votre demande de retrait en date du ${formattedWithdrawalDate}.
      
      DÉTAILS DU RETRAIT
      
      Montant : ${withdrawalAmount.toLocaleString('fr-FR')} ${withdrawalCurrency}
      Méthode de paiement : ${withdrawalMethod}
      ${withdrawalReference ? `Référence du retrait : ${withdrawalReference}` : ''}
      Statut : ${statusText}
      ${estimatedArrivalDate && withdrawalStatus !== 'rejected' ? `Date d'arrivée estimée : ${estimatedArrivalDate}` : ''}
      ${walletBalance !== undefined ? `Solde restant : ${walletBalance.toLocaleString('fr-FR')} ${withdrawalCurrency}` : ''}
      
      ${withdrawalStatus === 'pending' ? `
      INFORMATIONS IMPORTANTES
      
      - Les retraits sont généralement traités sous 1 à 3 jours ouvrables.
      - Pour tout problème ou question, n'hésitez pas à contacter notre support.
      - Vous recevrez une notification dès que votre retrait aura été traité.
      ` : withdrawalStatus === 'rejected' ? `
      VOTRE RETRAIT A ÉTÉ REJETÉ
      
      Raisons possibles :
      - Informations de paiement incorrectes ou incomplètes
      - Problème technique avec le processeur de paiement
      - Vérification de compte requise
      
      Veuillez contacter notre service client pour plus d'informations.
      ` : `
      VOTRE RETRAIT A ÉTÉ EFFECTUÉ
      
      Les fonds ont été envoyés via ${withdrawalMethod} et devraient être disponibles sur votre compte selon les délais habituels de votre établissement financier.
      `}
      
      Voir mes retraits : ${actualHistoryLink}
      
      Merci de faire confiance à Nionfar pour développer votre activité.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate(`Retrait - ${statusText}`, htmlContent);
    const text = createBaseTextTemplate(`Retrait - ${statusText}`, textContent);

    return { html, text };
  },
}; 