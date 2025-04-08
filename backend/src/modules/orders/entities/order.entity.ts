import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { ServiceOption } from '../../services/entities/service-option.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { Payment } from '../../payments/entities/payment.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.clientOrders)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column()
  clientId: string;

  @ManyToOne(() => User, (user) => user.freelancerOrders)
  @JoinColumn({ name: 'freelancerId' })
  freelancer: User;

  @Column()
  freelancerId: string;

  @ManyToOne(() => Service, (service) => service.orders)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: string;

  @ManyToMany(() => ServiceOption)
  @JoinTable({
    name: 'order_service_options',
    joinColumn: { name: 'orderId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'optionId', referencedColumnName: 'id' },
  })
  options: ServiceOption[];

  @Column({ type: 'int' })
  totalPrice: number; // Total price in FCFA

  @Column({ type: 'int' })
  basePrice: number; // Base price in FCFA (without options)

  @Column({ type: 'int' })
  optionsPrice: number; // Total options price in FCFA

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ default: false })
  isRated: boolean;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ type: 'text', nullable: true })
  deliveryMessage: string;

  @Column({ type: 'simple-array', nullable: true })
  deliveryFiles: string[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
} 