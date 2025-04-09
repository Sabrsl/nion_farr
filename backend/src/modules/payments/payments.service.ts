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

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private ordersService: OrdersService,
    private usersService: UsersService,
  ) {}

  async createPayment(createPaymentDto: any, userId: string) {
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
      description: `Paiement pour la commande #${order.orderNumber}`,
      transactionId
    });
    
    await this.transactionRepository.save(transaction);
    
    return {
      payment: savedPayment as unknown as Payment,
      paymentUrl: this.generatePaymentUrl(savedPayment as unknown as Payment)
    };
  }

  private generatePaymentUrl(payment: Payment) {
    // Logique pour générer une URL de paiement en fonction de la méthode sélectionnée
    // Cette URL redirigerait vers la passerelle de paiement appropriée
    // Pour le moment, nous retournons simplement une URL factice
    return `https://api.example.com/pay/${payment.method}/${payment.transactionId}`;
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

  async handleWebhook(webhookData: any) {
    // Trouver le paiement par l'ID de transaction
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: webhookData.transactionId }
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with transaction ID ${webhookData.transactionId} not found`);
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
      // Utiliser la méthode updateOrderStatus du service des commandes
      await this.ordersService.updateOrderStatus(payment.orderId, { status: 'PAID' });
    }
    
    return { success: true };
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

  async updateStatus(id: string, statusData: any) {
    const payment = await this.paymentRepository.findOne({
      where: { id }
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    await this.paymentRepository.update(id, {
      status: statusData.status,
      failureReason: statusData.reason
    });
    
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'order']
    });
  }

  async requestWithdrawal(withdrawalDto: any, userId: string) {
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