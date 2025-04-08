import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private notificationsService: NotificationsService
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string) {
    try {
      // Vérifier que la commande existe
      const order = await this.ordersService.findOne(createPaymentDto.orderId, { id: userId });
      
      // Générer un ID de transaction unique
      const transactionId = `TXN-${Date.now().toString().slice(-6)}`;
      
      // Créer le paiement
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        userId,
        transactionId,
        status: PaymentStatus.PENDING
      });
      
      const savedPayment = await this.paymentRepository.save(payment);
      
      // Créer une transaction associée
      const transaction = this.transactionRepository.create({
        userId,
        amount: createPaymentDto.amount,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        orderId: createPaymentDto.orderId,
        description: createPaymentDto.description || `Paiement pour la commande #${order.orderNumber}`,
        transactionId
      });
      
      await this.transactionRepository.save(transaction);
      
      // Envoyer une notification
      await this.notificationsService.sendUserNotification(userId, {
        title: 'Nouveau paiement initié',
        message: `Un paiement de ${createPaymentDto.amount} ${createPaymentDto.currency} a été initié pour la commande #${order.orderNumber}`,
        type: NotificationType.PAYMENT_INITIATED,
        metadata: {
          paymentId: savedPayment.id,
          orderId: order.id,
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency
        }
      });
      
      return {
        payment: savedPayment,
        paymentUrl: this.generatePaymentUrl(savedPayment)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Commande invalide ou inaccessible');
      }
      throw error;
    }
  }

  private generatePaymentUrl(payment: Payment): string {
    const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com';
    return `${baseUrl}/pay/${payment.method.toLowerCase()}/${payment.transactionId}`;
  }

  async findAll() {
    return this.paymentRepository.find({
      relations: ['user', 'order']
    });
  }

  async findUserPayments(userId: string) {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['order']
    });
  }

  async findOne(id: string, user: any) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'order']
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    // Si ce n'est pas un admin et que l'utilisateur n'est pas le propriétaire
    if (user.role !== 'admin' && payment.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this payment');
    }
    
    return payment;
  }

  async handleWebhook(webhookData: PaymentWebhookDto) {
    try {
      // Trouver le paiement par l'ID de transaction
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: webhookData.transactionId }
      });
      
      if (!payment) {
        throw new NotFoundException(`Paiement avec l'ID de transaction ${webhookData.transactionId} non trouvé`);
      }
      
      // Mettre à jour le statut du paiement
      await this.paymentRepository.update(payment.id, {
        status: webhookData.status,
        providerTransactionId: webhookData.providerTransactionId,
        providerResponse: webhookData.providerResponse
      });
      
      // Mettre à jour la transaction associée
      const transaction = await this.transactionRepository.findOne({
        where: { transactionId: webhookData.transactionId }
      });
      
      if (transaction) {
        await this.transactionRepository.update(transaction.id, {
          status: this.mapPaymentStatusToTransactionStatus(webhookData.status),
          gatewayResponse: JSON.stringify(webhookData.providerResponse)
        });
      }
      
      // Si le paiement est complété, mettre à jour le statut de la commande
      if (webhookData.status === PaymentStatus.COMPLETED && payment.orderId) {
        await this.ordersService.updateOrderStatus(payment.orderId, { status: OrderStatus.PAID });
        
        // Notifier l'utilisateur
        await this.notificationsService.sendUserNotification(payment.userId, {
          title: 'Paiement réussi',
          message: `Votre paiement pour la commande #${payment.orderId} a été confirmé`,
          type: NotificationType.PAYMENT_COMPLETED,
          metadata: {
            paymentId: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency
          }
        });
      } else if (webhookData.status === PaymentStatus.FAILED) {
        // Notifier l'utilisateur en cas d'échec
        await this.notificationsService.sendUserNotification(payment.userId, {
          title: 'Échec du paiement',
          message: `Le paiement pour la commande #${payment.orderId} a échoué${webhookData.failureReason ? `: ${webhookData.failureReason}` : ''}`,
          type: NotificationType.PAYMENT_FAILED,
          metadata: {
            paymentId: payment.id,
            orderId: payment.orderId,
            failureReason: webhookData.failureReason
          }
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  private mapPaymentStatusToTransactionStatus(paymentStatus: PaymentStatus): TransactionStatus {
    const statusMap = {
      [PaymentStatus.PENDING]: TransactionStatus.PENDING,
      [PaymentStatus.PROCESSING]: TransactionStatus.PROCESSING,
      [PaymentStatus.COMPLETED]: TransactionStatus.COMPLETED,
      [PaymentStatus.FAILED]: TransactionStatus.FAILED,
      [PaymentStatus.REFUNDED]: TransactionStatus.REFUNDED,
      [PaymentStatus.CANCELLED]: TransactionStatus.CANCELLED
    };
    
    return statusMap[paymentStatus] || TransactionStatus.PENDING;
  }

  async updateStatus(id: string, statusData: UpdatePaymentStatusDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id }
    });
    
    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé`);
    }
    
    await this.paymentRepository.update(id, {
      status: statusData.status,
      failureReason: statusData.reason
    });
    
    // Mettre à jour la transaction associée
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId: payment.transactionId }
    });
    
    if (transaction) {
      await this.transactionRepository.update(transaction.id, {
        status: this.mapPaymentStatusToTransactionStatus(statusData.status),
        gatewayResponse: JSON.stringify({ reason: statusData.reason })
      });
    }
    
    // Notifier l'utilisateur
    if (statusData.status === PaymentStatus.COMPLETED) {
      await this.notificationsService.sendUserNotification(payment.userId, {
        title: 'Paiement confirmé',
        message: `Votre paiement pour la commande #${payment.orderId} a été confirmé`,
        type: NotificationType.PAYMENT_COMPLETED,
        metadata: {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency
        }
      });
    } else if (statusData.status === PaymentStatus.FAILED) {
      await this.notificationsService.sendUserNotification(payment.userId, {
        title: 'Échec du paiement',
        message: `Le paiement pour la commande #${payment.orderId} a échoué${statusData.reason ? `: ${statusData.reason}` : ''}`,
        type: NotificationType.PAYMENT_FAILED,
        metadata: {
          paymentId: payment.id,
          orderId: payment.orderId,
          failureReason: statusData.reason
        }
      });
    }
    
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'order']
    });
  }

  async requestWithdrawal(withdrawalDto: WithdrawalDto, userId: string) {
    // Vérifier que l'utilisateur existe
    const user = await this.usersService.findOne(userId);
    
    // Vérifier que l'utilisateur a suffisamment de fonds
    if (user.balance < withdrawalDto.amount) {
      throw new BadRequestException('Insufficient funds for withdrawal');
    }
    
    // Générer un ID de transaction unique
    const transactionId = `WTH-${Date.now().toString().slice(-6)}`;
    
    // Créer une nouvelle transaction de retrait
    const transaction = this.transactionRepository.create({
      userId,
      amount: withdrawalDto.amount,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      description: `Retrait via ${withdrawalDto.method}`,
      transactionId,
      metadata: {
        accountDetails: withdrawalDto.accountDetails,
        method: withdrawalDto.method
      }
    });
    
    await this.transactionRepository.save(transaction);
    
    // Mettre à jour le solde de l'utilisateur
    await this.usersService.update(userId, {
      balance: user.balance - withdrawalDto.amount
    });
    
    return transaction;
  }

  async getWithdrawalHistory(userId: string) {
    return this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.WITHDRAWAL
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async getUserTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async getUserBalance(userId: string) {
    const user = await this.usersService.findOne(userId);
    return { balance: user.balance };
  }
} 