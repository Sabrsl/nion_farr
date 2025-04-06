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
    const referenceId = `OM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // En production, vous intégreriez ici l'API Orange Money
    // Exemple fictif de l'appel à l'API Orange Money
    /* 
    const orangeApiResponse = await fetch('https://api.orange.com/orange-money-webpay/senegal/v1/webpayment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ORANGE_MONEY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
        amount,
        currency_code: currency,
        order_id: orderId,
        customer_msisdn: phoneNumber,
        description,
        return_url: `${process.env.NEXT_PUBLIC_API_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/payment/cancel`,
        notif_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/orange-money/callback`
      })
    });
    
    const orangeData = await orangeApiResponse.json();
    
    if (!orangeApiResponse.ok) {
      return res.status(orangeApiResponse.status).json({
        success: false,
        message: orangeData.message || 'Erreur lors de l\'initialisation du paiement Orange Money'
      });
    }
    
    const { payment_url, payment_token } = orangeData;
    */

    // Pour le développement, simuler un paiement réussi après un délai
    // Stockez la référence dans votre base de données
    console.log(`[ORANGE MONEY PAYMENT] Initialisation du paiement: ${referenceId} pour la commande ${orderId}`);

    // Enregistrer la transaction en attente dans la base de données
    // (simulation pour le développement)
    const pendingPayment = {
      provider: 'orange_money',
      orderId,
      amount,
      referenceId,
      phoneNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Enregistrer dans la base de données
    console.log('[ORANGE MONEY PAYMENT] Paiement en attente enregistré:', pendingPayment);

    // Attendre quelques secondes pour simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retourner la référence pour le suivi ultérieur
    return res.status(200).json({
      success: true,
      referenceId,
      message: 'Paiement Orange Money initié. Veuillez confirmer la transaction sur votre téléphone.'
    });
  } catch (error) {
    console.error('[ORANGE MONEY API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'initialisation du paiement.'
    });
  }
} 