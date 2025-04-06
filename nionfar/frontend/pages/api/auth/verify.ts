import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailManager } from '../../../lib/emails/emailManager';
import { verificationCodes, userStorage } from '../../../lib/auth/storage';
import { generateRandomToken } from '../../../lib/auth/utils';

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
    // Vérifier les paramètres requis
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email et code de vérification requis',
        details: {
          email: !email ? 'Email manquant' : null,
          code: !code ? 'Code de vérification manquant' : null
        }
      });
    }

    // Récupérer les données de vérification
    const verificationData = verificationCodes.get(email);

    // Vérifier si une demande de vérification existe pour cet email
    if (!verificationData) {
      return res.status(404).json({
        success: false,
        error: 'Aucune demande de vérification trouvée pour cet email',
        action: 'register'
      });
    }

    // Vérifier si le code a expiré
    const expiresAt = new Date(verificationData.expiresAt);
    if (new Date() > expiresAt) {
      // Supprimer le code expiré
      verificationCodes.delete(email);
      
      return res.status(401).json({
        success: false,
        error: 'Le code de vérification a expiré',
        action: 'resend'
      });
    }

    // Vérifier si le code est correct
    if (verificationData.code !== code) {
      return res.status(401).json({
        success: false,
        error: 'Code de vérification incorrect',
        attemptsLeft: 3 // Simulation d'un compteur de tentatives
      });
    }

    // Générer un identifiant utilisateur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Créer l'utilisateur
    userStorage.create({
      id: userId,
      email,
      name: email.split('@')[0], // Nom par défaut basé sur l'email
      role: 'client', // Rôle par défaut
      password: '', // Sera défini lors du premier login
      isVerified: true,
      createdAt: new Date().toISOString()
    });

    // Supprimer le code de vérification après utilisation
    verificationCodes.delete(email);
    
    // Envoyer un email de bienvenue
    try {
      EmailManager.initialize();
      
      // Générer un token provisoire pour la première connexion
      const tempToken = generateRandomToken('welcome');
      
      // Vérifier le mode test de Resend
      const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
      const verifiedEmail = 'badzagueye@gmail.com'; // Email vérifié pour les tests
      
      // En mode test, envoyer l'email à l'adresse vérifiée uniquement
      const recipientEmail = isTestMode ? verifiedEmail : email;
      
      // Envoyer un email de bienvenue avec instructions pour définir le mot de passe
      await EmailManager.sendAccountVerification(
        recipientEmail,
        {
          userName: email.split('@')[0],
          verificationCode: '',
          verificationLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/welcome?token=${tempToken}`,
          expirationTime: ''
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      // Ne pas bloquer la création de compte si l'email échoue
    }

    // Retourner une réponse de succès avec redirection vers la page d'accueil
    return res.status(200).json({
      success: true,
      message: 'Compte vérifié avec succès',
      userId,
      // Normalement, on enverrait aussi un token d'authentification
      token: `simulated_jwt_token_${userId}`,
      redirectTo: '/'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du compte:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la vérification de votre compte',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 