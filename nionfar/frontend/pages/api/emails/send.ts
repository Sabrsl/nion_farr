import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/emails/emailService';
import { EmailEventType } from '../../../lib/emails/emailConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérification de la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventType, recipient, cc, bcc, templateData, customSubject } = req.body;

    // Validation des données
    if (!eventType || !recipient || !recipient.email || !templateData) {
      return res.status(400).json({ 
        error: 'Bad request', 
        details: 'Missing required fields: eventType, recipient.email, or templateData'
      });
    }

    // Vérification que le type d'événement est valide
    if (!Object.values(EmailEventType).includes(eventType)) {
      return res.status(400).json({ 
        error: 'Invalid event type',
        validTypes: Object.values(EmailEventType)
      });
    }

    // Envoi de l'email
    const result = await emailService.sendEventEmail(
      eventType,
      {
        recipient,
        cc,
        bcc,
        templateData,
        customSubject
      }
    );

    // Gestion du résultat
    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send email',
        details: result.error
      });
    }

    return res.status(200).json({
      success: true,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
} 