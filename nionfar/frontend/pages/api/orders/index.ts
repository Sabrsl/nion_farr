import { NextApiRequest, NextApiResponse } from 'next';
import { getOrders } from '../payments/process-payment';

// Endpoint pour récupérer les commandes de l'utilisateur
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { userId } = req.query;

    // Vérifier si l'utilisateur est autorisé
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur manquant'
      });
    }

    // Récupérer les commandes depuis notre "base de données" simulée
    const allOrders = getOrders();
    
    // Filtrer les commandes pour cet utilisateur spécifique (client ou prestataire)
    const userOrders = allOrders.filter(order => 
      order.clientId === userId || order.providerId === userId
    );

    return res.status(200).json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    console.error('[ORDERS API] Erreur:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des commandes.',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 