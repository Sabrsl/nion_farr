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
    // En production, nous allons rediriger cette requête vers le backend réel
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';
      const apiEndpoint = `${apiUrl}/auth/register`;
      
      console.log(`[API] Redirection de l'inscription vers le backend: ${apiEndpoint}`);
      
      // Formater les données pour correspondre au schéma attendu par le backend
      let formattedData = req.body;
      
      // S'assurer que les champs requis sont présents et correctement formatés
      if (req.body) {
        formattedData = {
          email: req.body.email,
          firstName: req.body.firstName || (req.body.fullName ? req.body.fullName.split(' ')[0] : ''),
          lastName: req.body.lastName || (req.body.fullName ? req.body.fullName.split(' ').slice(1).join(' ') : ''),
          password: req.body.password,
          passwordConfirm: req.body.passwordConfirm || req.body.password, // Assurer que passwordConfirm est présent
          termsAccepted: req.body.termsAccepted || req.body.acceptTerms || true,
          role: (req.body.role || 'CLIENT').toUpperCase(),
          isFreelancer: req.body.role?.toLowerCase() === 'freelance' || req.body.isFreelancer || false
        };
      }
      
      console.log(`[API] Données formatées envoyées au backend:`, 
        { ...formattedData, password: '***', passwordConfirm: '***' });
      
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
        
        // Vérifier si la réponse est correcte
        if (response.ok) {
          const data = await response.json();
          console.log(`[API Proxy] Inscription réussie:`, data);
          
          // Ajouter des en-têtes personnalisés pour éviter la mise en cache et forcer la redirection côté client
          res.setHeader('X-Registration-Success', 'true');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          
          // Inclure une suggestion de redirection au client
          const responseWithRedirect = {
            ...data,
            redirectTo: '/',
            _redirectAfterAuth: true
          };
          
          return res.status(response.status).json(responseWithRedirect);
        } else {
          // Gérer les erreurs HTTP
          try {
            const errorData = await response.json();
            console.error(`[API Proxy] Échec d'inscription (${response.status}):`, errorData);
            return res.status(response.status).json({
              success: false,
              error: errorData.message || 'Erreur lors de l\'inscription',
              details: errorData.details || { general: 'Le serveur a retourné une erreur' }
            });
          } catch (parseError) {
            // Si la réponse n'est pas du JSON valide
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
        console.error("[API Proxy] Erreur lors de la connexion au backend pour l'inscription:", fetchError);
        
        // Réessayer avec une configuration alternative si disponible
        if (process.env.NEXT_PUBLIC_API_URL_FALLBACK) {
          try {
            console.log("[API Proxy] Tentative avec l'URL de secours pour l'inscription");
            const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL_FALLBACK}/auth/register`;
            
            const fallbackResponse = await fetch(fallbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify(formattedData),
              credentials: 'include'
            });
            
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              return res.status(fallbackResponse.status).json(data);
            }
          } catch (fallbackError) {
            console.error("[API Proxy] Échec de la tentative avec l'URL de secours pour l'inscription:", fallbackError);
          }
        }
        
        // Si aucune URL de secours ou si celle-ci a également échoué
        return res.status(502).json({
          success: false,
          error: "Impossible de se connecter au serveur d'inscription",
          details: { 
            general: "Le serveur d'inscription est temporairement indisponible. Veuillez réessayer plus tard." 
          }
        });
      }
    }

    // Extraire les données du corps de la requête
    const { email, firstName, lastName, password, role = 'CLIENT' } = req.body;

    // Valider les champs requis
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis',
        details: { email: 'Veuillez fournir une adresse email valide' }
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe requis',
        details: { password: 'Veuillez fournir un mot de passe' }
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Nom requis',
        details: { firstName: 'Veuillez fournir votre prénom et nom' }
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
    
    // Tentative d'opérations sur le stockage en mode développement uniquement
    const IS_DEV = process.env.NODE_ENV === 'development';
    const IS_SERVERLESS = Boolean(
      process.env.VERCEL || 
      process.env.RENDER || 
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'development')
    );

    console.log(`[API Registration] Environnement: ${IS_DEV ? 'development' : 'production'}, Serverless: ${IS_SERVERLESS ? 'oui' : 'non'}`);

    // Vérifier si l'utilisateur existe déjà
    let userExists = false;
    try {
      if (IS_DEV && !IS_SERVERLESS) {
        userExists = userStorage.exists(email);
      }
    } catch (storageError) {
      console.error('Erreur d\'accès au stockage lors de la vérification d\'email:', storageError);
      // Continuer sans bloquer
    }

    if (userExists) {
      // Pour des raisons de sécurité, ne pas révéler que l'email existe
      return res.status(200).json({
        success: true,
        message: 'Si ce compte n\'existe pas déjà, un code de vérification a été envoyé à cette adresse'
      });
    }

    // Vérifier si un code existe déjà pour cet email (éviter le spam)
    let existingCode;
    try {
      if (IS_DEV && !IS_SERVERLESS) {
        existingCode = verificationCodes.get(email);
      }
    } catch (codeError) {
      console.error('Erreur lors de la récupération du code de vérification:', codeError);
      // Continuer sans bloquer
    }

    if (existingCode) {
      // Si un code existe déjà, ne pas en créer un nouveau tout de suite
      // Dans une application réelle, on pourrait limiter le nombre de demandes
      const lastRequest = new Date(existingCode.expiresAt);
      lastRequest.setTime(lastRequest.getTime() - 24 * 60 * 60 * 1000); // Expiration - 24h
      const timeSinceLastRequest = Date.now() - lastRequest.getTime();
      
      // Si la dernière demande date de moins de 5 minutes, refuser
      if (timeSinceLastRequest < 5 * 60 * 1000) {
        return res.status(429).json({
          success: false,
          error: 'Trop de demandes',
          details: {
            message: 'Veuillez attendre 5 minutes avant de demander un nouveau code',
            retryAfter: Math.ceil((5 * 60 * 1000 - timeSinceLastRequest) / 1000)
          }
        });
      }
    }

    // Générer un code de vérification
    const verificationCode = generateVerificationCode();
    
    // Date d'expiration (24 heures)
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Stocker le code de vérification
    try {
      if (IS_DEV && !IS_SERVERLESS) {
        verificationCodes.set(email, {
          email,
          code: verificationCode,
          expiresAt: expirationDate.toISOString()
        });
      }
    } catch (setCodeError) {
      console.error('Erreur lors du stockage du code de vérification:', setCodeError);
      // Continuer sans bloquer car l'email contiendra le code
    }

    // En mode développement, on peut auto-créer un utilisateur pour faciliter les tests
    if (IS_DEV && !IS_SERVERLESS) {
      try {
        // Créer un nouvel utilisateur avec un ID unique
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        userStorage.create({
          id: userId,
          email,
          name: `${firstName} ${lastName}`,
          role: role as 'client' | 'freelancer' | 'admin',
          password: `hashed_${password}`, // En production, ce serait hashé avec bcrypt
          isVerified: process.env.AUTO_VERIFY === 'true',
          createdAt: new Date().toISOString()
        });
      } catch (createUserError) {
        console.error('Erreur lors de la création de l\'utilisateur:', createUserError);
        // Continuer sans bloquer car l'utilisateur pourra vérifier son email et finaliser l'inscription
      }
    }

    let emailSent = false;
    let emailError = null;

    try {
      // Initialiser EmailManager pour l'envoi d'email
      EmailManager.initialize();

      // Vérifier le mode test de Resend
      const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
      const verifiedEmail = process.env.VERIFIED_EMAIL || 'badzagueye@gmail.com'; // Email vérifié pour les tests
      
      // En mode test, envoyer l'email à l'adresse vérifiée uniquement
      const recipientEmail = isTestMode ? verifiedEmail : email;

      // Préparer le lien de vérification
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/auth/verify?email=${encodeURIComponent(email)}&code=${verificationCode}`;

      // Envoyer l'email de vérification
      const emailResult = await EmailManager.sendAccountVerification(
        recipientEmail,
        {
          userName: `${firstName} ${lastName}`,
          verificationCode: verificationCode,
          verificationLink: verificationLink,
          expirationTime: '24 heures'
        }
      );

      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
        console.error('Échec de l\'envoi de l\'email de vérification:', emailResult.error);
      }
    } catch (emailException) {
      console.error('Exception lors de l\'envoi de l\'email:', emailException);
      emailError = emailException instanceof Error ? emailException.message : 'Erreur inconnue';
    }

    // Répondre avec succès, même si l'email n'a pas pu être envoyé
    // En mode développement, on retourne toujours le code pour faciliter les tests
    return res.status(200).json({
      success: true,
      message: emailSent 
        ? (process.env.NODE_ENV === 'development' && email !== process.env.VERIFIED_EMAIL
          ? 'Code de vérification envoyé à l\'adresse de test (mode développement)'
          : 'Code de vérification envoyé à votre adresse email')
        : 'Inscription enregistrée, mais problème d\'envoi d\'email. Veuillez contacter le support.',
      email: email,
      expiresAt: expirationDate,
      emailSent,
      ...(emailError && process.env.NODE_ENV === 'development' ? { emailError } : {}),
      // En mode développement, inclure le code de vérification pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' ? { verificationCode } : {})
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'enregistrement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 