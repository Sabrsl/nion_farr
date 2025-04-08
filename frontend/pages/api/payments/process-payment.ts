import { NextApiRequest, NextApiResponse } from 'next';
import { OrderStatus } from '../../../types';
import { emailSender } from '../../../lib/emails/emailSender';

// Taux de commission de la plateforme (5%)
const PLATFORM_FEE_RATE = 0.05;

// Fonction pour calculer le montant total
const calculateTotalAmount = (basePrice: number): { 
  basePrice: number; 
  serviceFee: number; 
  totalAmount: number;
} => {
  const baseAmount = Number(basePrice);
  // Calculer les frais de service (5%)
  const serviceFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
  // Calculer le montant total
  const totalAmount = baseAmount + serviceFee;
  
  return { 
    basePrice: baseAmount, 
    serviceFee, 
    totalAmount 
  };
};

// Générer un ID unique formaté pour une commande
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${randomSuffix}`;
};

// Générer un ID unique formaté pour une transaction
const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX-${timestamp}-${randomSuffix}`;
};

// Générer un statut aléatoire pour le mode test
const getRandomStatus = (): OrderStatus => {
  const statuses: OrderStatus[] = [
    'en_attente',
    'en_cours',
    'livré',
    'terminée',
  ];
  
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

// Simuler une base de données pour les commandes (pour le développement)
let ordersDB: any[] = [];

// Simuler une base de données de portefeuilles utilisateurs
let walletDB: {
  userId: string;
  balance: {
    available: number;   // Montant disponible pour retrait
    pending: number;     // Montant en attente de validation de commande
    locked: number;      // Montant bloqué (en cas de litige)
    total: number;       // Balance totale
  };
  transactions: {
    id: string;
    type: 'payment' | 'commission' | 'payout' | 'refund' | 'deposit';
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    orderId?: string;
  }[];
}[] = [];

// Créer le portefeuille d'un utilisateur s'il n'existe pas
const initializeWallet = (userId: string) => {
  const existingWallet = walletDB.find(w => w.userId === userId);
  
  if (!existingWallet) {
    walletDB.push({
      userId,
      balance: {
        available: 0,
        pending: 0,
        locked: 0,
        total: 0
      },
      transactions: []
    });
    console.log(`[WALLET] Portefeuille créé pour l'utilisateur ${userId}`);
  }
  
  return getWallet(userId);
};

// Récupérer le portefeuille d'un utilisateur
const getWallet = (userId: string) => {
  return walletDB.find(w => w.userId === userId);
};

// Ajouter des fonds en attente dans le portefeuille du vendeur
const addPendingFundsToSellerWallet = (
  sellerId: string, 
  amount: number, 
  serviceFee: number, 
  orderId: string
) => {
  const wallet = initializeWallet(sellerId);
  const sellerAmount = amount - serviceFee;
  
  // Vérifier que le wallet existe bien
  if (!wallet) {
    console.error(`[WALLET] Erreur: Impossible de trouver le portefeuille pour ${sellerId}`);
    return sellerAmount;
  }
  
  // Mettre à jour la balance
  wallet.balance.pending += sellerAmount;
  wallet.balance.total += sellerAmount;
  
  // Ajouter la transaction
  wallet.transactions.push({
    id: generateTransactionId(),
    type: 'payment',
    amount: sellerAmount,
    date: new Date().toISOString(),
    status: 'pending',
    description: `Paiement reçu pour la commande ${orderId} (en attente de validation)`,
    orderId
  });
  
  console.log(`[WALLET] ${sellerAmount} FCFA ajoutés au portefeuille de ${sellerId} (en attente)`);
  
  // Enregistrer la commission de la plateforme
  registerPlatformCommission(serviceFee, orderId);
  
  return sellerAmount;
};

// Enregistrer la commission de la plateforme
const registerPlatformCommission = (amount: number, orderId: string) => {
  // Dans une implémentation réelle, cette fonction enregistrerait
  // la commission dans un portefeuille spécial pour la plateforme
  console.log(`[PLATFORM] Commission de ${amount} FCFA enregistrée pour la commande ${orderId}`);
};

// Fonction pour envoyer les emails de confirmation
const sendConfirmationEmails = async (order: any, transaction: any) => {
  try {
    // Envoyer l'email de confirmation de commande au client
    const orderEmailSent = await emailSender.sendOrderCreatedEmail({
      orderId: order.id,
      orderNumber: order.id.substring(4, 10), // Format court pour l'affichage
      clientId: order.clientId,
      clientName: 'Client', // Dans une vraie implémentation, récupérer le nom réel
      clientEmail: 'client@example.com', // Dans une vraie implémentation, récupérer l'email réel
      serviceName: order.serviceName,
      servicePrice: order.price,
      serviceFee: order.serviceFee,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      sellerId: order.providerId,
      sellerName: order.providerName,
      estimatedDelivery: new Date(order.expectedDeliveryDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    });

    // Envoyer l'email de confirmation de paiement au client
    const paymentEmailSent = await emailSender.sendPaymentReceivedEmail({
      transactionId: transaction.id,
      orderId: order.id,
      orderNumber: order.id.substring(4, 10),
      clientId: order.clientId,
      clientName: 'Client', // Dans une vraie implémentation, récupérer le nom réel
      clientEmail: 'client@example.com', // Dans une vraie implémentation, récupérer l'email réel
      serviceName: order.serviceName,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentDate: new Date(),
    });

    console.log(`[EMAIL] Email de confirmation de commande envoyé: ${orderEmailSent}`);
    console.log(`[EMAIL] Email de confirmation de paiement envoyé: ${paymentEmailSent}`);
    
    return { orderEmailSent, paymentEmailSent };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi des emails de confirmation:', error);
    return { orderEmailSent: false, paymentEmailSent: false };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    // Vérification de l'authentification
    // Normalement, vous récupéreriez le token JWT depuis les cookies ou l'en-tête Authorization
    // const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
    
    // if (!token) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Utilisateur non authentifié'
    //   });
    // }
    
    // Vérifier le token JWT et récupérer l'ID de l'utilisateur
    // Dans une implémentation réelle, vous utiliseriez une bibliothèque comme jsonwebtoken
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // const authenticatedUserId = decodedToken.userId;
    
    // Commenté pour le développement, mais à implémenter pour la production
    
    const { 
      serviceId, 
      userId, 
      paymentMethod, 
      phoneNumber, 
      requirements, 
      price, 
      serviceName, 
      providerId, 
      providerName,
      deliveryTime,
      testStatus, // Pour les tests seulement
      // Nouveaux champs pour carte bancaire
      cardNumber,
      expiryDate,
      cvv,
      nameOnCard
    } = req.body;

    // Validation des entrées minimales avec messages d'erreur clairs
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'ID du service manquant'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'utilisateur manquant'
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Méthode de paiement non spécifiée'
      });
    }
    
    // Validation selon la méthode de paiement
    if (paymentMethod === 'card') {
      // Valider les informations de carte
      if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        return res.status(400).json({
          success: false,
          message: 'Informations de carte bancaire incomplètes'
        });
      }
      
      // Validation simple du numéro de carte (juste pour l'exemple)
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        return res.status(400).json({
          success: false,
          message: 'Numéro de carte invalide'
        });
      }
    } else {
      // Pour les méthodes mobiles, vérifier le numéro de téléphone
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Numéro de téléphone manquant'
        });
      }

      // Valider le format du numéro de téléphone (format sénégalais)
      const phoneRegex = /^(\+221|00221)?[76][0-9]{8}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Format de numéro de téléphone invalide'
        });
      }
    }

    // Valider le prix
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Prix invalide'
      });
    }

    // Calculer les montants exacts
    const { basePrice, serviceFee, totalAmount } = calculateTotalAmount(Number(price));

    // Phase de traitement du paiement
    // En production, intégrez ici votre passerelle de paiement réelle
    // (Stripe, PayPal, ou API locale Wave/Orange Money)
    
    // Simuler un délai de traitement pour rendre l'expérience plus réaliste
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Générer un identifiant de transaction
    const transactionId = generateTransactionId();
    
    // Générer un identifiant de commande
    const orderId = generateOrderId();
    
    // Date de l'ordre
    const orderDate = new Date().toISOString();
    
    // Calculer la date de livraison estimée
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (deliveryTime || 3));
    
    // En production, cette partie intégrerait votre logique de paiement réelle
    // Pour la démonstration, nous simulons un taux de réussite de 90%
    const isPaymentSuccessful = Math.random() < 0.9;
    
    if (!isPaymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.'
      });
    }
    
    // Définir le statut initial de la commande
    // En mode test, on peut simuler différents statuts
    let initialStatus: OrderStatus = 'en_attente';
    
    // Si mode test et statut spécifié, utiliser ce statut
    if (process.env.NODE_ENV === 'development' && testStatus) {
      initialStatus = testStatus as OrderStatus;
    }
    
    // Créer un objet commande
    const order = {
      id: orderId,
      serviceId,
      serviceName: serviceName || 'Service',
      providerId: providerId || 'unknown',
      providerName: providerName || 'Prestataire',
      clientId: userId,
      status: initialStatus,
      price: basePrice,
      serviceFee: serviceFee,
      totalAmount: totalAmount,
      orderDate,
      expectedDeliveryDate,
      deadline: expectedDeliveryDate,
      isPaid: true,
      requirements: requirements || '',
      createdAt: orderDate,
      transactionId,
      paymentMethod,
      phoneNumber: phoneNumber ? phoneNumber.replace(/\s/g, '') : undefined
    };

    // Enregistrer la commande dans notre "base de données" simulée
    ordersDB.push(order);
    console.log('[DATABASE ORDERS]', ordersDB);

    // Ajouter les fonds au portefeuille du vendeur (en attente)
    const sellerAmount = addPendingFundsToSellerWallet(
      providerId || 'unknown',
      basePrice,
      serviceFee,
      orderId
    );
    
    // Transaction object for response
    const transaction = {
      id: transactionId,
      status: 'completed',
      method: paymentMethod,
      amount: totalAmount,
      baseAmount: basePrice,
      serviceFee: serviceFee,
      date: orderDate,
      paymentDetails: {}
    };
    
    // Envoyer les emails de confirmation
    const emailResults = await sendConfirmationEmails(order, transaction);
    
    // En production, sauvegarder dans la base de données
    // Simuler l'enregistrement du paiement et de la commande
    console.log('[PAYMENT] Paiement traité:', transactionId);
    console.log('[PAYMENT] Méthode de paiement:', paymentMethod);
    console.log('[PAYMENT] Prix de base:', basePrice, 'FCFA');
    console.log('[PAYMENT] Frais de service:', serviceFee, 'FCFA');
    console.log('[PAYMENT] Montant total:', totalAmount, 'FCFA');
    console.log('[PAYMENT] Montant vendeur (après commission):', sellerAmount, 'FCFA');
    console.log('[ORDER] Commande créée:', order);
    console.log('[EMAIL] Résultats des envois d\'emails:', emailResults);

    // Retourner la réponse
    return res.status(200).json({
      success: true,
      message: 'Paiement traité avec succès',
      order,
      transaction,
      emailsSent: emailResults,
      redirectUrl: '/dashboard/client/orders'
    });
  } catch (error) {
    console.error('[PAYMENT API] Erreur:', error);
    
    // Log détaillé de l'erreur pour faciliter le débogage
    if (error instanceof Error) {
      console.error('[PAYMENT API] Nom de l\'erreur:', error.name);
      console.error('[PAYMENT API] Message:', error.message);
      console.error('[PAYMENT API] Stack:', error.stack);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

// Endpoint pour obtenir les commandes (pour le développement)
export const getOrders = () => {
  return ordersDB;
};

// Endpoint pour obtenir les portefeuilles (pour le développement)
export const getWallets = () => {
  return walletDB;
}; 