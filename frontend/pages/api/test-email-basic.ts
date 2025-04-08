import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Adresse email autorisée en mode test
const ALLOWED_TEST_EMAIL = 'badzagueye@gmail.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email: originalEmail } = req.body;

    // Validation de l'email
    if (!originalEmail || typeof originalEmail !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid email address' });
    }
    
    // Utiliser l'adresse autorisée pour les tests, mais conserver l'adresse originale pour le feedback
    let email = originalEmail;
    let isSimulated = false;
    
    if (email !== ALLOWED_TEST_EMAIL) {
      console.log(`Redirection de l'email vers ${ALLOWED_TEST_EMAIL} au lieu de ${email} pour le test`);
      isSimulated = true;
      email = ALLOWED_TEST_EMAIL;
    }

    // Utiliser la clé directement pour éviter tout problème lié aux variables d'environnement
    const resend = new Resend('re_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q');
    
    console.log(`Envoi d'email basique à ${email}`);
    
    // Email le plus simple possible
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Test simple',
      text: 'Ceci est un test simple',
    });

    console.log('Résultat de l\'envoi basique:', data);

    if (isSimulated) {
      return res.status(200).json({ 
        success: true, 
        message: `[TEST SEULEMENT] Email basique envoyé à ${ALLOWED_TEST_EMAIL} (au lieu de ${originalEmail})`, 
        note: `En mode test, seul ${ALLOWED_TEST_EMAIL} peut recevoir des emails. L'email destiné à ${originalEmail} a été envoyé à ${ALLOWED_TEST_EMAIL}.`,
        data,
        simulatedFor: originalEmail
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email basique envoyé', 
      data 
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi d\'email basique:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
} 