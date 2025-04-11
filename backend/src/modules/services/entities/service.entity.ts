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
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceOption } from './service-option.entity';
import { ServiceCategory } from './service-category.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ServiceStatus } from '../enums/service-status.enum';
import { ServiceValidationResult } from './service-validation-result.entity';
import { ServiceValidationHistory } from './service-validation-history.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  price: number; // In FCFA (1000 = 1000 FCFA)

  @ManyToOne(() => User, (user) => user.services)
  @JoinColumn({ name: 'providerId' })
  provider: User;

  @Column()
  providerId: string;

  @ManyToOne(() => ServiceCategory, (category) => category.services)
  @JoinColumn({ name: 'categoryId' })
  category: ServiceCategory;

  @Column()
  categoryId: string;

  @OneToMany(() => ServiceOption, (option) => option.service, { cascade: true })
  options: ServiceOption[];

  @Column({ type: 'int', default: 0 })
  deliveryTime: number; // In days

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'service_likes',
    joinColumn: { name: 'serviceId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  likedBy: User[];

  @OneToMany(() => Order, (order) => order.service)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];

  // Relations pour la validation des services
  @OneToOne(() => ServiceValidationResult, validationResult => validationResult.service, { nullable: true })
  validationResult: ServiceValidationResult;

  @OneToMany(() => ServiceValidationHistory, history => history.service)
  validationHistory: ServiceValidationHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Service>) {
    Object.assign(this, partial);
  }
} 