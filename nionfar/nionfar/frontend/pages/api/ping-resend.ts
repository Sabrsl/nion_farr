import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Afficher la clé API (masquée partiellement)
    const apiKey = process.env.RESEND_API_KEY || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q';
    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
    
    console.log('Test de connexion Resend avec clé API:', maskedKey);
    
    // Initialiser Resend
    const resend = new Resend(apiKey);
    
    // Tester un envoi simple
    try {
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['delivered@resend.dev'], // Adresse de test fournie par Resend
        subject: 'Test Ping',
        html: '<p>Test de connexion Resend</p>',
      });
      
      console.log('Résultat du test Resend:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Connexion Resend réussie',
        result,
        apiKeyUsed: maskedKey,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    } catch (sendError: any) {
      console.error('Erreur lors du test d\'envoi:', sendError);
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du test d\'envoi email',
        error: sendError.message,
        errorDetails: sendError,
        apiKeyUsed: maskedKey,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('Erreur lors du test de connexion Resend:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion Resend',
      error: error.message,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
} 