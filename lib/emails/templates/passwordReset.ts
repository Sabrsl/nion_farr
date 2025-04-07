import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour les emails de réinitialisation de mot de passe
 */
export const passwordResetTemplate: EmailTemplate = {
  name: 'PASSWORD_RESET',
  defaultSubject: 'Réinitialisation de votre mot de passe Nionfar',
  render: (data) => {
    const {
      userName,
      resetCode,
      resetLink,
      expirationTime
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Bonjour ${userName},</p>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Veuillez utiliser le code ci-dessous :</p>
      
      <div class="code-block">${resetCode}</div>
      
      <p>Ou cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      
      <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
      
      <div class="info-block">
        <p>Ce lien est valable pendant ${expirationTime}. Après cette période, vous devrez faire une nouvelle demande.</p>
      </div>
      
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email ou contacter notre support.</p>
      <p>Cordialement,<br>L'équipe Nionfar</p>
    `;

    // Contenu texte
    const textContent = `
      Réinitialisation de mot de passe
      
      Bonjour ${userName},
      
      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Veuillez utiliser le code ci-dessous :
      
      ${resetCode}
      
      Ou cliquez sur le lien suivant pour créer un nouveau mot de passe :
      ${resetLink}
      
      Ce lien est valable pendant ${expirationTime}. Après cette période, vous devrez faire une nouvelle demande.
      
      Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email ou contacter notre support.
      
      Cordialement,
      L'équipe Nionfar
    `;

    return {
      html: createBaseHtmlTemplate(htmlContent, "Réinitialisation de votre mot de passe"),
      text: createBaseTextTemplate(textContent, "Réinitialisation de votre mot de passe")
    };
  }
}; 