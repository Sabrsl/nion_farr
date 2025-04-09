import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { PaymentGatewayType } from '../enums/payment-gateway-type.enum';

@Entity('payment_gateways')
export class PaymentGateway {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: PaymentGatewayType })
  type: PaymentGatewayType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSandbox: boolean;

  @Column({ type: 'json', nullable: true })
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookSecret?: string;
    endpoint?: string;
    callbackUrl?: string;
    additionalParams?: Record<string, any>;
  };

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', default: '[]' })
  supportedMethods: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  feePercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 