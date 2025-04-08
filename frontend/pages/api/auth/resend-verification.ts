import type { NextApiRequest, NextApiResponse } from 'next';
import { generateVerificationCode, isValidEmail } from '../../../lib/auth/utils';
import { EmailManager } from '../../../lib/emails/emailManager';
import { verificationCodes, userStorage } from '../../../lib/auth/storage';

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

    // Valider les champs requis
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis',
        details: { email: 'Veuillez fournir une adresse email valide' }
      });
    }

    // Valider le format de l'email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide',
        details: { email: 'L\'adresse email fournie n\'est pas valide' }
      });
    }
    
    // Vérifier si l'utilisateur existe déjà et est vérifié
    const existingUser = userStorage.getByEmail(email);
    if (existingUser && existingUser.isVerified) {
      // Si l'utilisateur est déjà vérifié, ne pas générer de nouveau code
      return res.status(200).json({
        success: true,
        message: 'Le compte associé à cette adresse email est déjà vérifié. Vous pouvez vous connecter directement.'
      });
    }

    // Vérifier si un code existe déjà pour cet email (anti-spam)
    if (verificationCodes.has(email)) {
      // Si un code existe déjà, vérifier s'il est récent
      const lastRequest = new Date(verificationCodes.get(email)!.expiresAt);
      lastRequest.setTime(lastRequest.getTime() - 24 * 60 * 60 * 1000); // Expiration - 24h
      const timeSinceLastRequest = Date.now() - lastRequest.getTime();
      
      // Si la dernière demande date de moins de 2 minutes, limiter les renvois
      if (timeSinceLastRequest < 2 * 60 * 1000) {
        return res.status(429).json({
          success: false,
          error: 'Trop de demandes',
          details: {
            message: 'Veuillez attendre 2 minutes avant de demander un nouveau code',
            retryAfter: Math.ceil((2 * 60 * 1000 - timeSinceLastRequest) / 1000)
          }
        });
      }
    }

    // Générer un nouveau code de vérification
    const verificationCode = generateVerificationCode();
    
    // Date d'expiration (24 heures)
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Stocker le code de vérification
    verificationCodes.set(email, {
      email,
      code: verificationCode,
      expiresAt: expirationDate.toISOString()
    });

    // Initialiser EmailManager pour l'envoi d'email
    EmailManager.initialize();

    // Vérifier le mode test de Resend
    const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
    const verifiedEmail = 'badzagueye@gmail.com'; // Email vérifié pour les tests
    
    // En mode test, envoyer l'email à l'adresse vérifiée uniquement
    const recipientEmail = isTestMode ? verifiedEmail : email;

    // Préparer le lien de vérification
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    // Envoyer l'email de vérification
    const emailResult = await EmailManager.sendAccountVerification(
      recipientEmail,
      {
        userName: email.split('@')[0],
        verificationCode: verificationCode,
        verificationLink: verificationLink,
        expirationTime: '24 heures'
      }
    );

    if (!emailResult.success) {
      console.error('Échec de l\'envoi de l\'email de vérification:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Impossible d\'envoyer l\'email de vérification',
        details: emailResult.error
      });
    }

    // Répondre avec succès
    return res.status(200).json({
      success: true,
      message: isTestMode && email !== verifiedEmail 
        ? 'Code de vérification envoyé à l\'adresse de test (mode développement)'
        : 'Un nouveau code de vérification a été envoyé à votre adresse email',
      email: email,
      expiresAt: expirationDate,
      // En mode développement, inclure le code de vérification pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' ? { verificationCode } : {})
    });
  } catch (error) {
    console.error('Erreur lors du renvoi du code de vérification:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 