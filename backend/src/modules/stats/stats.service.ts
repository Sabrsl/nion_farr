import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class StatsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Récupère le nombre de services par catégorie
   */
  async getServiceCountByCategory(): Promise<any[]> {
    const servicesCollection = this.connection.db.collection('services');
    
    const result = await servicesCollection.aggregate([
      { $match: { isActive: true, isTestService: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return result.map(item => ({
      category: item._id,
      count: item.count
    }));
  }

  /**
   * Récupère le nombre de clients actifs par mois
   */
  async getActiveClientsByMonth(): Promise<any[]> {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const usersCollection = this.connection.db.collection('users');
    const ordersCollection = this.connection.db.collection('orders');
    
    // Clients qui ont passé une commande ces 6 derniers mois
    const activeClients = await ordersCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo },
          isTestOrder: { $ne: true }
        } 
      },
      { $group: { _id: { clientId: '$clientId', month: { $month: '$createdAt' } } } },
      { $group: { _id: '$_id.month', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Formatter les résultats avec les noms des mois
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    return activeClients.map(item => ({
      month: months[item._id - 1],
      count: item.count
    }));
  }

  /**
   * Récupère le montant total payé aux freelancers
   */
  async getTotalPaymentsToFreelancers(): Promise<number> {
    const transactionsCollection = this.connection.db.collection('transactions');
    
    const result = await transactionsCollection.aggregate([
      { 
        $match: { 
          type: 'withdrawal',
          status: 'completed',
          isTestTransaction: { $ne: true }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Récupère les statistiques globales de la plateforme
   */
  async getGlobalStats(): Promise<any> {
    const usersCollection = this.connection.db.collection('users');
    const servicesCollection = this.connection.db.collection('services');
    const ordersCollection = this.connection.db.collection('orders');
    
    // Nombre total de clients
    const clientCount = await usersCollection.countDocuments({ 
      role: 'client',
      isActive: true,
      isTestAccount: { $ne: true }
    });
    
    // Nombre total de freelancers
    const freelancerCount = await usersCollection.countDocuments({ 
      role: 'freelancer',
      isActive: true,
      isTestAccount: { $ne: true }
    });
    
    // Nombre total de services
    const serviceCount = await servicesCollection.countDocuments({ 
      isActive: true,
      isTestService: { $ne: true }
    });
    
    // Nombre total de commandes
    const orderCount = await ordersCollection.countDocuments({ 
      isTestOrder: { $ne: true }
    });
    
    return {
      clientCount,
      freelancerCount,
      serviceCount,
      orderCount,
      // Taux de satisfaction fixe comme demandé
      satisfactionRate: 98
    };
  }
} 