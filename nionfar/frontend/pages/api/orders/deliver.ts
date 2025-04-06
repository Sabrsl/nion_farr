import { NextApiRequest, NextApiResponse } from 'next';
import { emailSender } from '../../../lib/emails/emailSender';

// Base de données simulée pour les commandes
// Dans une application réelle, ceci serait une vraie base de données
const ordersDB: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { 
      orderId, 
      deliveryMessage,
      deliveryFiles,
      providerId,
      clientId,
      clientEmail,
      clientName
    } = req.body;

    // Validation des entrées
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande manquant'
      });
    }
    
    // En production, récupérer les détails de la commande depuis la base de données
    // Ici pour le développement, on crée un objet de commande fictif
    const order = ordersDB[orderId] || {
      id: orderId,
      status: 'en_cours',
      serviceName: 'Service fictif',
      providerName: 'Prestataire',
      providerId: providerId || 'unknown',
      clientId: clientId || 'unknown',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours plus tôt
      expectedDeliveryDate: new Date().toISOString(),
    };
    
    // Vérification que la commande est bien en cours
    if (order.status !== 'en_cours' && order.status !== 'révision_demandée') {
      return res.status(400).json({
        success: false,
        message: `Impossible de livrer. Le statut actuel est "${order.status}".`
      });
    }
    
    // Mise à jour du statut de la commande
    const updatedOrder = {
      ...order,
      status: 'livré',
      deliveryDate: new Date().toISOString(),
      deliveryMessage: deliveryMessage || '',
      deliveryFiles: deliveryFiles || [],
      lastUpdated: new Date().toISOString()
    };
    
    // Enregistrer dans la base de données simulée
    ordersDB[orderId] = updatedOrder;
    
    // Construire l'URL de la commande pour le client
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn'}/dashboard/client/orders/${orderId}`;
    
    // Envoyer un email de notification au client
    const emailSent = await emailSender.sendOrderDeliveredEmail({
      orderId,
      orderNumber: typeof orderId === 'string' ? orderId.substring(0, 8) : orderId.toString(),
      clientId: clientId || 'unknown',
      clientName: clientName || 'Client',
      clientEmail: clientEmail || 'client@example.com',
      serviceName: order.serviceName,
      sellerId: providerId || 'unknown',
      sellerName: order.providerName,
      deliveryDate: new Date(),
      deliveryMessage: deliveryMessage,
    });
    
    console.log(`[ORDER DELIVERY] Commande livrée: ${orderId}`);
    console.log(`[ORDER DELIVERY] Message de livraison: ${deliveryMessage}`);
    console.log(`[ORDER DELIVERY] Fichiers livrés: ${deliveryFiles?.length || 0}`);
    console.log(`[ORDER DELIVERY] Email envoyé: ${emailSent}`);
    
    return res.status(200).json({
      success: true,
      message: 'Commande livrée avec succès',
      order: updatedOrder,
      emailSent
    });
  } catch (error) {
    console.error('[ORDER DELIVERY API] Erreur:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la livraison de la commande',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 