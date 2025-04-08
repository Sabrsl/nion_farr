export enum PaymentType {
  ORDER = 'order', // Paiement pour une commande
  DEPOSIT = 'deposit', // Dépôt d'argent sur le compte
  WITHDRAWAL = 'withdrawal', // Retrait d'argent du compte
  REFUND = 'refund', // Remboursement
  FEE = 'fee', // Frais de service
  COMMISSION = 'commission', // Commission pour affiliés
} 