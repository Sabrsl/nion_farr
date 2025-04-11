import { 
  OrderStatus, 
  Service, 
  User, 
  Deliverable, 
  RevisionRequest,
  Dispute,
  Payment,
  Notification,
  FreelancerOrderStats
} from '../types';
import { serviceExplorerService } from './serviceExplorerService';
import axios from 'axios';

interface OrderData {
  serviceId: string;
  clientId?: string;
  freelancerId?: string;
  requirements?: string;
  options?: string[];
  totalPrice: number;
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}

// Types
export interface OrderServiceModel {
  id: number;
  client: string;
  clientId?: string;
  freelancer: string;
  freelancerId?: string;
  service: string;
  serviceId?: string;
  amount: number;
  status: OrderStatus;
  date: string;
  createdAt: string;
  updatedAt?: string;
  deadline?: string;
  paymentStatus: PaymentStatus;
  description?: string;
  requirements?: string;
  revision?: number;
  category?: string;
  deliverables?: string[];
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  messages?: number;
  disputeReason?: string;
  adminNotes?: string;
  deliveryDate?: string;
  completionDate?: string;
  payment?: {
    method: string;
    details: any;
    status: string;
  };
  isPaid?: boolean;
}

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'refunded' 
  | 'partial' 
  | 'held'
  | 'failed';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  date: string;
  description: string;
  reference?: string;
  meta?: Record<string, any>;
}

export interface OrderFilterOptions {
  status?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  freelancer?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentStatus?: string;
  category?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  suspended: number;
  disputed: number;
  cancelled: number;
  pendingPayment: number;
  averageOrderValue: number;
  totalRevenue: number;
}

export interface MessageRequest {
  orderId: number;
  content: string;
  attachments?: File[];
}

export interface OrderAction {
  type: 'block' | 'unblock' | 'suspend' | 'resume' | 'cancel' | 'refund' | 'reopen' | 'delete';
  reason?: string;
  adminNotes?: string;
  refundAmount?: number;
}

class OrderService {
  private API_URL = '/api';

