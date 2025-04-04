import disputeService from './disputeService';
import orderService from './orderService';

/**
 * Service pour gérer les tâches planifiées
 * Dans un environnement de production, ceci serait idéalement
 * implémenté côté serveur avec un vrai système de cron jobs
 */
class SchedulerService {
  private intervalIds: { [key: string]: NodeJS.Timeout } = {};
  private isRunning: boolean = false;
  
  /**
   * Démarre le service de planification
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Service de planification démarré');
    
    // Vérification des délais des litiges (toutes les heures)
    this.intervalIds['disputeDeadlines'] = setInterval(() => {
      this.runTask('Vérification des délais des litiges', async () => {
        await disputeService.checkDisputeDeadlines();
      });
    }, 60 * 60 * 1000); // 1 heure
    
    // Vérification des délais de livraison (toutes les 4 heures)
    this.intervalIds['deliveryDeadlines'] = setInterval(() => {
      this.runTask('Vérification des délais de livraison', async () => {
        await orderService.checkDeliveryDeadlines();
      });
    }, 4 * 60 * 60 * 1000); // 4 heures
    
    // Exécuter les vérifications immédiatement au démarrage
    this.runTask('Vérification initiale des délais des litiges', async () => {
      await disputeService.checkDisputeDeadlines();
    });
    
    this.runTask('Vérification initiale des délais de livraison', async () => {
      await orderService.checkDeliveryDeadlines();
    });
  }
  
  /**
   * Arrête le service de planification
   */
  stop(): void {
    if (!this.isRunning) return;
    
    // Arrêter tous les intervalles
    Object.values(this.intervalIds).forEach(intervalId => {
      clearInterval(intervalId);
    });
    
    this.intervalIds = {};
    this.isRunning = false;
    console.log('Service de planification arrêté');
  }
  
  /**
   * Exécute une tâche planifiée avec gestion des erreurs
   * @private
   */
  private async runTask(taskName: string, task: () => Promise<void>): Promise<void> {
    try {
      console.log(`Exécution de la tâche: ${taskName}`);
      await task();
      console.log(`Tâche terminée: ${taskName}`);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la tâche ${taskName}:`, error);
    }
  }
}

const schedulerService = new SchedulerService();
export default schedulerService; 