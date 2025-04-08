import { EmailTemplate } from '../emailTemplates';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour la notification de rejet de commande
 */
export const orderRejectedTemplate: EmailTemplate = {
  name: 'order_rejected',
  defaultSubject: 'Votre commande a été refusée',
  render: (data: any) => {
    const {
      clientName = 'Client',
      orderId = '',
      orderDetails = {},
      rejectionReason = '',
      sellerName = 'Vendeur',
      nextSteps = '',
      refundStatus = ''
    } = data;

    // Contenu HTML
    const htmlContent = `
      <h2>Commande Non Acceptée</h2>
      
      <p>Bonjour ${clientName},</p>
      
      <p>Nous regrettons de vous informer que votre commande <strong>${orderId}</strong> n'a pas été acceptée par ${sellerName}.</p>
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Détails de la commande</h3>
        <p><strong>Titre:</strong> ${orderDetails.title || 'Non spécifié'}</p>
        <p><strong>Montant:</strong> ${orderDetails.price || 'Non spécifié'}</p>
      </div>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #b91c1c;">Raison du refus</h3>
        <p>${rejectionReason || 'Le prestataire n\'a pas indiqué de raison spécifique.'}</p>
      </div>
      
      ${refundStatus ? `
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0284c7;">
        <h3 style="margin-top: 0; color: #0369a1;">Remboursement</h3>
        <p>${refundStatus === 'completed' 
          ? 'Votre paiement a été intégralement remboursé. Le montant sera crédité sur votre moyen de paiement initial dans un délai de 3 à 5 jours ouvrés selon votre banque.'
          : refundStatus === 'pending' 
          ? 'Votre remboursement est en cours de traitement. Le montant sera crédité sur votre moyen de paiement initial dans un délai de 3 à 5 jours ouvrés selon votre banque.'
          : 'Les informations concernant votre remboursement vous seront communiquées prochainement.'}</p>
      </div>
      ` : ''}
      
      <p>Que faire maintenant?</p>
      <p>${nextSteps || 'Nous vous suggérons de considérer les options suivantes:'}</p>
      
      <ul style="padding-left: 20px;">
        <li>Contacter le prestataire pour discuter des modifications possibles à votre commande</li>
        <li>Consulter d'autres prestataires proposant des services similaires</li>
        <li>Ajuster vos exigences en fonction du retour reçu et soumettre une nouvelle commande</li>
      </ul>
      
      <p>Votre paiement n'a pas été débité et aucuns frais ne vous ont été facturés pour cette commande non acceptée.</p>
      
      <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
      
      <p>Cordialement,<br>
      L'équipe Nionfar</p>
    `;

    // Contenu texte brut
    const textContent = `
Commande Non Acceptée

Bonjour ${clientName},

Nous regrettons de vous informer que votre commande ${orderId} n'a pas été acceptée par ${sellerName}.

Détails de la commande:
- Titre: ${orderDetails.title || 'Non spécifié'}
- Montant: ${orderDetails.price || 'Non spécifié'}

Raison du refus:
${rejectionReason || 'Le prestataire n\'a pas indiqué de raison spécifique.'}

${refundStatus ? `Remboursement:
${refundStatus === 'completed' 
  ? 'Votre paiement a été intégralement remboursé. Le montant sera crédité sur votre moyen de paiement initial dans un délai de 3 à 5 jours ouvrés selon votre banque.'
  : refundStatus === 'pending' 
  ? 'Votre remboursement est en cours de traitement. Le montant sera crédité sur votre moyen de paiement initial dans un délai de 3 à 5 jours ouvrés selon votre banque.'
  : 'Les informations concernant votre remboursement vous seront communiquées prochainement.'}
` : ''}

Que faire maintenant?
${nextSteps || 'Nous vous suggérons de considérer les options suivantes:'}
- Contacter le prestataire pour discuter des modifications possibles à votre commande
- Consulter d'autres prestataires proposant des services similaires
- Ajuster vos exigences en fonction du retour reçu et soumettre une nouvelle commande

Votre paiement n'a pas été débité et aucuns frais ne vous ont été facturés pour cette commande non acceptée.

Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.

Cordialement,
L'équipe Nionfar
    `;

    return {
      html: createBaseHtmlTemplate('Commande Non Acceptée', htmlContent),
      text: createBaseTextTemplate('Votre commande a été refusée', textContent)
    };
  }
}; 