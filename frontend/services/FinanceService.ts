import axios from 'axios';

// Types
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  fee: number;
  status: string;
  description: string;
  user: string;
  userId?: string;
  userType?: string;
  date: string;
  metadata?: Record<string, any>;
  paymentMethod?: string;
  orderId?: number;
  adminNotes?: string;
  history?: Array<{
    id: string;
    title: string;
    description?: string;
    datetime: string;
    icon?: React.ReactNode;
  }>;
}

export interface FinancialSummary {
  totalRevenue: number;
  pendingPayouts: number;
  commissions: number;
  growth: number;
  totalTransactions: number;
  averageTransactionValue: number;
  failedTransactions: number;
  pendingTransactions: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string | number;
  maxAmount?: string | number;
  userType?: string;
  searchTerm?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export interface ReportOptions {
  reportType: string;
  period: string;
  startDate?: string;
  endDate?: string;
  includeDetails: boolean;
  format: string;
  groupBy?: string;
}

class FinanceService {
  private API_URL = '/api';

  // Récupérer les transactions avec filtres
  async getTransactions(filters: TransactionFilters): Promise<{ transactions: Transaction[], total: number }> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/transactions`, { 
        params: { ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      // En mode développement, on peut retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return {
          transactions: this.generateMockTransactions(filters),
          total: 50
        };
      }
      throw error;
    }
  }

  // Récupérer le résumé financier
  async getFinancialSummary(period: string = 'month'): Promise<FinancialSummary> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/finance/summary`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé financier:', error);
      // En mode développement, on peut retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return {
          totalRevenue: 125750000,
          pendingPayouts: 35250000,
          commissions: 18850000,
          growth: 12.4,
          totalTransactions: 157,
          averageTransactionValue: 801000,
          failedTransactions: 3,
          pendingTransactions: 12
        };
      }
      throw error;
    }
  }

  // Récupérer une transaction par ID
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la transaction ${id}:`, error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une transaction
  async updateTransactionStatus(id: string, status: string, notes?: string): Promise<Transaction> {
    try {
      const response = await axios.patch(`${this.API_URL}/admin/transactions/${id}/status`, {
        status,
        adminNotes: notes
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de la transaction ${id}:`, error);
      throw error;
    }
  }

  // Récupérer le journal d'audit
  async getAuditLogs(filters: {
    entityId?: string;
    entityType?: string;
    limit?: number;
    page?: number;
    action?: string;
    performedByRole?: string;
    searchTerm?: string;
  }): Promise<{ logs: AuditLogEntry[], total: number }> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/audit`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du journal d\'audit:', error);
      // En mode développement, on génère des données simulées
      if (process.env.NODE_ENV === 'development') {
        return {
          logs: this.generateMockAuditLogs(filters),
          total: 50
        };
      }
      throw error;
    }
  }

  // Générer un rapport financier
  async generateReport(options: ReportOptions): Promise<{ url: string }> {
    try {
      const response = await axios.post(`${this.API_URL}/admin/finance/reports`, options);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  }

  // Exporter des transactions en CSV/Excel/PDF
  async exportTransactions(format: 'csv' | 'excel' | 'pdf', filters: TransactionFilters): Promise<{ url: string }> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/transactions/export`, {
        params: {
          format,
          ...filters
        },
        responseType: 'blob'
      });
      
      // Créer une URL pour le blob
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      return { url };
    } catch (error) {
      console.error(`Erreur lors de l'exportation des transactions en ${format}:`, error);
      throw error;
    }
  }

  // === Méthodes helper pour la génération de données simulées ===
  
  // Générer des transactions fictives pour le développement
  private generateMockTransactions(filters: TransactionFilters): Transaction[] {
    const transactionTypes = ['payment', 'payout', 'refund', 'commission'];
    const statuses = ['completed', 'pending', 'processing', 'failed'];
    const userTypes = ['client', 'freelancer', 'admin'];
    const paymentMethods = ['card', 'orange_money', 'wave', 'free_money', 'bank_transfer'];
    
    const mockData: Transaction[] = [];
    
    for (let i = 0; i < 50; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
      const amount = Math.floor(Math.random() * 500000) + 50000;
      const fee = Math.floor(amount * 0.05);
      
      // Générer une date aléatoire dans les 30 derniers jours
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const id = `TRX${Date.now().toString().slice(-6)}${i}`;
      const orderId = Math.floor(Math.random() * 20000) + 10000;
      
      // Générer une description plus descriptive
      let description = '';
      if (type === 'payment') {
        description = `Paiement pour commande #${orderId} - Service de ${['design', 'développement', 'marketing', 'rédaction', 'traduction'][Math.floor(Math.random() * 5)]}`;
      } else if (type === 'payout') {
        description = `Retrait de fonds par ${userType === 'freelancer' ? 'freelance' : 'utilisateur'}`;
      } else if (type === 'refund') {
        description = `Remboursement de commande #${orderId} - Annulation`;
      } else if (type === 'commission') {
        description = `Commission sur transaction ${id}`;
      }
      
      // Historique de transaction
      const history = this.generateTransactionHistory(id, type, status, date);
      
      // Métadonnées
      const metadata: Record<string, any> = {
        IP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'Agent utilisateur': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Localisation': 'Dakar, Sénégal'
      };
      
      if (type === 'payment' || type === 'refund') {
        metadata['Référence commande'] = `#${orderId}`;
      }
      
      if (type === 'payout') {
        metadata['Compte destinataire'] = `****${Math.floor(Math.random() * 10000)}`;
        metadata['Banque'] = ['SGBS', 'CBAO', 'Ecobank', 'BOA'][Math.floor(Math.random() * 4)];
      }
      
      // Ajouter la transaction aux données fictives si elle correspond aux filtres
      if (this.matchesFilters({ 
        id, type, status, amount, userType, paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description, user: ['Amadou Diop', 'Fatou Ndiaye', 'Mariama Ba', 'Omar Sall', 'Ibrahima Diallo'][Math.floor(Math.random() * 5)]
      }, filters)) {
        mockData.push({
          id,
          type,
          amount,
          fee,
          status,
          description,
          user: ['Amadou Diop', 'Fatou Ndiaye', 'Mariama Ba', 'Omar Sall', 'Ibrahima Diallo'][Math.floor(Math.random() * 5)],
          userType,
          date: date.toISOString(),
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          orderId: type === 'payment' || type === 'refund' ? orderId : undefined,
          metadata,
          history,
          adminNotes: Math.random() > 0.8 ? "Transaction marquée pour vérification. Contacter l'utilisateur." : undefined
        });
      }
    }
    
    // Trier par date (plus récente d'abord)
    return mockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Vérifier si une transaction correspond aux filtres
  private matchesFilters(transaction: any, filters: TransactionFilters): boolean {
    // Filtre par type
    if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) return false;
    
    // Filtre par statut
    if (filters.status && filters.status !== 'all' && transaction.status !== filters.status) return false;
    
    // Filtre par type d'utilisateur
    if (filters.userType && filters.userType !== 'all' && transaction.userType !== filters.userType) return false;
    
    // Filtre par méthode de paiement
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && transaction.paymentMethod !== filters.paymentMethod) return false;
    
    // Filtre par montant minimum
    if (filters.minAmount && transaction.amount < Number(filters.minAmount)) return false;
    
    // Filtre par montant maximum
    if (filters.maxAmount && transaction.amount > Number(filters.maxAmount)) return false;
    
    // Recherche textuelle
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = (
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.user.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    
    return true;
  }

  // Générer un historique de transaction
  private generateTransactionHistory(txId: string, type: string, status: string, date: Date): Array<{id: string, title: string, description?: string, datetime: string}> {
    const history = [];
    
    // Date de création (1-2 heures avant la date finale)
    const createdDate = new Date(date);
    createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 2) - 1);
    
    history.push({
      id: `${txId}-1`,
      title: 'Transaction initiée',
      datetime: createdDate.toISOString(),
    });
    
    // Date de validation (30 minutes après création)
    const validatedDate = new Date(createdDate);
    validatedDate.setMinutes(validatedDate.getMinutes() + 30);
    
    history.push({
      id: `${txId}-2`,
      title: 'Transaction validée',
      description: 'Tous les paramètres ont été vérifiés',
      datetime: validatedDate.toISOString(),
    });
    
    // Si statut est "failed", ajouter une entrée d'échec
    if (status === 'failed') {
      const failedDate = new Date(validatedDate);
      failedDate.setMinutes(failedDate.getMinutes() + 15);
      
      history.push({
        id: `${txId}-3`,
        title: 'Échec de la transaction',
        description: 'Problème de traitement du paiement',
        datetime: failedDate.toISOString(),
      });
    }
    
    // Si statut est "completed", ajouter une entrée de complétion
    if (status === 'completed') {
      const completedDate = new Date(validatedDate);
      completedDate.setMinutes(completedDate.getMinutes() + 15);
      
      history.push({
        id: `${txId}-3`,
        title: 'Transaction terminée',
        description: type === 'payment' ? 'Paiement confirmé' : 
                    type === 'payout' ? 'Paiement envoyé au compte bancaire' :
                    type === 'refund' ? 'Remboursement effectué' : 'Opération terminée',
        datetime: completedDate.toISOString(),
      });
    }
    
    // Si statut est "pending", ajouter une entrée d'attente
    if (status === 'pending') {
      const pendingDate = new Date(validatedDate);
      pendingDate.setMinutes(pendingDate.getMinutes() + 15);
      
      history.push({
        id: `${txId}-3`,
        title: 'En attente de traitement',
        description: type === 'payout' ? 'En attente de validation manuelle' : 'En attente de confirmation',
        datetime: pendingDate.toISOString(),
      });
    }
    
    // Si statut est "processing", ajouter une entrée de traitement
    if (status === 'processing') {
      const processingDate = new Date(validatedDate);
      processingDate.setMinutes(processingDate.getMinutes() + 15);
      
      history.push({
        id: `${txId}-3`,
        title: 'Traitement en cours',
        description: 'La transaction est en cours de traitement',
        datetime: processingDate.toISOString(),
      });
    }
    
    return history;
  }

  // Générer des entrées d'audit fictives
  private generateMockAuditLogs(filters: any): AuditLogEntry[] {
    const actions = ['create', 'update', 'view', 'delete', 'approve', 'reject', 'process'];
    const users = [
      { name: 'Admin Système', role: 'admin' },
      { name: 'Amadou Diop', role: 'admin' },
      { name: 'Système', role: 'system' },
      { name: 'Fatou Ndiaye', role: 'client' },
      { name: 'Omar Sall', role: 'freelancer' }
    ];
    const entityTypes = ['transaction', 'user', 'order', 'payout', 'refund'];
    
    const mockLogs: AuditLogEntry[] = [];
    const limit = filters.limit || 15;
    
    for (let i = 0; i < limit; i++) {
      const action = filters.action && filters.action !== 'all' 
        ? filters.action 
        : actions[Math.floor(Math.random() * actions.length)];
      
      const user = filters.performedByRole && filters.performedByRole !== 'all' 
        ? users.find(u => u.role === filters.performedByRole) || users[0]
        : users[Math.floor(Math.random() * users.length)];
      
      const randomEntityType = filters.entityType || entityTypes[Math.floor(Math.random() * entityTypes.length)];
      const randomEntityId = filters.entityId || `ENT${10000 + Math.floor(Math.random() * 90000)}`;
      
      // Créer une date aléatoire dans les 30 derniers jours
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      // Déterminer les détails en fonction de l'action
      let details = '';
      switch (action) {
        case 'create':
          details = `Création d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'update':
          details = `Mise à jour d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'view':
          details = `Consultation d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'delete':
          details = `Suppression d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'approve':
          details = `Approbation d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'reject':
          details = `Rejet d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
        case 'process':
          details = `Traitement d'un(e) ${randomEntityType} #${randomEntityId}`;
          break;
      }
      
      // Si une recherche est spécifiée, vérifier que les détails la contiennent
      if (filters.searchTerm && !details.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        continue;
      }
      
      mockLogs.push({
        id: `audit-${Date.now()}-${i}`,
        action,
        entityType: randomEntityType,
        entityId: randomEntityId,
        details,
        performedBy: user.name,
        performedByRole: user.role,
        timestamp: date.toISOString(),
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        metadata: {
          'Navigateur': 'Chrome',
          'Système': 'Windows 10',
          'Page': `/${randomEntityType}s`
        }
      });
    }
    
    // Trier par date (plus récente d'abord)
    return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const financeService = new FinanceService();
export default financeService; 