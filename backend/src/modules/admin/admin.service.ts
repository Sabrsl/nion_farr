import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../../models/order.model';
import { User } from '../../../models/user.model';
import { Service } from '../../../models/service.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userModel.countDocuments();
    const totalServices = await this.serviceModel.countDocuments();
    const totalOrders = await this.orderModel.countDocuments();
    
    // Récupérer quelques transactions récentes
    const recentTransactions = await this.orderModel.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['client', 'freelancer', 'service']
    });
    
    return {
      totalUsers,
      totalServices,
      totalOrders,
      recentTransactions,
    };
  }
  
  async getPlatformStats(): Promise<any> {
    // Obtenir les statistiques des visiteurs
    const visitors = await this.getVisitorsCount();
    
    // Obtenir les statistiques des paiements
    const payments = await this.getPaymentsTotal();
    
    // Taux de satisfaction fixe pour l'instant
    const satisfaction = 98;
    
    // Compter les freelancers
    const freelancersCount = await this.userModel.countDocuments({
      isFreelancer: true,
      isActive: true
    });
    
    // Compter les clients
    const clientsCount = await this.userModel.countDocuments({
      isFreelancer: false,
      isActive: true
    });
    
    return {
      success: true,
      stats: {
        visitors: visitors.count,
        payments: payments.total,
        satisfaction,
        freelancersCount,
        clientsCount
      }
    };
  }
  
  async getVisitorsCount(): Promise<{ count: number }> {
    try {
      // Calculer le nombre de visiteurs actifs par mois
      // Pour l'instant, on utilise une estimation basée sur le nombre d'utilisateurs * 5
      const userCount = await this.userModel.countDocuments();
      const estimatedVisitors = userCount * 5;
      
      return { count: estimatedVisitors };
    } catch (error) {
      console.error('Erreur lors du calcul des visiteurs:', error);
      return { count: 5000 }; // Valeur par défaut
    }
  }
  
  async getPaymentsTotal(): Promise<{ total: number }> {
    try {
      // Utiliser l'agrégation MongoDB pour calculer le total
      const result = await this.orderModel.aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' }
          }
        }
      ]).exec();

      // Extraire le total du résultat de l'agrégation
      const total = result.length > 0 ? result[0].total : 0;
      
      return { total: Number(total) || 10000000 };
    } catch (error) {
      console.error('Erreur lors du calcul des paiements:', error);
      return { total: 10000000 }; // Valeur par défaut (10M FCFA)
    }
  }
} 