import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Adresse email autorisée en mode test
const ALLOWED_TEST_EMAIL = 'badzagueye@gmail.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API /test-basics appelée', req.method, req.body ? 'avec body' : 'sans body');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    console.log('Requête reçue:', JSON.stringify(req.body));
    let { email } = req.body;

    if (!email) {
      console.error('Email manquant dans la requête');
      return res.status(400).json({ 
        success: false, 
        error: 'L\'adresse email est requise' 
      });
    }
    
    let originalEmail = email;
    let isSimulated = false;
    
    // En mode test, si l'email n'est pas l'adresse autorisée, forcer l'utilisation de l'adresse autorisée
    if (email !== ALLOWED_TEST_EMAIL) {
      console.log(`Redirection de l'email vers ${ALLOWED_TEST_EMAIL} au lieu de ${email} pour le test`);
      isSimulated = true;
      email = ALLOWED_TEST_EMAIL;
    }
    
    console.log(`Tentative d'envoi d'email à ${email}`);
    
    // Contenu simple pour l'email de test
    const subject = 'Test Email Basique';
    const simpleHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <h1 style="color: #4F46E5;">Test Email Basique</h1>
        <p>Ceci est un email de test envoyé depuis l'API test-basics.</p>
        <p>Le test a été effectué avec succès!</p>
        <p>Cordialement,<br>L'équipe Nionfar</p>
      </div>
    `;
    
    const simpleText = `
      Test Email Basique
      
      Ceci est un email de test envoyé depuis l'API test-basics.
      
      Le test a été effectué avec succès!
      
      Cordialement,
      L'équipe Nionfar
    `;
    
    try {
      // Utiliser directement l'API Resend
      const resend = new Resend(process.env.RESEND_API_KEY || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q');
      
      console.log(`Envoi simple via Resend à ${email}`);
      
      const payload = {
        from: 'onboarding@resend.dev', // Toujours utiliser cette adresse pour les tests
        to: [email],
        subject: subject,
        html: simpleHtml,
        text: simpleText
      };
      
      console.log('Payload d\'envoi:', JSON.stringify({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
      }));
      
      const result = await resend.emails.send(payload);
      
      console.log('Résultat d\'envoi:', JSON.stringify(result));

      if ('error' in result && result.error) {
        console.error('Erreur Resend:', result.error);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'envoi de l\'email',
          message: 'Le service d\'email a rencontré une erreur',
          details: { success: false, error: result.error }
        });
      }

      // Traiter le résultat comme un succès
      const messageId = 'id' in result ? result.id : `success-${Date.now()}`;

      // Si c'était une simulation (email redirigé), indiquer cela dans la réponse
      if (isSimulated) {
        return res.status(200).json({
          success: true,
          message: `[TEST SEULEMENT] Email basique envoyé à ${ALLOWED_TEST_EMAIL} (au lieu de ${originalEmail})`,
          note: `En mode test, seul ${ALLOWED_TEST_EMAIL} peut recevoir des emails. L'email destiné à ${originalEmail} a été envoyé à ${ALLOWED_TEST_EMAIL}.`,
          details: { success: true, messageId }
        });
      }

      return res.status(200).json({
        success: true,
        message: `Email basique envoyé avec succès à ${email}`,
        details: { success: true, messageId }
      });
    } catch (sendError: any) {
      console.error('Erreur lors de l\'appel à resend.emails.send:', sendError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'appel à l\'API Resend',
        message: sendError.message,
        stack: process.env.NODE_ENV === 'development' ? sendError.stack : undefined
      });
    }
  } catch (error: any) {
    console.error('Erreur générale lors de l\'envoi de l\'email basique:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
} 