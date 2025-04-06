import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { referenceId } = req.body;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'ID de référence manquant'
      });
    }

    // En production, vous feriez une requête à l'API Wave pour vérifier le statut
    /* 
    const statusResponse = await fetch(`https://api.wave.com/v1/checkout/${referenceId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
      }
    });
    
    const statusData = await statusResponse.json();
    
    if (!statusResponse.ok) {
      return res.status(statusResponse.status).json({
        success: false,
        message: statusData.message || 'Erreur lors de la vérification du statut'
      });
    }
    
    const { status, paid_at, transaction_id } = statusData;
    */

    // Simulation de la vérification du statut pour le développement
    console.log(`[WAVE PAYMENT] Vérification du statut pour: ${referenceId}`);

    // Simuler un paiement aléatoire réussi ou en cours
    // Dans un environnement réel, vous récupéreriez le statut à partir de votre base de données
    // ou de l'API Wave
    const randomStatus = Math.random() > 0.3 ? 'success' : 'pending';
    const paymentStatus = {
      status: randomStatus,
      message: randomStatus === 'success' 
        ? 'Paiement confirmé' 
        : 'Paiement en attente de confirmation',
      transactionId: randomStatus === 'success' ? `TRX-${Date.now()}` : undefined,
      paidAt: randomStatus === 'success' ? new Date().toISOString() : undefined
    };

    // Retourner le statut
    return res.status(200).json({
      success: true,
      ...paymentStatus
    });
  } catch (error) {
    console.error('[WAVE STATUS API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la vérification du statut du paiement.'
    });
  }
} 