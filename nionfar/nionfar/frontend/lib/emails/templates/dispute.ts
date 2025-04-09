import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de litige
 */
export const disputeTemplate: EmailTemplate = {
  name: 'dispute',
  defaultSubject: 'Important : Litige concernant votre commande',
  render: (data) => {
    const {
      recipientName,
      recipientRole, // 'client' ou 'freelancer'
      orderId,
      orderTitle,
      disputeReason,
      disputeId,
      disputeDate,
      otherPartyName,
      disputeDetails,
      disputeLink,
      isNew = true, // Si c'est une nouvelle notification de litige ou une mise à jour
      requiredAction,
      deadlineDate,
    } = data;

    // Format de la date (si fournie)
    const formattedDisputeDate = disputeDate ? new Date(disputeDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const formattedDeadlineDate = deadlineDate ? new Date(deadlineDate).toLocaleDateString('fr-FR') : '';
    
    // Lien vers le litige
    const actualDisputeLink = disputeLink || `${EMAIL_CONFIG.baseUrl}/dashboard/${recipientRole === 'client' ? 'client' : 'freelance'}/disputes/${disputeId || orderId}`;

    // Texte conditionnel selon le rôle
    const roleText = recipientRole === 'client' ? 'le prestataire' : 'le client';
    
    const subject = isNew ? 
      'Important : Un litige a été ouvert concernant votre commande' : 
      'Mise à jour concernant le litige sur votre commande';

    const titleText = isNew ?
      'Un litige a été ouvert' :
      'Mise à jour du litige';

    const htmlContent = `
      <h2>${titleText}</h2>
      <p>Bonjour ${recipientName},</p>
      
      ${isNew ? 
      `<p>Nous vous informons qu'un litige a été ouvert par ${roleText} ${otherPartyName} concernant la commande <strong>${orderTitle}</strong> (n°${orderId}) en date du ${formattedDisputeDate}.</p>` : 
      `<p>Nous vous informons d'une mise à jour concernant le litige ouvert sur la commande <strong>${orderTitle}</strong> (n°${orderId}).</p>`
      }
      
      <div class="highlight-box">
        <h3>Détails du litige</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Commande :</strong> 
            <span>${orderTitle} (n°${orderId})</span>
          </li>
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Motif du litige :</strong> 
            <span>${disputeReason}</span>
          </li>
          ${disputeDetails ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Détails :</strong> 
            <p style="margin-top: 5px; padding: 10px; background-color: #f7f7f7; border-radius: 4px;">${disputeDetails}</p>
          </li>
          ` : ''}
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Initié par :</strong> 
            <span>${otherPartyName} (${recipientRole === 'client' ? 'prestataire' : 'client'})</span>
          </li>
          ${formattedDeadlineDate ? `
          <li style="padding: 8px 0; color: #d32f2f; font-weight: bold;">
            <strong>Date limite de réponse :</strong> 
            <span>${formattedDeadlineDate}</span>
          </li>
          ` : ''}
        </ul>
      </div>
      
      ${requiredAction ? `
      <div class="notice-box" style="background-color: #FFF3E0;">
        <h3>Action requise</h3>
        <p>${requiredAction}</p>
        ${formattedDeadlineDate ? `<p><strong>Veuillez répondre avant le ${formattedDeadlineDate}.</strong> Dans le cas contraire, une décision pourrait être prise sans prendre en compte votre position.</p>` : ''}
      </div>
      ` : `
      <div class="notice-box">
        <h3>Procédure de résolution des litiges</h3>
        <ol style="margin-top: 5px;">
          <li>Consultez les détails du litige en cliquant sur le bouton ci-dessous</li>
          <li>Fournissez votre version des faits et les pièces justificatives demandées</li>
          <li>Essayez d'abord de trouver une solution à l'amiable avec ${roleText}</li>
          <li>En cas d'échec, notre équipe de médiation interviendra pour résoudre le différend</li>
        </ol>
      </div>
      `}
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actualDisputeLink}" class="button">Consulter le litige</a>
      </p>
      
      <p>Notre équipe est disponible pour vous accompagner tout au long de ce processus. N'hésitez pas à nous contacter si vous avez des questions.</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    const textContent = `
      ${titleText}
      
      Bonjour ${recipientName},
      
      ${isNew ? 
      `Nous vous informons qu'un litige a été ouvert par ${roleText} ${otherPartyName} concernant la commande "${orderTitle}" (n°${orderId}) en date du ${formattedDisputeDate}.` : 
      `Nous vous informons d'une mise à jour concernant le litige ouvert sur la commande "${orderTitle}" (n°${orderId}).`
      }
      
      DÉTAILS DU LITIGE
      
      Commande : ${orderTitle} (n°${orderId})
      Motif du litige : ${disputeReason}
      ${disputeDetails ? `Détails : ${disputeDetails}` : ''}
      Initié par : ${otherPartyName} (${recipientRole === 'client' ? 'prestataire' : 'client'})
      ${formattedDeadlineDate ? `Date limite de réponse : ${formattedDeadlineDate}` : ''}
      
      ${requiredAction ? `
      ACTION REQUISE
      
      ${requiredAction}
      
      ${formattedDeadlineDate ? `Veuillez répondre avant le ${formattedDeadlineDate}. Dans le cas contraire, une décision pourrait être prise sans prendre en compte votre position.` : ''}
      ` : `
      PROCÉDURE DE RÉSOLUTION DES LITIGES
      
      1. Consultez les détails du litige en cliquant sur le lien ci-dessous
      2. Fournissez votre version des faits et les pièces justificatives demandées
      3. Essayez d'abord de trouver une solution à l'amiable avec ${roleText}
      4. En cas d'échec, notre équipe de médiation interviendra pour résoudre le différend
      `}
      
      Consulter le litige : ${actualDisputeLink}
      
      Notre équipe est disponible pour vous accompagner tout au long de ce processus. N'hésitez pas à nous contacter si vous avez des questions.
      
      Cordialement,
      L'équipe Nionfar
    `;

    const html = createBaseHtmlTemplate(subject, htmlContent);
    const text = createBaseTextTemplate(subject, textContent);

    return { html, text };
  },
}; 