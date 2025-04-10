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
    // En production, nous allons rediriger cette requête vers le backend réel
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar.up.railway.app/api';
      const apiEndpoint = `${apiUrl}/auth/login`;
      
      console.log(`[API] Redirection vers le backend: ${apiEndpoint}`);
      
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app'
          },
          body: JSON.stringify(req.body)
        });
        
        // Vérifier si la réponse est correcte
        if (response.ok) {
          const data = await response.json();
          return res.status(response.status).json(data);
        } else {
          // Gérer les erreurs HTTP
          try {
            const errorData = await response.json();
            return res.status(response.status).json({
              success: false,
              error: errorData.message || 'Erreur lors de la connexion',
              details: errorData.details || { general: 'Le serveur a retourné une erreur' }
            });
          } catch (parseError) {
            // Si la réponse n'est pas du JSON valide
            return res.status(response.status).json({
              success: false,
              error: `Erreur ${response.status}: ${response.statusText}`,
              details: { general: 'Réponse invalide du serveur' }
            });
          }
        }
      } catch (fetchError) {
        console.error("[API Proxy] Erreur lors de la connexion au backend:", fetchError);
        
        // Réessayer avec une configuration alternative si disponible
        if (process.env.NEXT_PUBLIC_API_URL_FALLBACK) {
          try {
            console.log("[API Proxy] Tentative avec l'URL de secours");
            const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL_FALLBACK}/auth/login`;
            
            const fallbackResponse = await fetch(fallbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(req.body)
            });
            
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              return res.status(fallbackResponse.status).json(data);
            }
          } catch (fallbackError) {
            console.error("[API Proxy] Échec de la tentative avec l'URL de secours:", fallbackError);
          }
        }
        
        // Si aucune URL de secours ou si celle-ci a également échoué
        return res.status(502).json({
          success: false,
          error: "Impossible de se connecter au serveur d'authentification",
          details: { 
            general: "Le serveur d'authentification est temporairement indisponible. Veuillez réessayer plus tard." 
          }
        });
      }
    }

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
    let user;
    try {
      user = userStorage.getByEmail(email);
    } catch (storageError) {
      console.error('Erreur d\'accès au stockage:', storageError);
      // En cas d'erreur de stockage, créer un utilisateur temporaire pour le développement
      if (process.env.NODE_ENV === 'development' && email === 'test@example.com' && password === 'password123') {
        user = {
          id: 'dev-user-123',
          email: 'test@example.com',
          name: 'Utilisateur Test',
          role: 'client', 
          password: 'hashed_password123',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
      } else {
        // En production, ne pas révéler l'erreur
        return res.status(401).json({
          success: false,
          error: 'Identifiants invalides',
          details: { general: 'Email ou mot de passe incorrect' }
        });
      }
    }

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
    try {
      userStorage.update(user.id, {
        ...user,
        lastLoginAt: new Date().toISOString()
      });
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', updateError);
      // Continuer sans bloquer le login
    }

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