import { EmailTemplate } from '../emailTemplates';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour les emails envoyés via le formulaire de contact
 */
export const contactFormTemplate: EmailTemplate = {
  name: 'CONTACT_FORM',
  defaultSubject: 'Nouveau message de contact',
  render: (data) => {
    const {
      senderName,
      senderEmail,
      subject,
      message,
      phoneNumber,
      category
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h1>Nouveau message depuis le formulaire de contact</h1>
      
      <div class="info-block">
        <p><strong>De :</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        ${phoneNumber ? `<p><strong>Téléphone :</strong> ${phoneNumber}</p>` : ''}
        ${category ? `<p><strong>Catégorie :</strong> ${category}</p>` : ''}
        <p><strong>Date :</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <h2>Message</h2>
      <div class="message-block">
        ${message.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
      </div>
      
      <p>Pour répondre à ce message, utilisez simplement la fonction "Répondre" de votre client email.</p>
    `;

    // Contenu texte
    const textContent = `
      Nouveau message depuis le formulaire de contact
      
      De : ${senderName} (${senderEmail})
      Sujet : ${subject}
      ${phoneNumber ? `Téléphone : ${phoneNumber}` : ''}
      ${category ? `Catégorie : ${category}` : ''}
      Date : ${new Date().toLocaleString()}
      
      Message :
      
      ${message}
      
      Pour répondre à ce message, utilisez simplement la fonction "Répondre" de votre client email.
    `;

    return {
      html: createBaseHtmlTemplate(htmlContent, "Nouveau message de contact"),
      text: createBaseTextTemplate(textContent, "Nouveau message de contact")
    };
  }
}; 