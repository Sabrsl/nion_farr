import { NextApiRequest, NextApiResponse } from 'next';
import { emailSender } from '../../lib/emails/emailSender';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérification de la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validation de l'email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        details: 'Missing or invalid email address'
      });
    }

    console.log(`Tentative d'envoi d'email de test à: ${email}`);

    // Envoi de l'email de test avec capture des erreurs
    let resultDetails;
    try {
      const result = await emailSender.sendTestEmail(email);
      resultDetails = { success: result };
    } catch (err: any) {
      resultDetails = { 
        error: err.message || 'Unknown error', 
        stack: err.stack,
        details: JSON.stringify(err, null, 2)
      };
      console.error('Erreur détectée lors de l\'envoi:', resultDetails);
    }

    // Vérifier le résultat
    if (!resultDetails.success) {
      return res.status(500).json({
        error: 'Failed to send test email',
        details: resultDetails
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`
    });
  } catch (error: any) {
    console.error('Error in test-email API handler:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error.message,
      stack: error.stack
    });
  }
} 