  /**
   * Vérifie si un utilisateur peut commander un service
   * @param serviceId ID du service à commander
   * @param userId ID de l'utilisateur qui veut commander
   * @returns Promesse avec un booléen indiquant si la commande est possible
   */
  async checkOrderEligibility(serviceId: string, userId: string): Promise<boolean> {
    try {
      // Récupérer les détails du service
      const service = await serviceExplorerService.getServiceById(serviceId);
      
      if (!service) {
        console.error('Service non trouvé');
        return false;
      }
      
      // Vérifier que l'utilisateur n'est pas le créateur du service
      if (service.provider && service.provider.id === userId) {
        console.warn('Un utilisateur a tenté de commander son propre service');
        return false;
      }
      
      // Vérifier que le service est actif
      if (!service.isActive) {
        console.error('Tentative de commander un service inactif');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation de la commande:', error);
      return false;
    }
  }

  /**
   * Crée une nouvelle commande
   * @param orderData Données de la commande
   * @returns Promesse avec la réponse de l'API
   */
  async createOrder(orderData: OrderData): Promise<OrderResponse> {
    try {
      // Vérifier si l'utilisateur peut commander ce service
      if (orderData.clientId && orderData.serviceId) {
        const canOrder = await this.checkOrderEligibility(orderData.serviceId, orderData.clientId);
        
        if (!canOrder) {
          return {
            success: false,
            message: 'Vous ne pouvez pas commander ce service'
          };
        }
      }
      
      // Dans une implémentation réelle, ceci serait un appel API
      // const response = await fetch(this.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   },
      //   body: JSON.stringify(orderData)
      // });
      // const data = await response.json();
      // return data;
      
      // Simulation d'un appel API réussi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Génération d'un ID de commande aléatoire
      const orderId = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      return {
        success: true,
        orderId,
        message: 'Commande créée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la création de la commande'
      };
    }
  }

  /**
   * Récupère toutes les commandes d'un client
   * @param clientId ID du client
   * @returns Promesse avec les commandes du client
   */
  async getClientOrders(clientId: string) {
    try {
      // Dans une implémentation réelle, ceci serait un appel API
      // const response = await fetch(`${this.apiUrl}/client/${clientId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;
      
      // Simulation d'un appel API réussi
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retourner des commandes simulées
      return {
        success: true,
        orders: [
          {
            id: 'ORD-123456',
            serviceId: 'service1',
            clientId,
            freelancerId: 'freelancer1',
            serviceName: 'Création de logo professionnel',
            status: 'completed',
            price: 15000,
            createdAt: '2023-04-15T14:30:00Z',
            completedAt: '2023-04-20T09:45:00Z'
          },
          {
            id: 'ORD-789012',
            serviceId: 'service2',
            clientId,
            freelancerId: 'freelancer2',
            serviceName: 'Développement de site web vitrine',
            status: 'in_progress',
            price: 75000,
            createdAt: '2023-05-10T11:20:00Z'
          }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la récupération des commandes',
        orders: []
      };
    }
  }

  /**
   * Récupère toutes les commandes d'un freelancer
   * @param freelancerId ID du freelancer
   * @returns Promesse avec les commandes du freelancer
   */
  async getFreelancerOrders(freelancerId: string) {
    try {
      // Dans une implémentation réelle, ceci serait un appel API
      // const response = await fetch(`${this.apiUrl}/freelancer/${freelancerId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;
      
      // Simulation d'un appel API réussi
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retourner des commandes simulées
      return {
        success: true,
        orders: [
          {
            id: 'ORD-345678',
            serviceId: 'service3',
            clientId: 'client1',
            freelancerId,
            serviceName: 'Traduction de document',
            status: 'pending',
            price: 12000,
            createdAt: '2023-05-20T15:10:00Z'
          },
          {
            id: 'ORD-901234',
            serviceId: 'service4',
            clientId: 'client2',
            freelancerId,
            serviceName: 'Montage vidéo',
            status: 'completed',
            price: 25000,
            createdAt: '2023-04-05T09:30:00Z',
            completedAt: '2023-04-10T16:20:00Z'
          }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la récupération des commandes',
        orders: []
      };
    }
  }

  /**
   * Récupère les détails d'une commande
   * @param orderId ID de la commande
   * @returns Promesse avec les détails de la commande
   */
  async getOrderDetails(orderId: string) {
    try {
      // Dans une implémentation réelle, ceci serait un appel API
      // const response = await fetch(`${this.apiUrl}/${orderId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;
      
      // Simulation d'un appel API réussi
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Retourner une commande simulée
      return {
        success: true,
        order: {
          id: orderId,
          serviceId: 'service1',
          clientId: 'client1',
          freelancerId: 'freelancer1',
          serviceName: 'Création de logo professionnel',
          status: 'in_progress',
          price: 15000,
          createdAt: '2023-05-15T14:30:00Z',
          requirements: 'Je souhaite un logo moderne et minimaliste pour mon entreprise de consultation.',
          options: ['Fichiers sources inclus', 'Livraison express (24h)'],
          messages: [
            {
              id: 'msg1',
              senderId: 'client1',
              content: 'Bonjour, je voulais préciser que j\'aimerais une version en couleur et une en noir et blanc.',
              createdAt: '2023-05-15T15:45:00Z'
            },
            {
              id: 'msg2',
              senderId: 'freelancer1',
              content: 'Bonjour, pas de problème. Je vais travailler sur ces deux versions. Avez-vous une palette de couleurs en tête?',
              createdAt: '2023-05-15T16:20:00Z'
            }
          ]
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la récupération des détails de la commande'
      };
    }
  }

  /**
   * Valide une commande avant traitement
   * @param serviceId ID du service à commander
   * @param clientId ID du client
   * @param requirements Brief du client
   * @returns Promesse avec le résultat de la validation
   */
  async validateOrder(
    serviceId: string, 
    clientId: string, 
    requirements: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    service?: Service;
  }> {
    try {
      const errors: string[] = [];
      
      // Vérifier que les IDs sont fournis
      if (!serviceId) errors.push('L\'ID du service est requis');
      if (!clientId) errors.push('L\'ID du client est requis');
      
      // Si des erreurs bloquantes, on arrête là
      if (errors.length > 0) {
        return {
          isValid: false,
          errors
        };
      }
      
      // Vérifier le service
      const serviceResponse = await fetch(`/api/services/${serviceId}`);
      if (!serviceResponse.ok) {
        errors.push('Service introuvable ou inaccessible');
        return {
          isValid: false,
          errors
        };
      }
      
      const service = await serviceResponse.json();
      
      // Vérifier que le service est actif
      if (!service.isActive) {
        errors.push('Ce service n\'est pas disponible actuellement');
      }
      
      // Vérifier que le vendeur est actif
      const sellerResponse = await fetch(`/api/users/${service.provider.id}`);
      const seller = await sellerResponse.json();
      
      if (!seller.isActive) {
        errors.push('Le vendeur n\'est pas disponible actuellement');
      }
      
      // Vérifier que le client et le vendeur ne sont pas la même personne
      if (clientId === service.provider.id) {
        errors.push('Vous ne pouvez pas commander votre propre service');
      }
      
      // Vérifier que le client n'a pas déjà une commande en cours pour ce service
      const activeOrdersResponse = await fetch(`${this.API_URL}/admin/orders/client/${clientId}/active`);
      const activeOrders = await activeOrdersResponse.json();
      
      const hasActiveOrderForService = activeOrders.some((order: OrderServiceModel) => 
        order.serviceId === serviceId && 
        ['en_attente', 'en_attente_acceptation', 'en_cours', 'en_modification', 'livré', 'livraison_en_retard'].includes(order.status)
      );
      
      if (hasActiveOrderForService) {
        errors.push('Vous avez déjà une commande en cours pour ce service. Veuillez terminer votre commande existante avant d\'en passer une nouvelle.');
      }
      
      // Vérifier le brief
      if (!requirements || requirements.trim().length < 10) {
        errors.push('Veuillez fournir un brief détaillé d\'au moins 10 caractères');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        service: errors.length === 0 ? service : undefined
      };
      
    } catch (error) {
      console.error('Erreur lors de la validation de la commande:', error);
      return {
        isValid: false,
        errors: ['Une erreur est survenue lors de la validation de la commande']
      };
    }
  }
  
  /**
   * Vérifie si un service peut être commandé
   * @param serviceId ID du service à vérifier
   * @param clientId ID du client
   * @returns Promesse avec le résultat de la vérification
   */
  async checkServiceAvailability(serviceId: string, clientId: string): Promise<{
    available: boolean;
    message?: string;
    service?: Service;
  }> {
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les infos du service (simulé)
      const response = await fetch(`/api/services/${serviceId}`);
      const service = await response.json();
      
      // Vérifier que le service est actif
      if (!service.isActive) {
        return {
          available: false,
          message: 'Ce service n\'est pas disponible actuellement.'
        };
      }
      
      // Vérifier que le vendeur est actif (simulé)
      const sellerResponse = await fetch(`/api/users/${service.provider.id}`);
      const seller = await sellerResponse.json();
      
      if (!seller.isActive) {
        return {
          available: false,
          message: 'Le vendeur n\'est pas disponible actuellement.'
        };
      }
      
      // Vérifier que le client n'a pas déjà une commande en cours pour ce service
      const activeOrdersResponse = await fetch(`${this.API_URL}/admin/orders/client/${clientId}/active`);
      const activeOrders = await activeOrdersResponse.json();
      
      const hasActiveOrderForService = activeOrders.some((order: OrderServiceModel) => 
        order.serviceId === serviceId && 
        ['en_attente', 'en_attente_acceptation', 'en_cours', 'en_modification', 'livré', 'livraison_en_retard'].includes(order.status)
      );
      
      if (hasActiveOrderForService) {
        return {
          available: false,
          message: 'Vous avez déjà une commande en cours pour ce service. Veuillez terminer votre commande existante avant d\'en passer une nouvelle.'
        };
      }
      
      return {
        available: true,
        service
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du service:', error);
      return {
        available: false,
        message: 'Une erreur est survenue lors de la vérification du service.'
      };
    }
  }
  
  /**
   * Création d'une commande
   * @param serviceId ID du service à commander
   * @param clientId ID du client
   * @param requirements Brief du client
   * @param paymentInfo Informations de paiement
   * @returns Promesse avec la commande créée
   */
  async placeOrder(
    serviceId: string,
    clientId: string,
    requirements: string,
    paymentInfo: {
      method: 'carte' | 'mobile_money' | 'virement';
      details: any;
    }
  ): Promise<{
    success: boolean;
    order?: OrderServiceModel;
    message?: string;
    paymentUrl?: string;
    paymentId?: string;
    validationErrors?: string[];
  }> {
    try {
      // 1. Valider la commande
      const validation = await this.validateOrder(serviceId, clientId, requirements);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: 'La commande ne peut pas être traitée. Veuillez corriger les erreurs.',
          validationErrors: validation.errors
        };
      }
      
      // 2. Initialiser le paiement - obligatoire avant de créer la commande
      const paymentResponse = await this.initializePayment(
        validation.service!.price,
        clientId,
        serviceId,
        paymentInfo
      );
      
      if (!paymentResponse.success) {
        return {
          success: false,
          message: 'Le paiement est obligatoire pour créer une commande. ' + (paymentResponse.message || 'Échec de l\'initialisation du paiement.'),
          paymentUrl: paymentResponse.paymentUrl
        };
      }
      
      // 3. Vérifier que le paiement est bien effectué (ou initié pour le cas de l'intégration simulée)
      const { paymentService } = await import('./paymentService');
      if (paymentResponse.paymentId) {
        const paymentStatus = await paymentService.verifyPaymentStatus(paymentResponse.paymentId);
        
        // Si le paiement n'est pas validé, on retourne l'URL de paiement pour redirection
        if (!paymentStatus.isValid && paymentStatus.status !== 'pending') {
          return {
            success: false,
            message: 'Le paiement doit être complété avant de créer la commande. ' + (paymentStatus.message || ''),
            paymentUrl: paymentResponse.paymentUrl,
            paymentId: paymentResponse.paymentId
          };
        }
      }
      
      // 4. Créer la commande avec statut "en_attente"
      const order: Partial<OrderServiceModel> = {
        id: 0, // ID sera généré par l'API
        client: clientId,
        clientId,
        freelancer: validation.service!.provider.id,
        freelancerId: validation.service!.provider.id,
        service: serviceId,
        serviceId,
        amount: validation.service!.price,
        status: 'en_attente', // La commande est d'abord en attente de paiement
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
        requirements,
        deadline: this.calculateDeadline(validation.service!.deliveryTime ?? 3),
        payment: {
          method: paymentInfo.method,
          details: paymentInfo.details,
          status: 'pending'
        }
      };
      
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const createdOrderResponse = await fetch(`${this.API_URL}/admin/orders`, {
        method: 'POST',
        body: JSON.stringify(order)
      });
      
      const createdOrder = await createdOrderResponse.json();
      
      return {
        success: true,
        order: createdOrder,
        paymentUrl: paymentResponse.paymentUrl,
        paymentId: paymentResponse.paymentId,
        message: 'Commande créée avec succès. Veuillez compléter le paiement pour finaliser votre commande.'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la création de la commande.'
      };
    }
  }
  
  /**
   * Initialise un paiement
   * @private
   */
  private async initializePayment(
    amount: number,
    clientId: string,
    serviceId: string,
    paymentInfo: any
  ): Promise<{
    success: boolean;
    paymentId?: string;
    paymentUrl?: string;
    message?: string;
  }> {
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simuler un retour d'API de paiement
      return {
        success: true,
        paymentId: `PAY-${Date.now()}`,
        paymentUrl: `/payment-gateway?amount=${amount}&method=${paymentInfo.method}`
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      return {
        success: false,
        message: 'Erreur de paiement'
      };
    }
  }
  
  /**
   * Webhook pour notification de paiement validé
   * @param paymentId ID du paiement
   * @param status Statut du paiement
   */
  async onPaymentCompleted(paymentId: string, status: 'success' | 'failed'): Promise<void> {
    try {
      // 1. Récupérer la commande liée au paiement
      const orderResponse = await fetch(`${this.API_URL}/admin/orders/payment/${paymentId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        throw new Error('Commande non trouvée pour ce paiement');
      }
      
      // 2. Si le paiement a réussi
      if (status === 'success') {
        // Utiliser le service de paiement pour valider le paiement
        const { paymentService } = await import('./paymentService');
        const paymentResult = await paymentService.onPaymentValidated(
          paymentId,
          order.amount,
          order.clientId,
          order.id
        );
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.message || 'Erreur lors de la validation du paiement');
        }
        
        // Mettre à jour la commande
        const updatedOrder = {
          ...order,
          status: 'en_attente_acceptation' as OrderStatus,
          isPaid: true,
          payment: {
            ...order.payment,
            status: 'validé',
            transactionId: paymentResult.transactionId
          }
        };
        
        // Appeler l'API pour mettre à jour la commande
        await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedOrder)
        });
        
        // Créer une notification pour le vendeur
        await this.createNotification({
          userId: order.freelancerId,
          title: 'Nouvelle commande',
          message: `Vous avez reçu une nouvelle commande : ${order.service}`,
          content: `Vous avez reçu une nouvelle commande : ${order.service}`,
          type: 'order',
          link: `/dashboard/orders/${order.id}`
        });
      } else {
        // Utiliser le service de paiement pour gérer l'échec du paiement
        const { paymentService } = await import('./paymentService');
        await paymentService.onPaymentFailed(
          paymentId,
          order.id,
          'Échec de traitement du paiement'
        );
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
    }
  }
  
  /**
   * Accepter une commande par le vendeur
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   */
  async acceptOrder(orderId: string, sellerId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au vendeur
      const orderResponse = await fetch(`${this.API_URL}/admin/orders/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.freelancerId !== sellerId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à accepter cette commande'
        };
      }
      
      if (order.status !== 'en_attente_acceptation') {
        return {
          success: false,
          message: `La commande ne peut pas être acceptée (statut actuel: ${order.status})`
        };
      }
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'en_cours' as OrderStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au client
      await this.createNotification({
        userId: order.clientId,
        title: 'Commande acceptée',
        message: `Votre commande "${order.service}" a été acceptée`,
        content: `Votre commande "${order.service}" a été acceptée`,
        type: 'order',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Soumettre une livraison 
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   * @param deliverable Livrable (message + fichiers)
   */
  async submitDelivery(
    orderId: string,
    sellerId: string,
    deliverable: { message: string; fileUrls: string[] }
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au vendeur
      const orderResponse = await fetch(`${this.API_URL}/admin/orders/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.freelancerId !== sellerId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à livrer cette commande'
        };
      }
      
      // Vérifier le statut de la commande
      if (order.status !== 'en_cours' && order.status !== 'en_modification' && order.status !== 'livraison_en_retard') {
        return {
          success: false,
          message: `La commande ne peut pas être livrée dans son état actuel (statut: ${order.status})`
        };
      }
      
      // Vérifier si c'est une première livraison ou une livraison après modification
      const isFirstDelivery = !order.deliverables || order.deliverables.length === 0;
      const isAfterRevision = order.status === 'en_modification';
      
      // Créer un nouveau livrable
      const newDeliverable: Deliverable = {
        id: `DEL-${Date.now()}`,
        orderId,
        name: `Livraison ${isAfterRevision ? 'révision' : 'initiale'}`,
        url: deliverable.fileUrls[0] || '',
        message: deliverable.message,
        fileUrls: deliverable.fileUrls,
        createdAt: new Date().toISOString(),
        isRevision: isAfterRevision
      };
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'livré' as OrderStatus,
        updatedAt: new Date().toISOString(),
        deliverables: [...(order.deliverables || []), newDeliverable],
        // Ajouter un délai de 3 jours pour validation automatique
        deliveryValidationDeadline: this.calculateDeadline(3, true)
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au client
      await this.createNotification({
        userId: order.clientId,
        title: isAfterRevision ? 'Révision livrée' : 'Commande livrée',
        message: isAfterRevision 
          ? `Le vendeur a livré la révision demandée pour la commande ${order.service}.` 
          : `Votre commande ${order.service} a été livrée.`,
        content: isAfterRevision 
          ? `Le vendeur a livré la révision demandée pour la commande ${order.service}.` 
          : `Votre commande ${order.service} a été livrée.`,
        type: 'order',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true,
        message: isAfterRevision 
          ? 'La révision a été livrée avec succès. Le client a 3 jours pour valider ou demander une autre révision.'
          : 'La commande a été livrée avec succès. Le client a 3 jours pour valider ou demander une révision.'
      };
    } catch (error) {
      console.error('Erreur lors de la livraison:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la livraison.'
      };
    }
  }
  
  /**
   * Demander une révision
   * @param orderId ID de la commande
   * @param clientId ID du client
   * @param message Message de demande de révision
   */
  async requestRevision(
    orderId: string,
    clientId: string,
    message: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au client
      const orderResponse = await fetch(`${this.API_URL}/admin/orders/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.clientId !== clientId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à demander une révision pour cette commande'
        };
      }
      
      if (order.status !== 'livré') {
        return {
          success: false,
          message: `Vous ne pouvez pas demander de révision (statut actuel: ${order.status})`
        };
      }
      
      // Créer une nouvelle demande de révision
      const revisionRequest: RevisionRequest = {
        id: `REV-${Date.now()}`,
        orderId,
        message,
        createdAt: new Date().toISOString()
      };
      
      // Calculer la nouvelle date limite (ajouter un délai bonus)
      const bonusTime = 2; // 2 jours supplémentaires
      const newDeadline = this.calculateDeadline(bonusTime);
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'en_modification' as OrderStatus,
        updatedAt: new Date().toISOString(),
        revisionRequests: [...(order.revisionRequests || []), revisionRequest],
        deadline: newDeadline,
        deliveryValidationDeadline: null // Annuler le compte à rebours de validation
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Notification au vendeur
      await this.createNotification({
        userId: order.freelancerId,
        title: 'Demande de révision',
        message: `Le client a demandé une révision pour la commande ${order.service}.`,
        content: `Le client a demandé une révision pour la commande ${order.service}.`,
        type: 'order',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la demande de révision:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Approuver une commande (marquer comme terminée)
   * @param orderId ID de la commande
   * @param clientId ID du client
   */
  async completeOrder(
    orderId: string,
    clientId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Vérifier que la commande existe et appartient au client
      const orderResponse = await fetch(`${this.API_URL}/admin/orders/${orderId}`);
      const order = await orderResponse.json();
      
      if (!order) {
        return {
          success: false,
          message: 'Commande non trouvée'
        };
      }
      
      if (order.clientId !== clientId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à approuver cette commande'
        };
      }
      
      if (order.status !== 'livré') {
        return {
          success: false,
          message: `Vous ne pouvez pas approuver cette commande (statut actuel: ${order.status})`
        };
      }
      
      // Mettre à jour la commande
      const updatedOrder = {
        ...order,
        status: 'terminée' as OrderStatus,
        updatedAt: new Date().toISOString(),
        deliveryValidationDeadline: null // Annuler le compte à rebours de validation
      };
      
      // Appeler l'API pour mettre à jour la commande
      await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
      
      // Transférer les fonds au vendeur après déduction de la commission
      const { paymentService } = await import('./paymentService');
      const { platformFee, sellerAmount } = paymentService.calculatePlatformFee(order.amount);
      
      // Transférer le montant net (après commission) au vendeur avec période de grâce
      await this.transferFundsToSeller(order.id, order.freelancerId, sellerAmount, true);
      
      // Enregistrer la commission dans le wallet de la plateforme
      await paymentService.createPlatformTransaction(platformFee, order.id);
      
      // Notification au vendeur
      await this.createNotification({
        userId: order.freelancerId,
        title: 'Commande terminée',
        message: `La commande "${order.service}" a été terminée`,
        content: `La commande "${order.service}" a été terminée`,
        type: 'order',
        link: `/dashboard/orders/${order.id}`
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la commande:', error);
      return {
        success: false,
        message: 'Une erreur est survenue'
      };
    }
  }
  
  /**
   * Transférer les fonds au vendeur
   * @private
   * @param orderId ID de la commande
   * @param sellerId ID du vendeur
   * @param amount Montant à transférer
   * @param withGracePeriod Si true, les fonds ne seront disponibles qu'après la période de grâce
   */
  private async transferFundsToSeller(
    orderId: string,
    sellerId: string,
    amount: number,
    withGracePeriod: boolean = false
  ): Promise<void> {
    try {
      // Simuler un appel API pour transférer les fonds
      const transferData = {
        orderId,
        sellerId,
        amount,
        withGracePeriod,
        // Si période de grâce, ajouter 5 jours
        availableAt: withGracePeriod ? this.calculateDeadline(5) : new Date().toISOString()
      };
      
      await fetch('/api/earnings/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData)
      });
    } catch (error) {
      console.error('Erreur lors du transfert des fonds:', error);
    }
  }
  
  /**
   * Vérification des dates limites de livraison (pour cron job)
   * Cette méthode serait normalement exécutée par un cron job côté serveur
   */
  async checkDeliveryDeadlines(): Promise<void> {
    try {
      // Récupérer toutes les commandes actives
      const ordersResponse = await fetch(`${this.API_URL}/admin/orders/active`);
      const activeOrders = await ordersResponse.json();
      
      const now = new Date();
      
      // Parcourir les commandes pour vérifier les deadlines
      for (const order of activeOrders) {
        // 1. Vérifier les commandes en cours dont la date limite est dépassée
        if (order.status === 'en_cours') {
          const deadline = new Date(order.deadline);
          
          // Si la date limite est dépassée
          if (deadline < now) {
            // Mettre à jour le statut de la commande
            const updatedOrder = {
              ...order,
              status: 'livraison_en_retard' as OrderStatus,
              updatedAt: now.toISOString()
            };
            
            // Appeler l'API pour mettre à jour la commande
            await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
              method: 'PUT',
              body: JSON.stringify(updatedOrder)
            });
            
            // Notification au vendeur
            await this.createNotification({
              userId: order.freelancerId,
              title: 'Livraison en retard',
              message: `La date limite de livraison pour la commande ${order.service} est dépassée.`,
              content: `La date limite de livraison pour la commande ${order.service} est dépassée.`,
              type: 'order',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification au client
            await this.createNotification({
              userId: order.clientId,
              title: 'Livraison en retard',
              message: `La date limite de livraison pour la commande ${order.service} est dépassée. Le vendeur a été notifié.`,
              content: `La date limite de livraison pour la commande ${order.service} est dépassée. Le vendeur a été notifié.`,
              type: 'order',
              link: `/dashboard/orders/${order.id}`
            });
          }
        }
        
        // 2. Vérifier les commandes livrées pour validation automatique après 3 jours
        if (order.status === 'livré' && order.deliveryValidationDeadline) {
          const validationDeadline = new Date(order.deliveryValidationDeadline);
          
          // Si la deadline de validation (3 jours) est dépassée
          if (validationDeadline < now) {
            // Validation automatique de la commande
            const updatedOrder = {
              ...order,
              status: 'terminée' as OrderStatus,
              updatedAt: now.toISOString(),
              deliveryValidationDeadline: null
            };
            
            // Appeler l'API pour mettre à jour la commande
            await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
              method: 'PUT',
              body: JSON.stringify(updatedOrder)
            });
            
            // Calculer et traiter la commission
            const { paymentService } = await import('./paymentService');
            const { platformFee, sellerAmount } = paymentService.calculatePlatformFee(order.amount);
            
            // Transférer le montant net au vendeur
            await this.transferFundsToSeller(order.id, order.freelancerId, sellerAmount, true);
            
            // Enregistrer la commission dans le wallet de la plateforme
            await paymentService.createPlatformTransaction(platformFee, order.id);
            
            // Notification au client
            await this.createNotification({
              userId: order.clientId,
              title: 'Validation automatique',
              message: `La commande ${order.service} a été automatiquement validée après 3 jours sans action de votre part.`,
              content: `La commande ${order.service} a été automatiquement validée après 3 jours sans action de votre part.`,
              type: 'order',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification au vendeur
            await this.createNotification({
              userId: order.freelancerId,
              title: 'Commande validée automatiquement',
              message: `La commande ${order.service} a été automatiquement validée car le client n'a pas pris d'action dans les 3 jours suivant la livraison. Les fonds (${sellerAmount} FCFA, après déduction de la commission de ${platformFee} FCFA) seront disponibles après la période de grâce.`,
              content: `La commande ${order.service} a été automatiquement validée car le client n'a pas pris d'action dans les 3 jours suivant la livraison. Les fonds (${sellerAmount} FCFA, après déduction de la commission de ${platformFee} FCFA) seront disponibles après la période de grâce.`,
              type: 'system',
              link: `/dashboard/orders/${order.id}`
            });
          } else {
            // Si la deadline approche (moins de 24h), envoyer un rappel au client
            const hoursRemaining = (validationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursRemaining <= 24 && !order.reminderSent) {
              // Marquer le rappel comme envoyé
              const updatedOrder = {
                ...order,
                reminderSent: true,
                updatedAt: now.toISOString()
              };
              
              // Mettre à jour la commande
              await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedOrder)
              });
              
              // Envoyer un rappel au client
              await this.createNotification({
                userId: order.clientId,
                title: 'Action requise - Validation de livraison',
                message: `Votre commande ${order.service} sera automatiquement validée dans moins de 24h si vous ne prenez aucune action. Veuillez valider la livraison ou demander une révision.`,
                content: `Votre commande ${order.service} sera automatiquement validée dans moins de 24h si vous ne prenez aucune action. Veuillez valider la livraison ou demander une révision.`,
                type: 'order',
                link: `/dashboard/orders/${order.id}`
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des deadlines:', error);
    }
  }
  
  /**
   * Ouvrir un litige
   * @param orderId ID de la commande
   * @param reason Raison du litige
   * @param details Détails du litige
   * @param attachments Pièces jointes
   */
  async openDispute(
    orderId: string,
    reason: string,
    details: string,
    attachments?: File[]
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Vérifications
      if (!this.isUserLoggedIn()) {
        return { success: false, message: 'Vous devez être connecté pour ouvrir un litige' };
      }

      // Vérifier que la commande existe
      const order = await this.getOrderById(orderId);
      if (!order) {
        return { success: false, message: 'Commande introuvable' };
      }

      // Vérifier que l'utilisateur est le client de la commande
      const user = this.getCurrentUser();
      if (order.clientId !== user.id) {
        return { success: false, message: 'Seul le client peut ouvrir un litige' };
      }
      
      // Vérifier que la commande est en statut adéquat
      if (!this.canOpenDispute(order.status)) {
        return { success: false, message: 'Impossible d\'ouvrir un litige avec ce statut de commande' };
      }
      
      // Vérifier que le client fournit soit une description détaillée, soit des pièces jointes
      if ((!details || details.trim().length < 20) && (!attachments || attachments.length === 0)) {
        return { 
          success: false, 
          message: 'Veuillez fournir soit une description détaillée du problème, soit des pièces jointes justificatives'
        };
      }

      // Appeler le service de litiges
      const { disputeService } = await import('./disputeService');
      const result = await disputeService.onDisputeOpened(
        orderId,
        user.id,
        reason,
        details,
        attachments
      );
      
      if (result.success) {
        // Mettre à jour le statut de la commande localement
        this.updateLocalOrderStatus(orderId, 'DISPUTED');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du litige:', error);
      return { success: false, message: 'Une erreur est survenue lors de l\'ouverture du litige' };
    }
  }
  
  /**
   * Crée une notification
   * @private
   */
  private async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<void> {
    try {
      const newNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        ...notification,
        content: notification.message || notification.title, // Use message or title as content if not provided
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(newNotification)
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  }
  
  /**
   * Calcule une date limite à partir d'aujourd'hui
   * @private
   * @param days Nombre de jours à ajouter
   * @param includeHours Si true, inclut les heures dans le calcul
   * @returns Date au format ISO
   */
  private calculateDeadline(days: number, includeHours: boolean = false): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    if (includeHours) {
      // Si on veut préciser l'heure exacte
      return deadline.toISOString();
    } else {
      // Sinon, on met l'heure à 23:59:59
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @private
   */
  private isUserLoggedIn(): boolean {
    // Simuler une vérification d'authentification
    const user = this.getCurrentUser();
    return !!user;
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @private
   */
  private getCurrentUser(): User {
    // Simuler la récupération de l'utilisateur connecté depuis le localStorage ou un contexte
    // Dans une vraie implémentation, cela viendrait d'un contexte d'authentification
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    // Utilisateur fictif pour les tests
    return {
      id: 'USR-1234',
      name: 'Utilisateur de test',
      email: 'test@example.com',
      role: 'client'
    } as User;
  }

  /**
   * Récupère une commande par son ID
   * @param orderId ID de la commande
   */
  async getOrderById(orderId: string): Promise<OrderServiceModel | null> {
    try {
      const response = await fetch(`${this.API_URL}/admin/orders/${orderId}`);
      if (!response.ok) {
        console.error(`Erreur lors de la récupération de la commande ${orderId}: ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la commande ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si une commande peut recevoir un litige
   * @private
   */
  private canOpenDispute(orderStatus: OrderStatus): boolean {
    // Une commande peut recevoir un litige si elle est livrée, en cours, ou terminée
    return ['livré', 'en_cours', 'terminé'].includes(orderStatus);
  }

  /**
   * Met à jour le statut d'une commande localement (sans appel API)
   * Utile pour des mises à jour UI immédiates
   * @private
   */
  private updateLocalOrderStatus(orderId: string, newStatus: string): void {
    // Dans une vraie implémentation, cela pourrait mettre à jour un store local
    console.log(`Mise à jour locale du statut de la commande ${orderId} : ${newStatus}`);
    
    // Émettre un événement pour les composants qui écoutent les changements
    const event = new CustomEvent('order_status_update', {
      detail: { orderId, status: newStatus }
    });
    window.dispatchEvent(event);
  }

  /**
   * Récupérer les statistiques des commandes d'un freelancer
   * @param userId - ID du freelancer
   */
  async getFreelancerOrderStats(userId: string): Promise<FreelancerOrderStats> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Retourner des données fictives
    return {
      totalOrders: 25 + Math.floor(Math.random() * 30),
      completedOrders: 20 + Math.floor(Math.random() * 25),
      inProgressOrders: 2 + Math.floor(Math.random() * 3),
      cancelledOrders: Math.floor(Math.random() * 3),
      averageCompletionTime: 3 + Math.random() * 4, // en jours
      orderCompletionRate: 0.85 + Math.random() * 0.15,
      disputedOrders: Math.floor(Math.random() * 3),
      revenueStats: {
        total: 100000 + Math.floor(Math.random() * 50000),
        lastMonth: 20000 + Math.floor(Math.random() * 10000),
        lastWeek: 5000 + Math.floor(Math.random() * 3000)
      }
    };
  }

  /**
   * Vérifie les commandes dont le vendeur n'a pas répondu sous 24h
   * Cette méthode serait idéalement exécutée par un cron job toutes les heures
   */
  async checkSellerResponseTime(): Promise<void> {
    try {
      // Récupérer les commandes en attente d'acceptation
      const pendingOrdersResponse = await fetch(`${this.API_URL}/admin/orders/pending-acceptance`);
      const pendingOrders = await pendingOrdersResponse.json();
      
      const now = new Date();
      
      // Parcourir les commandes en attente d'acceptation
      for (const order of pendingOrders) {
        if (order.status !== 'en_attente_acceptation') continue;
        
        // Vérifier si la commande a été créée il y a plus de 24h
        const orderCreatedAt = new Date(order.updatedAt || order.createdAt);
        const timeDiffHours = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);
        
        // Si cela fait plus de 24h sans réponse du vendeur
        if (timeDiffHours >= 24) {
          // Marquer que le vendeur a été averti (si ce n'est pas déjà fait)
          if (!order.sellerAlerted) {
            // Mettre à jour la commande pour indiquer que le vendeur a été averti
            const updatedOrder = {
              ...order,
              sellerAlerted: true,
              updatedAt: now.toISOString()
            };
            
            // Appeler l'API pour mettre à jour la commande
            await fetch(`${this.API_URL}/admin/orders/${order.id}`, {
              method: 'PUT',
              body: JSON.stringify(updatedOrder)
            });
            
            // Notification au vendeur
            await this.createNotification({
              userId: order.freelancerId,
              title: 'Action requise - Commande en attente',
              message: `La commande ${order.service} est en attente de votre acceptation depuis plus de 24h. Veuillez accepter ou refuser rapidement.`,
              content: `La commande ${order.service} est en attente de votre acceptation depuis plus de 24h. Veuillez accepter ou refuser rapidement.`,
              type: 'order',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification au client
            await this.createNotification({
              userId: order.clientId,
              title: 'Vendeur notifié',
              message: `Le vendeur a été notifié de votre commande ${order.service} qui est en attente depuis plus de 24h.`,
              content: `Le vendeur a été notifié de votre commande ${order.service} qui est en attente depuis plus de 24h.`,
              type: 'order',
              link: `/dashboard/orders/${order.id}`
            });
            
            // Notification à l'administration (pour suivi)
            await this.createNotification({
              userId: 'admin', // ID de l'admin général ou système
              title: 'Vendeur non-réactif',
              message: `Le vendeur ${order.freelancer} n'a pas répondu à la commande ${order.id} (${order.service}) depuis plus de 24h.`,
              content: `Le vendeur ${order.freelancer} n'a pas répondu à la commande ${order.id} (${order.service}) depuis plus de 24h.`,
              type: 'system',
              link: `/admin/orders/${order.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des temps de réponse des vendeurs:', error);
    }
  }

  // Récupérer les commandes avec filtres
  async getOrders(filters: OrderFilterOptions = {}): Promise<{ orders: OrderServiceModel[], total: number }> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/orders`, { 
        params: { ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      // En mode développement, on peut retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return {
          orders: this.generateMockOrders(filters),
          total: 50
        };
      }
      throw error;
    }
  }

  // Récupérer les statistiques des commandes
  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/orders/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de commandes:', error);
      // En mode développement, on retourne des données simulées
      if (process.env.NODE_ENV === 'development') {
        return {
          total: 150,
          completed: 72,
          inProgress: 38,
          blocked: 5,
          suspended: 3,
          disputed: 7,
          cancelled: 12,
          pendingPayment: 13,
          averageOrderValue: 145000,
          totalRevenue: 21750000
        };
      }
      throw error;
    }
  }

  // Récupérer les transactions liées à une commande
  async getOrderTransactions(orderId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/orders/${orderId}/transactions`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des transactions pour la commande ${orderId}:`, error);
      // En mode développement, on retourne des données simulées
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockTransactions(orderId);
      }
      throw error;
    }
  }

  // Effectuer une action sur une commande
  async performOrderAction(orderId: number, action: OrderAction): Promise<OrderServiceModel> {
    try {
      const response = await axios.post(`${this.API_URL}/admin/orders/${orderId}/actions`, action);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'action ${action.type} sur la commande ${orderId}:`, error);
      throw error;
    }
  }

  // Effectuer une action groupée sur plusieurs commandes
  async performBulkAction(orderIds: number[], action: OrderAction): Promise<{ success: boolean, processed: number, failed: number }> {
    try {
      const response = await axios.post(`${this.API_URL}/admin/orders/bulk-actions`, {
        orderIds,
        action
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'action groupée ${action.type}:`, error);
      throw error;
    }
  }

  // Mettre à jour les notes administratives d'une commande
  async updateOrderNotes(orderId: number, notes: string): Promise<OrderServiceModel> {
    try {
      const response = await axios.patch(`${this.API_URL}/admin/orders/${orderId}/notes`, { notes });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des notes pour la commande ${orderId}:`, error);
      throw error;
    }
  }

  // Exporter des commandes
  async exportOrders(format: 'csv' | 'excel', filters: OrderFilterOptions = {}): Promise<{ url: string }> {
    try {
      const response = await axios.get(`${this.API_URL}/admin/orders/export`, {
        params: {
          format,
          ...filters
        },
        responseType: 'blob'
      });
      
      // Créer une URL pour le blob
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      return { url };
    } catch (error) {
      console.error(`Erreur lors de l'exportation des commandes en ${format}:`, error);
      throw error;
    }
  }

  // === Méthodes helper pour la génération de données simulées ===
  
  // Générer des commandes fictives pour le développement
  private generateMockOrders(filters: OrderFilterOptions): OrderServiceModel[] {
    const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'dispute', 'litige'] as OrderStatus[];
    const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'refunded', 'partial', 'held', 'failed'];
    const categories = ['Développement web', 'Design graphique', 'Marketing digital', 'Rédaction', 'Traduction', 'Montage vidéo', 'Formation'];
    const clients = ['Amadou Diop', 'Fatou Ndiaye', 'Omar Sall', 'Mariama Ba', 'Ibrahima Diallo', 'Aissatou Diallo', 'Coumba Fall', 'Abdoulaye Kane', 'Rokhaya Diouf', 'Mamadou Sow'];
    const freelancers = ['Fatou Ndiaye', 'Omar Sall', 'Mariama Ba', 'Ibrahima Diallo', 'Aissatou Diallo', 'Coumba Fall', 'Abdoulaye Kane', 'Rokhaya Diouf', 'Amadou Diop', 'Mamadou Sow'];
    
    const mockData: OrderServiceModel[] = [];
    
    // Nombre total d'enregistrements à générer
    const numOrders = 50;
    
    for (let i = 0; i < numOrders; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = status === 'completed' ? 'paid' : 
                            status === 'cancelled' ? (Math.random() > 0.5 ? 'refunded' : 'failed') : 
                            paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Générer une date aléatoire dans les 90 derniers jours
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      // ID de commande à 5 chiffres
      const id = 12000 + i;
      
      // Montant aléatoire entre 30 000 et 500 000
      const amount = Math.floor(Math.random() * 470000) + 30000;
      
      // Générer les données de base de la commande
      const order: OrderServiceModel = {
        id,
        client: clients[Math.floor(Math.random() * clients.length)],
        clientId: `CL${100000 + Math.floor(Math.random() * 900000)}`,
        freelancer: freelancers[Math.floor(Math.random() * freelancers.length)],
        freelancerId: `FR${100000 + Math.floor(Math.random() * 900000)}`,
        service: `${category} - ${['Basique', 'Standard', 'Premium'][Math.floor(Math.random() * 3)]}`,
        serviceId: `SV${100000 + Math.floor(Math.random() * 900000)}`,
        amount,
        status,
        date: date.toISOString().split('T')[0],
        createdAt: date.toISOString(),
        updatedAt: new Date(date.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString(),
        paymentStatus,
        description: `${category} pour ${Math.random() > 0.5 ? 'un site web' : 'une application'} ${['e-commerce', 'portfolio', 'blog', 'corporate', 'éducatif'][Math.floor(Math.random() * 5)]}`,
        category,
        messages: Math.floor(Math.random() * 20),
        revision: Math.floor(Math.random() * 3)
      };
      
      // Ajouter des détails supplémentaires selon le statut
      if (status === 'completed') {
        const completionDate = new Date(date.getTime() + Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));
        order.completionDate = completionDate.toISOString();
        order.deliveryDate = new Date(completionDate.getTime() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString();
      } else if (status === 'dispute' || status === 'litige') {
        order.disputeReason = ['Qualité insuffisante', 'Retard de livraison', 'Non-respect du cahier des charges', 'Communication difficile'][Math.floor(Math.random() * 4)];
      } else if (status === 'cancelled') {
        order.adminNotes = `Commande annulée suite à ${['demande du client', 'non-respect des délais', 'accord mutuel'][Math.floor(Math.random() * 3)]}`;
      }
      
      // Date limite (deadline)
      const deadlineDate = new Date(date.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
      order.deadline = deadlineDate.toISOString().split('T')[0];
      
      // Appliquer les filtres
      if (this.matchesFilters(order, filters)) {
        mockData.push(order);
      }
    }
    
    // Limiter au nombre demandé par page
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Trier par date (plus récente d'abord)
    return mockData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(startIndex, endIndex);
  }

  // Filtrer les commandes selon les critères
  private matchesFilters(order: OrderServiceModel, filters: OrderFilterOptions): boolean {
    // Filtre par statut
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }
    
    // Filtre par statut de paiement
    if (filters.paymentStatus && filters.paymentStatus !== 'all' && order.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    
    // Filtre par catégorie
    if (filters.category && filters.category !== 'all' && order.category !== filters.category) {
      return false;
    }
    
    // Filtre par client
    if (filters.client && !order.client.toLowerCase().includes(filters.client.toLowerCase())) {
      return false;
    }
    
    // Filtre par freelancer
    if (filters.freelancer && !order.freelancer.toLowerCase().includes(filters.freelancer.toLowerCase())) {
      return false;
    }
    
    // Filtre par montant minimum
    if (filters.minAmount && order.amount < filters.minAmount) {
      return false;
    }
    
    // Filtre par montant maximum
    if (filters.maxAmount && order.amount > filters.maxAmount) {
      return false;
    }
    
    // Filtre par plage de dates
    if (filters.startDate && filters.endDate) {
      const orderDate = new Date(order.date).getTime();
      const startDate = new Date(filters.startDate).getTime();
      const endDate = new Date(filters.endDate).getTime();
      
      if (orderDate < startDate || orderDate > endDate) {
        return false;
      }
    } else if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const orderDate = new Date(order.date).getTime();
      
      switch(filters.dateRange) {
        case 'today':
          if (orderDate < today) return false;
          break;
        case 'week':
          const weekAgo = today - (7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
          if (orderDate < monthAgo) return false;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
          if (orderDate < yearAgo) return false;
          break;
      }
    }
    
    // Recherche textuelle
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = (
        order.client.toLowerCase().includes(searchLower) ||
        order.freelancer.toLowerCase().includes(searchLower) ||
        order.service.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower) ||
        (order.description && order.description.toLowerCase().includes(searchLower))
      );
      
      if (!matchesSearch) return false;
    }
    
    return true;
  }

  // Générer des transactions fictives pour une commande
  private generateMockTransactions(orderId: number): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Transaction principale de paiement de la commande
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90));
    
    // Montant aléatoire entre 30 000 et 500 000
    const amount = Math.floor(Math.random() * 470000) + 30000;
    
    transactions.push({
      id: `TRX${Date.now().toString().slice(-6)}1`,
      type: 'payment',
      status: 'completed',
      amount,
      date: orderDate.toISOString(),
      description: `Paiement pour la commande #${orderId}`,
      reference: `ORD-${orderId}`
    });
    
    // 50% de chance d'avoir un paiement de commission
    if (Math.random() > 0.5) {
      const commissionDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const commissionAmount = Math.floor(amount * 0.15);
      
      transactions.push({
        id: `TRX${Date.now().toString().slice(-6)}2`,
        type: 'commission',
        status: 'completed',
        amount: commissionAmount,
        date: commissionDate.toISOString(),
        description: `Commission pour la commande #${orderId}`,
        reference: `ORD-${orderId}-COM`
      });
    }
    
    // 20% de chance d'avoir un paiement de litige
    if (Math.random() > 0.8) {
      const disputeDate = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
      const disputeAmount = Math.floor(amount * 0.5);
      
      transactions.push({
        id: `TRX${Date.now().toString().slice(-6)}3`,
        type: 'dispute',
        status: 'completed',
        amount: disputeAmount,
        date: disputeDate.toISOString(),
        description: `Règlement de litige pour la commande #${orderId}`,
        reference: `ORD-${orderId}-DISP`
      });
    }
    
    // 10% de chance d'avoir un remboursement
    if (Math.random() > 0.9) {
      const refundDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      const refundAmount = amount;
      
      transactions.push({
        id: `TRX${Date.now().toString().slice(-6)}4`,
        type: 'refund',
        status: 'completed',
        amount: refundAmount,
        date: refundDate.toISOString(),
        description: `Remboursement pour la commande #${orderId}`,
        reference: `ORD-${orderId}-REF`
      });
    }
    
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const orderService = new OrderService();
export default orderService; 