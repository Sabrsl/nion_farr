import { NextApiRequest, NextApiResponse } from 'next';
import { getWallets } from '../payments/process-payment';

// Base de données simulée pour les demandes de retrait
let withdrawalsDB: any[] = [];

/**
 * Endpoint pour gérer les demandes de retrait
 * GET: Liste les demandes de retrait d'un utilisateur
 * POST: Crée une nouvelle demande de retrait
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Récupérer les demandes de retrait d'un utilisateur
  if (req.method === 'GET') {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur manquant' 
      });
    }
    
    // Filtrer par utilisateur
    const userWithdrawals = withdrawalsDB.filter(w => w.userId === userId);
    
    return res.status(200).json({
      success: true,
      withdrawals: userWithdrawals
    });
  }
  
  // Créer une nouvelle demande de retrait
  if (req.method === 'POST') {
    try {
      const { 
        userId, 
        amount, 
        method, 
        accountDetails 
      } = req.body;
      
      // Validation des entrées
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID utilisateur manquant'
        });
      }
      
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Montant invalide'
        });
      }
      
      if (!method) {
        return res.status(400).json({
          success: false,
          message: 'Méthode de retrait manquante'
        });
      }
      
      if (!accountDetails || !accountDetails.type || !accountDetails.number) {
        return res.status(400).json({
          success: false,
          message: 'Détails du compte de retrait incomplets'
        });
      }
      
      // Vérifier le montant minimum de retrait (2000 FCFA)
      const withdrawalAmount = Number(amount);
      const minWithdrawalAmount = 2000;
      
      if (withdrawalAmount < minWithdrawalAmount) {
        return res.status(400).json({
          success: false,
          message: `Le montant minimum de retrait est de ${minWithdrawalAmount} FCFA`
        });
      }
      
      // Vérifier que l'utilisateur a suffisamment de fonds disponibles
      const wallets = getWallets();
      const userWallet = wallets.find(w => w.userId === userId);
      
      if (!userWallet) {
        return res.status(404).json({
          success: false,
          message: 'Portefeuille non trouvé'
        });
      }
      
      if (userWallet.balance.available < withdrawalAmount) {
        return res.status(400).json({
          success: false,
          message: `Solde disponible insuffisant. Vous avez ${userWallet.balance.available} FCFA disponible(s).`
        });
      }
      
      // Créer un ID unique pour la demande de retrait
      const withdrawalId = `WD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Créer la demande de retrait
      const withdrawal = {
        id: withdrawalId,
        userId,
        amount: withdrawalAmount,
        method,
        accountDetails,
        status: 'en_attente',
        createdAt: new Date().toISOString()
      };
      
      // Mettre à jour le portefeuille de l'utilisateur (réduire le montant disponible)
      userWallet.balance.available -= withdrawalAmount;
      userWallet.balance.pending += withdrawalAmount; // Mettre en attente pendant la validation
      
      // Ajouter une transaction pour marquer la demande de retrait
      userWallet.transactions.push({
        id: `TRX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'payout',
        amount: -withdrawalAmount, // Montant négatif car c'est un retrait
        date: new Date().toISOString(),
        status: 'pending',
        description: `Demande de retrait #${withdrawalId}`
      });
      
      // Sauvegarder la demande de retrait
      withdrawalsDB.push(withdrawal);
      
      console.log(`[WITHDRAWAL] Nouvelle demande de retrait: ${withdrawalId} pour ${userId} (${withdrawalAmount} FCFA)`);
      
      return res.status(201).json({
        success: true,
        message: 'Demande de retrait créée avec succès',
        withdrawal
      });
    } catch (error) {
      console.error('[WITHDRAWAL API] Erreur:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la création de la demande de retrait',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
  
  // Méthode non autorisée
  return res.status(405).json({ 
    success: false, 
    message: 'Méthode non autorisée' 
  });
}

// Fonction pour obtenir les demandes de retrait (pour le développement)
export const getWithdrawals = () => {
  return withdrawalsDB;
}; 