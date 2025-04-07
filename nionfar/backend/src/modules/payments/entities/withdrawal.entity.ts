import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WithdrawalStatus } from '../enums/withdrawal-status.enum';
import { WithdrawalMethod } from '../enums/withdrawal-method.enum';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @Column()
  method: string;

  @Column({ type: 'json', nullable: false })
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    mobileNumber?: string;
    provider?: string;
  };

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processedById' })
  processedBy: User;

  @Column({ nullable: true })
  processedById: string;

  @Column({ type: 'json', default: '[]' })
  history: {
    status: string;
    date: Date;
    notes: string;
    by: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 