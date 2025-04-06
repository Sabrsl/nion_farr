import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getDashboardStats(): Promise<any> {
    // TODO: Implémenter la logique pour récupérer les statistiques du tableau de bord
    return {
      totalUsers: 0,
      totalServices: 0,
      totalOrders: 0,
      recentTransactions: [],
    };
  }
} 