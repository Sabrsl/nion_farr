import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity('service_validation_results')
export class ServiceValidationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Service, service => service.validationResult)
  @JoinColumn()
  service: Service;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ type: 'text' })
  report: string;

  @Column({ type: 'json', nullable: true })
  detailedReport: any;

  @Column({ type: 'boolean', default: false })
  moderatedByBot: boolean;

  @Column({ type: 'text', nullable: true })
  revisionFeedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 