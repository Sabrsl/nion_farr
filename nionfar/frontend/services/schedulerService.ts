import { disputeService } from './disputeService';
import orderService from './orderService';
import { authService } from './authService';

/**
 * Service pour gérer les tâches planifiées
 * Dans un environnement de production, ceci serait idéalement
 * implémenté côté serveur avec un vrai système de cron jobs
 */
class SchedulerService {
  private intervalIds: { [key: string]: NodeJS.Timeout } = {};
  private isRunning: boolean = false;
  private DAY_IN_MS: number = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  
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
    
    // Vérification du temps de réponse des vendeurs (toutes les heures)
    this.intervalIds['sellerResponseTime'] = setInterval(() => {
      this.runTask('Vérification du temps de réponse des vendeurs', async () => {
        await orderService.checkSellerResponseTime();
      });
    }, 60 * 60 * 1000); // 1 heure
    
    // Vérifier les comptes inactifs quotidiennement
    setInterval(() => {
      this.checkInactiveAccounts();
    }, this.DAY_IN_MS);
    
    // Exécuter les vérifications immédiatement au démarrage
    this.runTask('Vérification initiale des délais des litiges', async () => {
      await disputeService.checkDisputeDeadlines();
    });
    
    this.runTask('Vérification initiale des délais de livraison', async () => {
      await orderService.checkDeliveryDeadlines();
    });
    
    this.runTask('Vérification initiale du temps de réponse des vendeurs', async () => {
      await orderService.checkSellerResponseTime();
    });
    
    // Exécuter immédiatement au démarrage
    this.checkInactiveAccounts();
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
  
  // Vérifier les comptes inactifs (6+ mois)
  private async checkInactiveAccounts() {
    console.log('Vérification des comptes inactifs...');
    try {
      await authService.checkInactiveAccounts();
    } catch (error) {
      console.error('Erreur lors de la vérification des comptes inactifs:', error);
    }
  }
}

const schedulerService = new SchedulerService();
export default schedulerService; 