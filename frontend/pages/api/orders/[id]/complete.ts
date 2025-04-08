import { NextApiRequest, NextApiResponse } from 'next';
import { getOrders, getWallets } from '../../payments/process-payment';

/**
 * Endpoint pour marquer une commande comme terminée et libérer les fonds au vendeur
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { id } = req.query;
    const { userId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande manquant'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'utilisateur manquant'
      });
    }

    // Récupérer toutes les commandes
    const allOrders = getOrders();
    
    // Trouver la commande spécifique
    const orderIndex = allOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }
    
    const order = allOrders[orderIndex];
    
    // Vérifier que l'utilisateur est autorisé (client de la commande)
    if (order.clientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à compléter cette commande'
      });
    }
    
    // Vérifier que la commande est au statut 'livré'
    if (order.status !== 'livré') {
      return res.status(400).json({
        success: false,
        message: `Cette commande ne peut pas être marquée comme terminée (statut actuel: ${order.status})`
      });
    }
    
    // Récupérer le vendeur
    const providerId = order.providerId;
    const wallets = getWallets();
    const providerWallet = wallets.find(w => w.userId === providerId);
    
    if (!providerWallet) {
      return res.status(500).json({
        success: false,
        message: 'Impossible de trouver le portefeuille du vendeur'
      });
    }
    
    // Calculer le montant à transférer (doit être cohérent avec celui mis en attente)
    const transactionAmount = order.price - (order.serviceFee || 0);
    
    // Mettre à jour le portefeuille du vendeur
    providerWallet.balance.pending -= transactionAmount;
    providerWallet.balance.available += transactionAmount;
    
    // Ajouter une transaction pour marquer le transfert
    providerWallet.transactions.push({
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: 'payment',
      amount: transactionAmount,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Paiement validé pour la commande ${order.id}`,
      orderId: order.id
    });
    
    // Mettre à jour le statut de la commande
    allOrders[orderIndex] = {
      ...order,
      status: 'terminée',
      completionDate: new Date().toISOString()
    };
    
    return res.status(200).json({
      success: true,
      message: 'Commande terminée et paiement libéré au vendeur',
      order: allOrders[orderIndex]
    });
    
  } catch (error) {
    console.error('[COMPLETE ORDER API] Erreur:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la complétion de la commande.',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 