import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Service } from '../../services/entities/service.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: false })
  isFreelancer: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken?: string;

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @OneToMany(() => Order, (order) => order.client)
  clientOrders: Order[];

  @OneToMany(() => Order, (order) => order.freelancer)
  freelancerOrders: Order[];

  @OneToMany(() => Review, (review) => review.reviewer)
  givenReviews: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  receivedReviews: Review[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' },
  })
  following: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followingId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followerId', referencedColumnName: 'id' },
  })
  followers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
} 