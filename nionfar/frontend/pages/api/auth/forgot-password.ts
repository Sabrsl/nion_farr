import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailManager } from '../../../lib/emails/emailManager';
import { generateRandomToken, isValidEmail } from '../../../lib/auth/utils';
import { userStorage, passwordResetTokens } from '../../../lib/auth/storage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Méthode non autorisée' 
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis',
        details: { email: 'Veuillez fournir une adresse email' }
      });
    }
    
    // Vérifier le format de l'email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide',
        details: { email: 'L\'adresse email fournie n\'est pas valide' }
      });
    }

    // Dans une vraie application, on vérifierait si l'utilisateur existe
    // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
    // À la place, toujours envoyer une réponse positive

    // Vérifier si l'utilisateur existe
    const userExists = userStorage.exists(email);

    // Si l'utilisateur n'existe pas, simuler un délai pour éviter les attaques par timing
    if (!userExists) {
      // Attendre un temps aléatoire pour simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      // Retourner un message générique comme si tout s'était bien passé
      return res.status(200).json({
        success: true,
        message: 'Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé.'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = generateRandomToken('reset');
    
    // Date d'expiration (1 heure)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Stocker le token
    passwordResetTokens.set(resetToken, {
      email,
      token: resetToken,
      expiresAt: expiresAt.toISOString()
    });
    
    // Construire le lien de réinitialisation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    
    // Initialiser EmailManager
    EmailManager.initialize();

    // Vérifier le mode test de Resend
    const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
    const verifiedEmail = 'badzagueye@gmail.com'; // Email vérifié pour les tests
    
    // En mode test, envoyer l'email à l'adresse vérifiée uniquement
    const recipientEmail = isTestMode ? verifiedEmail : email;
    
    // Préparer les données pour l'email
    const userData = userStorage.getByEmail(email);
    const userName = userData?.name || email.split('@')[0];
    
    // Générer un code de réinitialisation à 6 chiffres pour l'affichage dans l'email
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Envoyer l'email de réinitialisation
    const emailResult = await EmailManager.sendPasswordReset(
      recipientEmail,
      {
        userName,
        resetCode,
        resetLink,
        expirationTime: '1 heure'
      }
    );
    
    if (!emailResult.success) {
      console.error('Échec de l\'envoi de l\'email de réinitialisation:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Impossible d\'envoyer l\'email de réinitialisation',
        details: emailResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: isTestMode && email !== verifiedEmail
        ? 'Instructions de réinitialisation envoyées à l\'adresse de test (mode développement)'
        : 'Instructions de réinitialisation envoyées à votre adresse email',
      expiresAt,
      // En mode développement, inclure le token pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' ? { resetToken, resetLink } : {})
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

// Exposer passwordResetTokens pour l'API de test
export { passwordResetTokens }; 