import type { NextApiRequest, NextApiResponse } from 'next';
import { generateTemporaryPassword, isValidEmail } from '../../../lib/auth/utils';
import { EmailManager } from '../../../lib/emails/emailManager';
import { userStorage } from '../../../lib/auth/storage';

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

    // Vérifier que l'email est fourni
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

    // Dans une vraie application, vérifier si l'utilisateur existe
    // Pour des raisons de sécurité, on ne révèle pas si l'email existe
    // Simuler la vérification d'un utilisateur existant
    const userExists = userStorage.exists(email);

    // Si l'utilisateur n'existe pas, simuler un délai et renvoyer une réponse positive
    if (!userExists) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      return res.status(200).json({
        success: true,
        message: 'Si ce compte existe, un mot de passe temporaire lui a été envoyé.'
      });
    }

    // Générer un mot de passe temporaire sécurisé
    const { password, hash } = generateTemporaryPassword();
    
    // Dans une vraie application, enregistrer le hash du mot de passe temporaire en base de données
    // avec une date d'expiration (généralement courte, 15-30 minutes) et marquer le compte
    // pour forcer un changement de mot de passe à la prochaine connexion
    
    // Pour notre simulation, trouver l'utilisateur et mettre à jour son mot de passe
    const userData = userStorage.getByEmail(email);
    
    if (userData) {
      userStorage.update(userData.id, {
        password: hash, // Stocker le hash du mot de passe temporaire
        passwordTemporary: true,
        passwordExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        passwordLastChanged: new Date().toISOString()
      });
    }
    
    // Initialiser EmailManager
    EmailManager.initialize();

    // Vérifier le mode test de Resend
    const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
    const verifiedEmail = 'badzagueye@gmail.com'; // Email vérifié pour les tests
    
    // En mode test, envoyer l'email à l'adresse vérifiée uniquement
    const recipientEmail = isTestMode ? verifiedEmail : email;
    
    // Préparer les données pour l'email
    const user = userStorage.getByEmail(email);
    const userName = user?.name || email.split('@')[0];
    
    // Envoyer l'email avec le mot de passe temporaire
    const emailResult = await EmailManager.sendPasswordReset(
      recipientEmail,
      {
        userName,
        resetCode: password, // Utiliser le mot de passe temporaire comme code
        resetLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login`,
        expirationTime: '30 minutes'
      }
    );
    
    if (!emailResult.success) {
      console.error('Échec de l\'envoi de l\'email avec mot de passe temporaire:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Impossible d\'envoyer l\'email avec le mot de passe temporaire',
        details: emailResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: isTestMode && email !== verifiedEmail
        ? 'Un mot de passe temporaire a été envoyé à l\'adresse de test (mode développement)'
        : 'Un mot de passe temporaire a été envoyé à votre adresse email',
      // En mode développement, inclure le mot de passe pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' ? { tempPassword: password } : {})
    });
  } catch (error) {
    console.error('Erreur lors de la génération du mot de passe temporaire:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 