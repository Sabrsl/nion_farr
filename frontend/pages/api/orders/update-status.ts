import { NextApiRequest, NextApiResponse } from 'next';
import { OrderStatus } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { orderId, newStatus, userId, comment } = req.body;

    // Validation des entrées
    if (!orderId || !newStatus || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Informations de mise à jour incomplètes. Veuillez fournir orderId, newStatus et userId.'
      });
    }

    // Vérifier que le nouveau statut est valide
    const validStatuses: OrderStatus[] = [
      'en_attente',
      'en_attente_acceptation',
      'en_attente_paiement',
      'en_cours',
      'in_progress',
      'pending',
      'completed',
      'revision',
      'livré',
      'révision_demandée',
      'en_modification',
      'terminé',
      'terminée',
      'annulé',
      'annulée',
      'litige',
      'livraison_en_retard',
      'terminée_manuellement'
    ];

    if (!validStatuses.includes(newStatus as OrderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Les statuts valides sont: ${validStatuses.join(', ')}`
      });
    }

    // En production, vous récupéreriez la commande existante dans votre base de données
    // et vérifieriez les autorisations de l'utilisateur pour modifier son statut
    console.log(`[ORDER STATUS API] Mise à jour du statut de la commande ${orderId} à "${newStatus}" par l'utilisateur ${userId}`);

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));

    // En production, vous mettriez à jour le statut dans votre base de données
    // Ici, nous simulons simplement la mise à jour pour le développement
    const updatedOrder = {
      id: orderId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      statusComment: comment || ''
    };

    // Envoyer des notifications en fonction du changement de statut
    await sendStatusChangeNotifications(updatedOrder);

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      message: `Statut de la commande mis à jour avec succès vers "${newStatus}"`
    });
  } catch (error) {
    console.error('[ORDER STATUS API] Erreur lors de la mise à jour du statut:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour du statut de la commande.'
    });
  }
}

/**
 * Envoie des notifications en fonction du changement de statut
 */
async function sendStatusChangeNotifications(order: any) {
  try {
    // Les messages de notification dépendent du nouveau statut
    let clientMessage = '';
    let providerMessage = '';

    switch (order.status) {
      case 'en_cours':
        clientMessage = `Votre commande #${order.id} est maintenant en cours de traitement.`;
        providerMessage = `Vous avez commencé à traiter la commande #${order.id}.`;
        break;
      case 'livré':
        clientMessage = `Votre commande #${order.id} a été livrée. Veuillez vérifier et accepter la livraison.`;
        providerMessage = `Vous avez livré la commande #${order.id}. En attente de l'acceptation du client.`;
        break;
      case 'révision_demandée':
        clientMessage = `Votre demande de révision pour la commande #${order.id} a été enregistrée.`;
        providerMessage = `Le client a demandé une révision pour la commande #${order.id}.`;
        break;
      case 'terminée':
        clientMessage = `Votre commande #${order.id} est maintenant terminée. Merci d'avoir utilisé notre plateforme!`;
        providerMessage = `La commande #${order.id} est maintenant terminée et le paiement a été transféré.`;
        break;
      case 'annulée':
        clientMessage = `Votre commande #${order.id} a été annulée.`;
        providerMessage = `La commande #${order.id} a été annulée.`;
        break;
      default:
        clientMessage = `Le statut de votre commande #${order.id} a été mis à jour: ${order.status}.`;
        providerMessage = `Le statut de la commande #${order.id} a été mis à jour: ${order.status}.`;
    }

    // Simuler l'envoi de notifications
    console.log('[NOTIFICATIONS] Changement de statut - Client:', {
      type: 'order_status',
      title: `Mise à jour de la commande #${order.id}`,
      content: clientMessage
    });

    console.log('[NOTIFICATIONS] Changement de statut - Prestataire:', {
      type: 'order_status',
      title: `Mise à jour de la commande #${order.id}`,
      content: providerMessage
    });

  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de l\'envoi des notifications de changement de statut:', error);
  }
} 