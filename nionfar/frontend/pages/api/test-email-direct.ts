import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Initialize Resend with API key directly (for testing only)
const resend = new Resend(process.env.RESEND_API_KEY || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q');

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

    console.log(`Tentative d'envoi d'email direct à: ${email}`);
    
    // Envoi de l'email direct sans utiliser les templates
    try {
      const result = await resend.emails.send({
        from: 'Nionfar Test <onboarding@resend.dev>',
        to: [email],
        subject: 'Test email from Nionfar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Test Email de Nionfar</h1>
            <p>Bonjour,</p>
            <p>Ceci est un email de test envoyé depuis la plateforme Nionfar.</p>
            <p>Si vous recevez cet email, cela signifie que notre système d'envoi d'emails fonctionne correctement.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p><strong>Pour information:</strong></p>
              <p>Ce message a été envoyé à: ${email}</p>
              <p>Date et heure: ${new Date().toLocaleString()}</p>
            </div>
            <p>Merci de votre attention.</p>
            <p>Cordialement,<br>L'équipe Nionfar</p>
          </div>
        `,
        text: `Test Email de Nionfar
        
Bonjour,

Ceci est un email de test envoyé depuis la plateforme Nionfar.
Si vous recevez cet email, cela signifie que notre système d'envoi d'emails fonctionne correctement.

Pour information:
Ce message a été envoyé à: ${email}
Date et heure: ${new Date().toLocaleString()}

Merci de votre attention.

Cordialement,
L'équipe Nionfar`
      });

      console.log('Résultat de l\'envoi direct:', result);
      
      if ('error' in result) {
        return res.status(500).json({
          error: 'Failed to send test email',
          details: result.error
        });
      }

      return res.status(200).json({
        success: true,
        message: `Test email directly sent to ${email}`,
        data: result
      });
    } catch (err: any) {
      console.error('Erreur détectée lors de l\'envoi direct:', err);
      return res.status(500).json({
        error: 'Failed to send test email directly',
        message: err.message,
        stack: err.stack
      });
    }
  } catch (error: any) {
    console.error('Error in test-email-direct API handler:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error.message,
      stack: error.stack
    });
  }
} 