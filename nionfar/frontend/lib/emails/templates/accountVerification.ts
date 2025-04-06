import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour les emails de vérification de compte
 */
export const accountVerificationTemplate: EmailTemplate = {
  name: 'ACCOUNT_VERIFICATION',
  defaultSubject: 'Vérifiez votre compte Nionfar',
  render: (data) => {
    const {
      userName,
      verificationCode,
      verificationLink,
      expirationTime
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h1>Vérifiez votre compte</h1>
      <p>Bonjour ${userName},</p>
      <p>Merci de vous être inscrit sur Nionfar. Pour compléter votre inscription, veuillez utiliser le code ci-dessous :</p>
      
      <div class="code-block">${verificationCode}</div>
      
      <p>Vous pouvez également cliquer sur le bouton ci-dessous pour vérifier votre compte :</p>
      
      <a href="${verificationLink}" class="button">Vérifier mon compte</a>
      
      <div class="info-block">
        <p>Ce code est valable pendant ${expirationTime}. Après cette période, vous devrez demander un nouveau code de vérification.</p>
      </div>
      
      <p>Si vous n'avez pas initié cette inscription, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    // Contenu texte
    const textContent = `
      Vérifiez votre compte
      
      Bonjour ${userName},
      
      Merci de vous être inscrit sur Nionfar. Pour compléter votre inscription, veuillez utiliser le code ci-dessous :
      
      ${verificationCode}
      
      Vous pouvez également cliquer sur le lien suivant pour vérifier votre compte :
      ${verificationLink}
      
      Ce code est valable pendant ${expirationTime}. Après cette période, vous devrez demander un nouveau code de vérification.
      
      Si vous n'avez pas initié cette inscription, veuillez ignorer cet email.
      
      Cordialement,
      L'équipe Nionfar
    `;

    return {
      html: createBaseHtmlTemplate(htmlContent, "Vérifiez votre compte Nionfar"),
      text: createBaseTextTemplate(textContent, "Vérifiez votre compte Nionfar")
    };
  }
}; 