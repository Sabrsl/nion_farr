import { Dispute, User } from '../types';

/**
 * Actions possibles sur un litige
 */
export enum DisputeAction {
  OPEN = 'open',                   // Ouvrir un litige
  RESPOND = 'respond',             // Répondre au litige
  ADD_ATTACHMENT = 'addAttachment',// Ajouter pièce jointe
  DECIDE = 'decide',               // Prendre décision finale
  VIEW_HISTORY = 'viewHistory',    // Voir historique complet
  CLOSE_WITHOUT_DECISION = 'close' // Clôturer sans décision
}

/**
 * Service gérant les permissions liées aux litiges
 */
class DisputePermissionService {
  /**
   * Vérifie si un utilisateur peut effectuer une action sur un litige
   * @param action Action à vérifier
   * @param user Utilisateur qui tente d'effectuer l'action
   * @param dispute Litige concerné (optionnel pour certaines actions)
   * @param orderId ID de la commande (requis pour l'ouverture de litige)
   */
  canPerformAction(
    action: DisputeAction,
    user: User,
    dispute?: Dispute,
    orderId?: string
  ): boolean {
    if (!user || !user.id) return false;
    
    // Vérifier le rôle de l'utilisateur
    const isAdmin = user.role === 'admin';
    const isClient = user.role === 'client';
    const isFreelancer = user.role === 'freelancer';
    
    switch (action) {
      case DisputeAction.OPEN:
        // Seuls les clients peuvent ouvrir un litige
        if (!isClient) return false;
        // Besoin de l'ID de commande pour ouvrir un litige
        if (!orderId) return false;
        return true;
        
      case DisputeAction.RESPOND:
        // Tous les rôles peuvent répondre
        if (!dispute) return false;
        // Vérifier que le litige est dans un état permettant une réponse
        return this.isDisputeInRespondableState(dispute);
        
      case DisputeAction.ADD_ATTACHMENT:
        // Tous les rôles peuvent ajouter des pièces jointes
        if (!dispute) return false;
        // Vérifier que le litige est dans un état permettant l'ajout de pièces jointes
        return this.isDisputeInRespondableState(dispute);
        
      case DisputeAction.DECIDE:
        // Seuls les admins peuvent prendre une décision finale
        return isAdmin && !!dispute && this.canDisputeBeDecided(dispute);
        
      case DisputeAction.VIEW_HISTORY:
        // Tous les rôles peuvent voir l'historique
        return !!dispute;
        
      case DisputeAction.CLOSE_WITHOUT_DECISION:
        // Seuls les admins peuvent clôturer sans décision
        return isAdmin && !!dispute && this.canDisputeBeClosed(dispute);
        
      default:
        return false;
    }
  }
  
  /**
   * Vérifie si un utilisateur est autorisé à voir un litige spécifique
   * @param user Utilisateur actuel
   * @param dispute Litige à consulter
   * @param order Commande associée au litige
   */
  canViewDispute(user: User, dispute: Dispute, orderClientId: string, orderFreelancerId: string): boolean {
    if (!user || !user.id) return false;
    
    // Les admins peuvent voir tous les litiges
    if (user.role === 'admin') return true;
    
    // Pour les clients et freelancers, ils doivent être impliqués dans la commande
    return user.id === orderClientId || user.id === orderFreelancerId;
  }
  
  /**
   * Vérifie si un litige est dans un état permettant une réponse
   * @private
   */
  private isDisputeInRespondableState(dispute: Dispute): boolean {
    // On peut répondre tant que le litige n'est pas résolu ou fermé
    const nonRespondableStates = [
      'résolu_en_faveur_client',
      'résolu_en_faveur_vendeur',
      'clos_automatiquement',
      'refusé'
    ];
    
    return !nonRespondableStates.includes(dispute.status);
  }
  
  /**
   * Vérifie si un litige peut faire l'objet d'une décision
   * @private
   */
  private canDisputeBeDecided(dispute: Dispute): boolean {
    // On peut prendre une décision tant que le litige n'est pas déjà résolu ou fermé
    return this.isDisputeInRespondableState(dispute);
  }
  
  /**
   * Vérifie si un litige peut être clôturé sans décision
   * @private
   */
  private canDisputeBeClosed(dispute: Dispute): boolean {
    // On peut clôturer tant que le litige n'est pas déjà résolu ou fermé
    return this.isDisputeInRespondableState(dispute);
  }
  
  /**
   * Vérifie si un utilisateur est le créateur du litige
   * @private
   */
  isDisputeCreator(userId: string, dispute: Dispute): boolean {
    return dispute.initiatedBy === userId;
  }
}

const disputePermissionService = new DisputePermissionService();
export default disputePermissionService; 