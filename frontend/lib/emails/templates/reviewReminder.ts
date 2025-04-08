import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template de rappel pour laisser une évaluation
 */
export const reviewReminderTemplate: EmailTemplate = {
  name: 'review-reminder',
  defaultSubject: 'Rappel : Évaluez votre expérience sur Nionfar',
  render: (data) => {
    const {
      recipientName,
      recipientRole, // 'client' ou 'freelancer'
      orderId,
      orderTitle,
      otherPartyName,
      daysRemaining,
      reviewLink,
      completionDate,
    } = data;

    const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('fr-FR') : '';
    
    const actualReviewLink = reviewLink || 
      `${EMAIL_CONFIG.baseUrl}/dashboard/${recipientRole === 'client' ? 'client' : 'freelance'}/orders/${orderId}`;

    const recipientIsClient = recipientRole === 'client';
    const serviceOrClient = recipientIsClient ? "le service reçu" : "votre client";
    const title = recipientIsClient ? "Évaluez le prestataire" : "Évaluez votre client";
    
    const htmlContent = `
      <h2>${title}</h2>
      <p>Bonjour ${recipientName},</p>
      
      <p>Votre commande <strong>${orderTitle}</strong> (n°${orderId}) a été marquée comme terminée ${formattedCompletionDate ? `le ${formattedCompletionDate}` : 'récemment'}.</p>
      
      <div class="highlight-box">
        <p><strong>Il vous reste ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} pour laisser votre évaluation.</strong></p>
        
        <p>En partageant votre expérience avec ${recipientIsClient ? otherPartyName : 'votre client'}, vous :</p>
        <ul>
          <li>Contribuez à la qualité de la communauté Nionfar</li>
          <li>Aidez les autres utilisateurs à faire des choix éclairés</li>
          ${recipientIsClient ? '<li>Valorisez le travail bien fait du prestataire</li>' : '<li>Construisez votre réputation sur la plateforme</li>'}
        </ul>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actualReviewLink}" class="button">Laisser mon évaluation</a>
      </p>
      
      <div class="notice-box">
        <h3>Comment évaluer ${serviceOrClient} ?</h3>
        <p>Une bonne évaluation est :</p>
        <ul style="margin-top: 5px;">
          <li>Honnête et objective</li>
          <li>Détaillée, en expliquant ce qui a bien fonctionné ou ce qui aurait pu être amélioré</li>
          <li>Constructive, même en cas d'insatisfaction</li>
        </ul>
      </div>
      
      <p>Nous vous remercions de contribuer à la qualité des échanges sur Nionfar.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      ${title}
      
      Bonjour ${recipientName},
      
      Votre commande "${orderTitle}" (n°${orderId}) a été marquée comme terminée ${formattedCompletionDate ? `le ${formattedCompletionDate}` : 'récemment'}.
      
      Il vous reste ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} pour laisser votre évaluation.
      
      En partageant votre expérience avec ${recipientIsClient ? otherPartyName : 'votre client'}, vous :
      - Contribuez à la qualité de la communauté Nionfar
      - Aidez les autres utilisateurs à faire des choix éclairés
      ${recipientIsClient ? '- Valorisez le travail bien fait du prestataire' : '- Construisez votre réputation sur la plateforme'}
      
      Laisser mon évaluation : ${actualReviewLink}
      
      Comment évaluer ${serviceOrClient} ?
      Une bonne évaluation est :
      - Honnête et objective
      - Détaillée, en expliquant ce qui a bien fonctionné ou ce qui aurait pu être amélioré
      - Constructive, même en cas d'insatisfaction
      
      Nous vous remercions de contribuer à la qualité des échanges sur Nionfar.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate('Rappel d\'évaluation', htmlContent);
    const text = createBaseTextTemplate('Rappel : Évaluez votre expérience', textContent);

    return { html, text };
  },
}; 