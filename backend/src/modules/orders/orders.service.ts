import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { OrderStatus } from './enums/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) {}

  async create(createOrderDto: CreateOrderDto, clientId: string): Promise<Order> {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const order = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      client: new Types.ObjectId(clientId),
      status: OrderStatus.PENDING
    });
    return order.save();
  }

  async findAll(filters: any = {}): Promise<Order[]> {
    return this.orderModel.find(filters)
      .populate('client', 'firstName lastName email')
      .populate('freelancer', 'firstName lastName email')
      .populate('service', 'title description price')
      .exec();
  }

  async findOne(id: string, options: any = {}): Promise<Order> {
    const order = await this.orderModel.findById(id)
      .populate('client', 'firstName lastName email')
      .populate('freelancer', 'firstName lastName email')
      .populate('service', 'title description price')
      .exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      { new: true }
    ).exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    return order;
  }

  async accept(id: string, freelancerId: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cette commande ne peut plus être acceptée');
    }

    order.freelancer = new Types.ObjectId(freelancerId);
    order.status = OrderStatus.IN_PROGRESS;
    order.acceptedAt = new Date();

    return order.save();
  }

  async complete(id: string, completionMessage: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    if (order.status !== OrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Cette commande ne peut pas être marquée comme terminée');
    }

    order.status = OrderStatus.COMPLETED;
    order.completionMessage = completionMessage;
    order.completedAt = new Date();

    return order.save();
  }

  async cancel(id: string, cancellationReason: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cette commande ne peut plus être annulée');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancellationReason = cancellationReason;
    order.cancelledAt = new Date();

    return order.save();
  }

  async findByClient(clientId: string): Promise<Order[]> {
    return this.orderModel.find({ client: new Types.ObjectId(clientId) })
      .populate('freelancer', 'firstName lastName email')
      .populate('service', 'title description price')
      .exec();
  }

  async findByFreelancer(freelancerId: string): Promise<Order[]> {
    return this.orderModel.find({ freelancer: new Types.ObjectId(freelancerId) })
      .populate('client', 'firstName lastName email')
      .populate('service', 'title description price')
      .exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Commande non trouvée');
    }
  }

  async updateOrderStatus(id: string, statusData: { status: OrderStatus }): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status: statusData.status },
      { new: true }
    ).exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    return order;
  }
} 