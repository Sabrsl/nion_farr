export enum OrderStatus {
  PENDING = 'pending', // En attente de paiement
  PAID = 'paid', // Payé, en attente de démarrage
  IN_PROGRESS = 'in_progress', // En cours
  DELIVERED = 'delivered', // Livré, en attente d'approbation
  COMPLETED = 'completed', // Terminé et approuvé
  REVISION = 'revision', // En révision
  CANCELLED = 'cancelled', // Annulé
  REFUNDED = 'refunded', // Remboursé
  DISPUTED = 'disputed', // En litige
} 