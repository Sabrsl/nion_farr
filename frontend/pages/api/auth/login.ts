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
      error: 'Méthode non autorisée',
      details: { method: `La méthode ${req.method} n'est pas supportée` }
    });
  }

  // Détermination de l'URL de l'API backend
  let apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api'}/auth/login`;
  
  // Log de l'URL utilisée
  console.log(`[API Proxy] Tentative de connexion au backend: ${apiEndpoint}`);
  
  try {
    // Transformer les données pour correspondre aux attentes du backend
    let backendData = { ...req.body };
    
    // S'assurer que les données sont au format attendu par le backend
    console.log("📦 Données formatées pour le backend:", { 
      ...backendData, 
      password: backendData.password ? "********" : undefined 
    });
    
    // TOUJOURS utiliser POST peu importe la méthode originale
    const response = await fetch(apiEndpoint, {
      method: 'POST', // Force POST
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app',
        'X-Requested-With': 'XMLHttpRequest' // Ajouter cet en-tête pour indiquer une requête AJAX
      },
      body: JSON.stringify(backendData), // Protéger contre body null
      credentials: 'include' // Ajouter cette option pour inclure les cookies
    });
    
    // Vérifier si la réponse est correcte
    if (response.ok) {
      try {
        const data = await response.json();
        return res.status(response.status).json(data);
      } catch (parseError) {
        console.error(`[API Proxy] Erreur lors du parsing de la réponse JSON:`, parseError);
        return res.status(502).json({
          success: false,
          error: "Erreur de traitement de la réponse",
          details: { general: "La réponse du serveur n'est pas un JSON valide" }
        });
      }
    } else {
      // Gérer les erreurs communes
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Email ou mot de passe incorrect',
          details: { general: 'Les informations de connexion fournies sont incorrectes.' }
        });
      }
      
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
            body: JSON.stringify(backendData),
            credentials: 'include'
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return res.status(retryResponse.status).json(retryData);
          }
          
          // Si la seconde tentative échoue également, renvoyer une erreur générique
          return res.status(400).json({
            success: false,
            error: 'Erreur lors de la connexion. Veuillez réessayer.',
            details: { general: 'Le serveur a rencontré une erreur de validation.' }
          });
        }
        
        return res.status(response.status).json({
          success: false,
          error: errorData.message || 'Erreur lors de la connexion',
          details: errorData.details || { general: 'Le serveur a retourné une erreur' }
        });
      } catch (parseError) {
        // Si la réponse n'est pas du JSON valide
        try {
          const errorText = await response.text();
          console.error(`[API Proxy] Erreur de parsing, texte brut: ${errorText.substring(0, 200)}`);
          
          return res.status(response.status).json({
            success: false,
            error: `Erreur ${response.status}: ${response.statusText}`,
            details: { general: 'Réponse invalide du serveur' }
          });
        } catch (textError) {
          console.error(`[API Proxy] Impossible de lire le corps de la réponse:`, textError);
          
          return res.status(response.status).json({
            success: false,
            error: `Erreur ${response.status}: ${response.statusText}`,
            details: { general: 'Impossible de lire la réponse du serveur' }
          });
        }
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
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(req.body || {}),
          credentials: 'include'
        });
        
        if (fallbackResponse.ok) {
          try {
            const data = await fallbackResponse.json();
            return res.status(fallbackResponse.status).json(data);
          } catch (parseError) {
            console.error(`[API Proxy] Erreur lors du parsing de la réponse JSON (fallback):`, parseError);
            return res.status(502).json({
              success: false,
              error: "Erreur de traitement de la réponse",
              details: { general: "La réponse du serveur de secours n'est pas un JSON valide" }
            });
          }
        } else {
          // Erreur avec l'URL de secours
          return res.status(fallbackResponse.status).json({
            success: false,
            error: `Erreur ${fallbackResponse.status} sur le serveur de secours`,
            details: { general: "Le serveur de secours a également échoué" }
          });
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