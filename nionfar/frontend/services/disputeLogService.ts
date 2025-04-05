import { DisputeLogEntry, Dispute, User, Order } from '../types';

/**
 * Service de journalisation des litiges
 * Enregistre toutes les actions liées aux litiges pour traçabilité et preuve
 */
class DisputeLogService {
  private apiUrl = '/api/dispute-logs';

  /**
   * Crée une nouvelle entrée de journal
   * @param disputeId ID du litige concerné
   * @param userId ID de l'utilisateur effectuant l'action (ou 'system' pour automatique)
   * @param userType Type d'utilisateur (client, vendeur, admin ou system)
   * @param action Type d'action effectuée
   * @param details Description détaillée de l'action
   * @param metadata Données supplémentaires optionnelles
   */
  async createLogEntry(
    disputeId: string,
    userId: string,
    userType: DisputeLogEntry['userType'],
    action: DisputeLogEntry['action'],
    details: string,
    metadata?: Record<string, any>
  ): Promise<DisputeLogEntry> {
    try {
      const logEntry: Omit<DisputeLogEntry, 'id'> = {
        disputeId,
        userId,
        userType,
        action,
        details,
        metadata,
        createdAt: new Date().toISOString(),
        // Informations techniques supplémentaires pour preuve
        userAgent: navigator.userAgent,
        ipAddress: await this.getClientIp()
      };

      // Appel API pour sauvegarder l'entrée de journal
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée de journal:', error);
      // En cas d'erreur, on stocke localement et on tentera de synchroniser plus tard
      const localEntry = {
        id: `local-${Date.now()}`,
        disputeId,
        userId,
        userType,
        action,
        details,
        metadata,
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: 'unknown'
      };
      
      this.saveLogEntryLocally(localEntry);
      
      return localEntry;
    }
  }

  /**
   * Récupère toutes les entrées de journal pour un litige
   * @param disputeId ID du litige
   */
  async getDisputeLogs(disputeId: string): Promise<DisputeLogEntry[]> {
    try {
      const response = await fetch(`${this.apiUrl}/dispute/${disputeId}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des journaux:', error);
      return [];
    }
  }

  /**
   * Génère un résumé automatique du litige basé sur les journaux
   * @param dispute Litige à analyser
   * @param order Commande associée au litige
   */
  async generateDisputeSummary(dispute: Dispute, order: Order): Promise<string> {
    try {
      // Récupérer tous les logs du litige
      const logs = await this.getDisputeLogs(dispute.id);
      
      if (!logs || logs.length === 0) {
        return "Aucune activité enregistrée pour ce litige.";
      }

      // Extraire les informations clés
      const creationLog = logs.find(log => log.action === 'création');
      const commentLogs = logs.filter(log => log.action === 'commentaire');
      const attachmentLogs = logs.filter(log => log.action === 'pièce_jointe');
      const statusChangeLogs = logs.filter(log => log.action === 'changement_statut');
      const resolutionLog = logs.find(log => log.action === 'résolution');

      // Compter les interactions par type d'utilisateur
      const clientActions = logs.filter(log => log.userType === 'client').length;
      const vendeurActions = logs.filter(log => log.userType === 'vendeur').length;
      const adminActions = logs.filter(log => log.userType === 'admin').length;

      // Calculer le temps écoulé depuis la création
      const creationDate = new Date(dispute.createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));

      // Vérifier les délais
      const clientName = order.client.name || 'Client';
      const vendeurName = order.service?.provider?.name || 'Vendeur';
      let summary = `Litige ouvert par ${clientName} le ${this.formatDate(creationDate)}. `;

      // Activité des participants
      if (vendeurActions === 0) {
        summary += `${vendeurName} n'a pas encore répondu. `;
      } else {
        const firstVendorResponse = logs.find(log => log.userType === 'vendeur');
        if (firstVendorResponse) {
          const responseDate = new Date(firstVendorResponse.createdAt);
          const responseDelay = Math.floor((responseDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60));
          summary += `${vendeurName} a répondu après ${responseDelay} heures. `;
        }
      }

      // Informations sur les pièces jointes
      if (attachmentLogs.length === 0) {
        summary += "Aucune pièce jointe fournie. ";
      } else {
        summary += `${attachmentLogs.length} pièce(s) jointe(s) fournie(s). `;
      }

      // Informations sur les commentaires
      if (commentLogs.length > 0) {
        const clientComments = commentLogs.filter(log => log.userType === 'client').length;
        const vendeurComments = commentLogs.filter(log => log.userType === 'vendeur').length;
        summary += `${clientComments} commentaire(s) du client, ${vendeurComments} du vendeur. `;
      }

      // Statut actuel et résolution
      if (resolutionLog) {
        const resolutionDate = new Date(resolutionLog.createdAt);
        const resolutionDelay = Math.floor((resolutionDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
        summary += `Litige résolu après ${resolutionDelay} jours avec décision: ${dispute.resolution}. `;
      } else if (daysSinceCreation > 3 && vendeurActions === 0) {
        summary += "ALERTE: Délai de réponse du vendeur dépassé (>3 jours). ";
      } else if (daysSinceCreation > 14) {
        summary += "ALERTE: Litige ouvert depuis plus de 14 jours sans résolution. ";
      }

      return summary.trim();
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      return "Impossible de générer le résumé automatique.";
    }
  }

  /**
   * Sauvegarde localement une entrée de journal en cas d'échec de connexion
   * @private
   */
  private saveLogEntryLocally(logEntry: DisputeLogEntry): void {
    const localLogs = this.getLocalLogs();
    localLogs.push(logEntry);
    localStorage.setItem('dispute_logs_pending', JSON.stringify(localLogs));
  }

  /**
   * Récupère les journaux stockés localement
   * @private
   */
  private getLocalLogs(): DisputeLogEntry[] {
    const localLogsString = localStorage.getItem('dispute_logs_pending');
    return localLogsString ? JSON.parse(localLogsString) : [];
  }

  /**
   * Tente de synchroniser les journaux stockés localement avec le serveur
   */
  async syncLocalLogs(): Promise<void> {
    const localLogs = this.getLocalLogs();
    if (localLogs.length === 0) return;

    const successfulUploads: string[] = [];

    for (const log of localLogs) {
      try {
        await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...log,
            id: undefined // Supprimer l'ID local pour que le serveur en génère un nouveau
          })
        });
        successfulUploads.push(log.id);
      } catch (error) {
        console.error(`Échec de synchronisation du log ${log.id}:`, error);
      }
    }

    // Supprimer les logs synchronisés
    if (successfulUploads.length > 0) {
      const remainingLogs = localLogs.filter(log => !successfulUploads.includes(log.id));
      localStorage.setItem('dispute_logs_pending', JSON.stringify(remainingLogs));
    }
  }

  /**
   * Obtient l'adresse IP du client (ou une estimation)
   * @private
   */
  private async getClientIp(): Promise<string> {
    try {
      // Utiliser un service externe pour obtenir l'IP (simplifié ici)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Impossible de récupérer l\'adresse IP:', error);
      return 'unknown';
    }
  }

  /**
   * Formate une date en format lisible
   * @private
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC' // Utiliser UTC+0 comme demandé
    }).format(date) + ' UTC';
  }
}

const disputeLogService = new DisputeLogService();
export default disputeLogService; 