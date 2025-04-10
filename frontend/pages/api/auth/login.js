/**
 * Gestionnaire de login - version JavaScript
 * Ce fichier est une copie de login.ts converti en JavaScript 
 * pour assurer la compatibilité avec Next.js lors du déploiement
 */

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Méthode non autorisée' 
    });
  }

  try {
    // En production, nous allons rediriger cette requête vers le backend réel
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar.up.railway.app/api';
    const apiEndpoint = `${apiUrl}/auth/login`;
    
    console.log(`[API JS] Redirection vers le backend: ${apiEndpoint}`);
    
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
          const errorText = await response.text();
          return res.status(response.status).json({
            success: false,
            error: `Erreur ${response.status}: ${response.statusText}`,
            details: { 
              general: 'Réponse invalide du serveur',
              text: errorText.substring(0, 200)
            }
          });
        }
      }
    } catch (fetchError) {
      console.error("[API JS Proxy] Erreur lors de la connexion au backend:", fetchError);
      
      // Réessayer avec une configuration alternative si disponible
      if (process.env.NEXT_PUBLIC_API_URL_FALLBACK) {
        try {
          console.log("[API JS Proxy] Tentative avec l'URL de secours");
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
          console.error("[API JS Proxy] Échec de la tentative avec l'URL de secours:", fallbackError);
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
  } catch (error) {
    console.error('Erreur générale de login:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur interne est survenue',
      details: { general: 'Une erreur inattendue est survenue lors du traitement de votre demande.' }
    });
  }
}

export default handler; 