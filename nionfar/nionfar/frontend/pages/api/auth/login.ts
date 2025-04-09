import type { NextApiRequest, NextApiResponse } from 'next';
import { userStorage } from '../../../lib/auth/storage';
import { isValidEmail } from '../../../lib/auth/utils';

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
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis',
        details: { email: 'Veuillez entrer votre adresse email' }
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe requis',
        details: { password: 'Veuillez entrer votre mot de passe' }
      });
    }

    // Validation du format de l'email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide',
        details: { email: 'L\'adresse email fournie n\'est pas valide' }
      });
    }

    // Vérifier si l'utilisateur existe
    const user = userStorage.getByEmail(email);

    if (!user) {
      // Pour des raisons de sécurité, ne pas divulguer si l'email existe ou non
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
        details: { general: 'Email ou mot de passe incorrect' }
      });
    }

    // Vérifier si l'utilisateur est vérifié
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non vérifié',
        details: { 
          general: 'Votre compte n\'a pas encore été vérifié. Veuillez vérifier votre email pour activer votre compte.'
        }
      });
    }

    // Vérifier le mot de passe (simulé - dans une vraie application, on utiliserait bcrypt.compare)
    const passwordMatches = user.password === `hashed_${password}`;

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
        details: { general: 'Email ou mot de passe incorrect' }
      });
    }

    // Générer un token JWT (simulé)
    const token = `jwt_${user.id}_${Date.now()}`;

    // Mettre à jour la dernière connexion
    userStorage.update(user.id, {
      ...user,
      lastLoginAt: new Date().toISOString()
    });

    // Répondre avec succès
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la connexion',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 