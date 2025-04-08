import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { phoneNumber, amount, description, orderId, currency = 'XOF' } = req.body;

    // Validation des entrées
    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Informations de paiement incomplètes. Veuillez fournir le numéro de téléphone, le montant et l\'ID de commande.'
      });
    }

    // Générer une référence unique pour ce paiement
    const referenceId = `WV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // En production, vous intégreriez ici l'API Wave
    // Exemple fictif de l'appel à l'API Wave
    /* 
    const waveApiResponse = await fetch('https://api.wave.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        phone_number: phoneNumber,
        business_name: 'NionFar',
        client_reference: orderId,
        description,
        callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/wave/callback`
      })
    });
    
    const waveData = await waveApiResponse.json();
    
    if (!waveApiResponse.ok) {
      return res.status(waveApiResponse.status).json({
        success: false,
        message: waveData.message || 'Erreur lors de l\'initialisation du paiement Wave'
      });
    }
    
    const { checkout_session_id } = waveData;
    */

    // Pour le développement, simuler un paiement réussi après un délai
    // Stockez la référence dans votre base de données
    console.log(`[WAVE PAYMENT] Initialisation du paiement: ${referenceId} pour la commande ${orderId}`);

    // Enregistrer la transaction en attente dans la base de données
    // (simulation pour le développement)
    const pendingPayment = {
      provider: 'wave',
      orderId,
      amount,
      referenceId,
      phoneNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Enregistrer dans la base de données
    console.log('[WAVE PAYMENT] Paiement en attente enregistré:', pendingPayment);

    // Attendre quelques secondes pour simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retourner la référence pour le suivi ultérieur
    return res.status(200).json({
      success: true,
      referenceId,
      message: 'Paiement Wave initié. Veuillez confirmer la transaction sur votre téléphone.'
    });
  } catch (error) {
    console.error('[WAVE API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'initialisation du paiement.'
    });
  }
} 