import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailManager } from '../../../lib/emails/emailManager';
import { VALID_CATEGORIES } from '../../../lib/emails/emailConfig';

// Regex pour valider un email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier que la méthode est bien POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { name, email, subject, message, phoneNumber, category } = req.body;

    // Valider les champs requis
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Tous les champs requis doivent être remplis',
        details: {
          name: !name ? 'Le nom est requis' : null,
          email: !email ? 'L\'email est requis' : null,
          message: !message ? 'Le message est requis' : null
        }
      });
    }

    // Valider le format de l'email
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: 'Format d\'email invalide',
        details: { email: 'Veuillez entrer une adresse email valide' }
      });
    }

    // Valider la catégorie si elle est fournie
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: 'Catégorie invalide',
        details: { category: 'Veuillez sélectionner une catégorie valide' }
      });
    }

    console.log('Initialisation de EmailManager...');
    // Initialiser le gestionnaire d'emails
    EmailManager.initialize();

    // Vérifier si l'API Resend est en mode test (clé commençant par 're_')
    const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
    const verifiedEmail = 'badzagueye@gmail.com'; // L'email vérifié pour les tests
    
    // En mode test, Resend n'autorise l'envoi qu'à l'adresse vérifiée
    // Nous allons donc remplacer l'adresse de l'expéditeur par l'adresse vérifiée
    const userData = {
      name,
      email: isTestMode ? verifiedEmail : email, // Remplacer l'email en mode test
      subject,
      message,
      phoneNumber,
      category
    };
    
    // Avertir si nous remplaçons l'email en mode test
    if (isTestMode && email !== verifiedEmail) {
      console.log(`Mode test détecté: remplaçant l'email ${email} par ${verifiedEmail} pour la confirmation`);
    }

    console.log('Envoi de l\'email de contact...');
    // Envoyer l'email
    const result = await EmailManager.sendContactEmail(userData);

    console.log('Résultat de l\'envoi:', result);

    if (!result.success) {
      // Échec complet de l'envoi
      console.error('Échec de l\'envoi du formulaire de contact:', result.error);
      return res.status(500).json({
        error: 'Échec de l\'envoi du message',
        details: result.error
      });
    }
    
    // Cas où l'email de confirmation a été envoyé mais pas l'email principal
    if (result.error?.partialFailure) {
      console.warn('Succès partiel:', result.error.message);
      return res.status(207).json({
        success: true,
        partialSuccess: true,
        message: isTestMode
          ? 'Votre message a été envoyé, mais en mode test, la confirmation a été envoyée à notre adresse de test.'
          : 'Votre message a été enregistré, mais nous avons rencontré un problème technique. Notre équipe en a été informée.',
        details: result.error
      });
    }

    // Succès complet
    return res.status(200).json({
      success: true,
      message: isTestMode && email !== verifiedEmail
        ? 'Votre message a été envoyé. NOTE: En mode test, la confirmation a été envoyée à notre adresse de test.'
        : 'Votre message a été envoyé avec succès',
      id: result.id
    });

  } catch (error) {
    console.error('Exception lors du traitement du formulaire de contact:', error);
    return res.status(500).json({
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 