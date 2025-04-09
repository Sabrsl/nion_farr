import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    // Implementation will go here
    const order = this.orderRepository.create({
      ...createOrderDto,
      clientId: userId,
      status: OrderStatus.PENDING,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`
    });
    return this.orderRepository.save(order);
  }

  async findAll(user: any) {
    // Si admin, retourner toutes les commandes
    if (user.role === 'admin') {
      return this.orderRepository.find({
        relations: ['client', 'freelancer', 'service']
      });
    }
    
    // Sinon, retourner uniquement les commandes de l'utilisateur
    return this.orderRepository.find({
      where: [
        { clientId: user.id },
        { freelancerId: user.id }
      ],
      relations: ['client', 'freelancer', 'service']
    });
  }

  async findAllByUser(userId: string) {
    return this.orderRepository.find({
      where: [
        { clientId: userId },
        { freelancerId: userId }
      ],
      relations: ['client', 'freelancer', 'service']
    });
  }

  async findByClient(clientId: string) {
    return this.orderRepository.find({
      where: { clientId },
      relations: ['client', 'freelancer', 'service']
    });
  }

  async findByFreelancer(freelancerId: string) {
    return this.orderRepository.find({
      where: { freelancerId },
      relations: ['client', 'freelancer', 'service']
    });
  }

  async findOne(id: string, user?: any): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['client', 'freelancer', 'service', 'options'] 
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    // Si ce n'est pas un admin et que l'utilisateur n'est ni le client ni le freelancer
    if (user && user.role !== 'admin' && order.clientId !== user.id && order.freelancerId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this order');
    }
    
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: any) {
    const order = await this.findOne(id, user);
    
    // Seul le client peut mettre à jour la commande et uniquement si elle est en attente
    if (order.clientId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the client can update the order');
    }
    
    if (order.status !== OrderStatus.PENDING && user.role !== 'admin') {
      throw new ForbiddenException('Orders can only be updated when in pending status');
    }
    
    await this.orderRepository.update(id, updateOrderDto as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { id, deleted: true };
  }

  async getServiceById(serviceId: string) {
    // Implementation will go here
    return { id: serviceId, providerId: 'provider-id' };
  }

  async updateOrderStatus(orderId: string, statusData: any) {
    const order = await this.findOne(orderId);
    await this.orderRepository.update(orderId, { 
      status: statusData.status,
      cancelReason: statusData.reason
    });
    return this.findOne(orderId);
  }
  
  async updateStatus(orderId: string, statusData: any) {
    return this.updateOrderStatus(orderId, statusData);
  }
  
  async deliver(id: string, deliverOrderDto: any, user: any) {
    const order = await this.findOne(id, user);
    
    // Seul le freelancer peut livrer la commande
    if (order.freelancerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the freelancer can deliver the order');
    }
    
    // La commande doit être en cours
    if (order.status !== OrderStatus.IN_PROGRESS && user.role !== 'admin') {
      throw new ForbiddenException('Orders can only be delivered when in progress');
    }
    
    await this.orderRepository.update(id, {
      status: OrderStatus.DELIVERED,
      deliveryMessage: deliverOrderDto.deliveryMessage,
      deliveryFiles: deliverOrderDto.deliveryFiles
    });
    
    return this.findOne(id);
  }
  
  async accept(id: string, acceptOrderDto: any, user: any) {
    const order = await this.findOne(id, user);
    
    // Seul le freelancer peut accepter la commande
    if (order.freelancerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the freelancer can accept the order');
    }
    
    // La commande doit être en attente de paiement
    if (order.status !== OrderStatus.PAID && user.role !== 'admin') {
      throw new ForbiddenException('Orders can only be accepted when paid');
    }
    
    const startDate = acceptOrderDto.startDate ? new Date(acceptOrderDto.startDate) : new Date();
    let completionDate: Date = null;
    
    if (acceptOrderDto.estimatedCompletionDate) {
      completionDate = new Date(acceptOrderDto.estimatedCompletionDate);
    } else {
      // Calcul basé sur le délai de livraison du service
      completionDate = new Date(startDate);
      completionDate.setDate(completionDate.getDate() + order.service.deliveryTime);
    }
    
    await this.orderRepository.update(id, {
      status: OrderStatus.IN_PROGRESS,
      startDate,
      deadline: completionDate
    });
    
    return this.findOne(id);
  }
  
  async requestRevision(id: string, revisionDto: any, user: any) {
    const order = await this.findOne(id, user);
    
    // Seul le client peut demander une révision
    if (order.clientId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the client can request a revision');
    }
    
    // La commande doit être livrée
    if (order.status !== OrderStatus.DELIVERED && user.role !== 'admin') {
      throw new ForbiddenException('Revisions can only be requested for delivered orders');
    }
    
    await this.orderRepository.update(id, {
      status: OrderStatus.REVISION,
      // Stocker les détails de la révision dans un champ supplémentaire ou une table liée
    });
    
    return this.findOne(id);
  }
  
  async complete(id: string, user: any) {
    const order = await this.findOne(id, user);
    
    // Seul le client peut terminer la commande
    if (order.clientId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only the client can complete the order');
    }
    
    // La commande doit être livrée
    if (order.status !== OrderStatus.DELIVERED && user.role !== 'admin') {
      throw new ForbiddenException('Only delivered orders can be completed');
    }
    
    await this.orderRepository.update(id, {
      status: OrderStatus.COMPLETED,
      completionDate: new Date()
    });
    
    return this.findOne(id);
  }
  
  async cancel(id: string, cancelDto: any, user: any) {
    const order = await this.findOne(id, user);
    
    // La commande peut être annulée par le client ou le freelancer
    const isParticipant = order.clientId === user.id || order.freelancerId === user.id;
    if (!isParticipant && user.role !== 'admin') {
      throw new ForbiddenException('Only participants can cancel the order');
    }
    
    // On ne peut annuler que les commandes en attente, payées ou en cours
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.IN_PROGRESS];
    if (!cancellableStatuses.includes(order.status) && user.role !== 'admin') {
      throw new ForbiddenException('This order cannot be cancelled at its current status');
    }
    
    await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
      cancelReason: cancelDto.cancelReason
    });
    
    return this.findOne(id);
  }
} 