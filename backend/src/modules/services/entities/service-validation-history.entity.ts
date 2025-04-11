import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Service } from './service.entity';
import { User } from '../../users/entities/user.entity';

@Entity('service_validation_history')
export class ServiceValidationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service, service => service.validationHistory)
  @JoinColumn()
  service: Service;

  @ManyToOne(() => User)
  @JoinColumn()
  admin: User;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
} 