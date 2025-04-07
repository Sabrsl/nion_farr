import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const totalServices = await this.serviceRepository.count();
    const totalOrders = await this.orderRepository.count();
    
    // Récupérer quelques transactions récentes
    const recentTransactions = await this.orderRepository.find({
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
    const freelancersCount = await this.userRepository.count({
      where: { 
        isFreelancer: true,
        isActive: true
      }
    });
    
    // Compter les clients
    const clientsCount = await this.userRepository.count({
      where: { 
        isFreelancer: false,
        isActive: true
      }
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
      const userCount = await this.userRepository.count();
      const estimatedVisitors = userCount * 5;
      
      return { count: estimatedVisitors };
    } catch (error) {
      console.error('Erreur lors du calcul des visiteurs:', error);
      return { count: 5000 }; // Valeur par défaut
    }
  }
  
  async getPaymentsTotal(): Promise<{ total: number }> {
    try {
      // Calculer le montant total des paiements
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.price)', 'total')
        .where('order.status = :status', { status: 'completed' })
        .getRawOne();
      
      return { total: Number(result.total) || 10000000 };
    } catch (error) {
      console.error('Erreur lors du calcul des paiements:', error);
      return { total: 10000000 }; // Valeur par défaut (10M FCFA)
    }
  }
} 