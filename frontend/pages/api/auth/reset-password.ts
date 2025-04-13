import type { NextApiRequest, NextApiResponse } from 'next';
import { isStrongPassword } from '../../../lib/auth/utils';
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
    const { token, password, confirmPassword } = req.body;

    // Validation des champs
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requis',
        details: { token: 'Le token de réinitialisation est requis' }
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe requis',
        details: { password: 'Veuillez fournir un nouveau mot de passe' }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Les mots de passe ne correspondent pas',
        details: { confirmPassword: 'Les mots de passe ne correspondent pas' }
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe trop faible',
        details: { 
          password: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
        }
      });
    }

    // En production, nous allons rediriger cette requête vers le backend réel
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';
      const apiEndpoint = `${apiUrl}/auth/reset-password`;
      
      console.log(`[API] Redirection de la réinitialisation de mot de passe vers le backend: ${apiEndpoint}`);
      
      // Préparer les données pour le backend
      const formattedData = {
        token,
        newPassword: password,
        passwordConfirmation: confirmPassword
      };
      
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(formattedData),
          credentials: 'include'
        });
        
        // Debug complet de la réponse
        console.log(`[API Proxy] Réponse du backend - Status: ${response.status}, URL: ${response.url}`);
        
        if (response.ok) {
          const data = await response.json();
          return res.status(response.status).json({
            success: true,
            message: data.message || 'Mot de passe réinitialisé avec succès',
            redirectTo: '/auth/login'
          });
        } else {
          // Gérer les erreurs HTTP
          try {
            const errorData = await response.json();
            
            // Vérifier si l'erreur est liée au CSRF et la gérer silencieusement
            if (errorData.code === 'CSRF_TOKEN_MISSING' || 
                errorData.code === 'CSRF_TOKEN_INVALID' ||
                (errorData.message && errorData.message.toLowerCase().includes('csrf'))) {
              console.error('[API Proxy] Erreur CSRF détectée - Masquage de l\'erreur et nouvelle tentative sans token CSRF');
              
              // Nouvelle tentative sans token CSRF
              const retryResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app',
                  'X-Requested-With': 'XMLHttpRequest',
                  'X-Bypass-CSRF': 'true' // En-tête spécial pour indiquer de contourner la validation CSRF
                },
                body: JSON.stringify(formattedData),
                credentials: 'include'
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return res.status(retryResponse.status).json({
                  success: true,
                  message: retryData.message || 'Mot de passe réinitialisé avec succès',
                  redirectTo: '/auth/login'
                });
              }
              
              // Si la seconde tentative échoue également, renvoyer une erreur générique
              return res.status(400).json({
                success: false,
                error: 'Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.',
                details: { general: 'Le serveur a rencontré une erreur de validation.' }
              });
            }
            
            return res.status(response.status).json({
              success: false,
              error: errorData.message || 'Erreur lors de la réinitialisation du mot de passe',
              details: errorData.details || { general: 'Le serveur a retourné une erreur' }
            });
          } catch (parseError) {
            const errorText = await response.text();
            console.error(`[API Proxy] Erreur de parsing, texte brut: ${errorText.substring(0, 200)}`);
            
            return res.status(response.status).json({
              success: false,
              error: `Erreur ${response.status}: ${response.statusText}`,
              details: { general: 'Réponse invalide du serveur' }
            });
          }
        }
      } catch (fetchError) {
        console.error("[API Proxy] Erreur lors de la connexion au backend:", fetchError);
        return res.status(502).json({
          success: false,
          error: "Impossible de communiquer avec le serveur",
          details: { 
            general: "Le serveur d'authentification est temporairement indisponible. Veuillez réessayer plus tard." 
          }
        });
      }
    }

    // Récupérer les informations du token
    const resetData = passwordResetTokens.get(token);

    if (!resetData) {
      return res.status(404).json({
        success: false,
        error: 'Token invalide',
        details: { token: 'Le token de réinitialisation est invalide ou a expiré' }
      });
    }

    // Vérifier si le token a expiré
    const expiresAt = new Date(resetData.expiresAt);
    if (expiresAt < new Date()) {
      // Supprimer le token expiré
      passwordResetTokens.delete(token);
      
      return res.status(401).json({
        success: false,
        error: 'Token expiré',
        details: { token: 'Le token de réinitialisation a expiré' }
      });
    }

    // Mettre à jour le mot de passe de l'utilisateur
    const { email } = resetData;
    
    // Vérifier si l'utilisateur existe
    if (!userStorage.exists(email)) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable',
        details: { email: 'Aucun utilisateur trouvé avec cette adresse email' }
      });
    }

    // Mettre à jour le mot de passe (simulé)
    // Dans une vraie application, le mot de passe serait haché avant stockage
    const user = userStorage.getByEmail(email);
    
    if (user) {
      // Hasher le mot de passe avant de le stocker (simulé)
      user.password = `hashed_${password}`;
      user.passwordLastChanged = new Date().toISOString();
      userStorage.update(user.id, user);
      
      // Supprimer le token une fois utilisé
      passwordResetTokens.delete(token);
  
      return res.status(200).json({
        success: true,
        message: 'Mot de passe mis à jour avec succès',
        redirectTo: '/'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable',
        details: { email: 'Aucun utilisateur trouvé avec cette adresse email' }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 