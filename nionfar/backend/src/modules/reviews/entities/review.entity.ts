import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.givenReviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, (user) => user.receivedReviews)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;

  @Column()
  revieweeId: string;

  @ManyToOne(() => Service, (service) => service.reviews)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: string;

  @ManyToOne(() => Order, (order) => order.reviews)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 