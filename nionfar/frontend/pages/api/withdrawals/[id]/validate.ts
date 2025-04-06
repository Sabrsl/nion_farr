import { NextApiRequest, NextApiResponse } from 'next';
import { getWallets } from '../../payments/process-payment';
import { getWithdrawals } from '../index';

/**
 * Endpoint pour valider une demande de retrait
 * Cette API est exclusivement réservée aux administrateurs
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { id } = req.query;
    const { adminId, transactionDetails } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de retrait manquant'
      });
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'administrateur manquant'
      });
    }

    if (!transactionDetails || !transactionDetails.reference) {
      return res.status(400).json({
        success: false,
        message: 'Détails de la transaction manquants'
      });
    }

    // Vérifier si l'utilisateur est un administrateur
    // Dans une application réelle, utilisez votre système d'authentification
    // Ex: const isAdmin = await authService.verifyAdminAccess(adminId);
    const isAdmin = true; // Simulé pour le développement

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux administrateurs.'
      });
    }

    // Récupérer toutes les demandes de retrait
    const withdrawals = getWithdrawals();
    
    // Trouver la demande de retrait spécifique
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    
    if (withdrawalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Demande de retrait non trouvée'
      });
    }
    
    const withdrawal = withdrawals[withdrawalIndex];
    
    // Vérifier que le retrait est en attente
    if (withdrawal.status !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Cette demande de retrait ne peut pas être validée (statut actuel: ${withdrawal.status})`
      });
    }
    
    // Récupérer le portefeuille de l'utilisateur
    const wallets = getWallets();
    const userWallet = wallets.find(w => w.userId === withdrawal.userId);
    
    if (!userWallet) {
      return res.status(404).json({
        success: false,
        message: 'Portefeuille de l\'utilisateur non trouvé'
      });
    }
    
    // Mettre à jour le portefeuille (supprimer des fonds en attente)
    userWallet.balance.pending -= withdrawal.amount;
    userWallet.balance.total -= withdrawal.amount;
    
    // Ajouter une transaction pour marquer le paiement du retrait
    userWallet.transactions.push({
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: 'payout',
      amount: -withdrawal.amount, // Montant négatif car c'est un retrait
      date: new Date().toISOString(),
      status: 'completed',
      description: `Retrait #${withdrawal.id} validé - ${transactionDetails.reference}`
    });
    
    // Mettre à jour le statut de la demande de retrait
    withdrawals[withdrawalIndex] = {
      ...withdrawal,
      status: 'validé',
      processedAt: new Date().toISOString(),
      processedBy: adminId,
      transactionDetails: {
        ...transactionDetails,
        processedAt: new Date().toISOString()
      }
    };
    
    console.log(`[WITHDRAWAL] Retrait validé: ${withdrawal.id} (${withdrawal.amount} FCFA) par ${adminId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Demande de retrait validée avec succès',
      withdrawal: withdrawals[withdrawalIndex]
    });
    
  } catch (error) {
    console.error('[WITHDRAWAL VALIDATION API] Erreur:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la validation du retrait',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 