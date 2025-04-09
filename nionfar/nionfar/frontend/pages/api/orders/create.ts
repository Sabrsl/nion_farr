import { NextApiRequest, NextApiResponse } from 'next';
import { OrderStatus } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { 
      serviceId, 
      userId, 
      paymentId, 
      paymentMethod, 
      requirements,
      serviceName,
      providerId,
      providerName,
      price
    } = req.body;

    // Validation des entrées
    if (!serviceId || !userId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Informations de commande incomplètes.'
      });
    }

    // Générer un ID de commande unique
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Calculer la date de livraison attendue (simulation)
    const orderDate = new Date();
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(orderDate.getDate() + 3); // Par défaut 3 jours
    
    // Créer l'objet de commande
    const newOrder = {
      id: orderId,
      serviceId,
      serviceName: serviceName || 'Service',
      providerId: providerId || 'unknown',
      providerName: providerName || 'Prestataire',
      clientId: userId,
      status: 'en_attente' as OrderStatus,
      price: price || 0,
      orderDate: orderDate.toISOString(),
      expectedDeliveryDate: expectedDeliveryDate.toISOString(),
      isPaid: true,
      requirements: requirements || '',
      createdAt: new Date().toISOString(),
      paymentId,
      paymentMethod
    };
    
    // En production, vous enregistreriez la commande dans votre base de données
    console.log('[ORDER API] Nouvelle commande créée:', newOrder);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Envoyer des notifications aux parties concernées
    await sendNotifications(newOrder);
    
    return res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Commande créée avec succès'
    });
  } catch (error) {
    console.error('[ORDER API] Erreur lors de la création de la commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de la commande.'
    });
  }
}

/**
 * Envoie des notifications aux différentes parties concernées par la commande
 */
async function sendNotifications(order: any) {
  try {
    // 1. Notification au client
    const clientNotification = {
      userId: order.clientId,
      type: 'order',
      title: 'Nouvelle commande créée',
      content: `Votre commande #${order.id} a été créée avec succès. Vous recevrez une confirmation du prestataire prochainement.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: `/dashboard/orders/${order.id}`
    };
    
    // 2. Notification au prestataire
    const providerNotification = {
      userId: order.providerId,
      type: 'order',
      title: 'Nouvelle commande reçue',
      content: `Vous avez reçu une nouvelle commande #${order.id} pour "${order.serviceName}". Veuillez la traiter rapidement.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: `/dashboard/orders/${order.id}`
    };
    
    // En production, vous enregistreriez ces notifications dans votre base de données
    // et potentiellement enverriez des emails ou notifications push
    console.log('[NOTIFICATIONS] Client:', clientNotification);
    console.log('[NOTIFICATIONS] Prestataire:', providerNotification);
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de l\'envoi des notifications:', error);
  }
} 