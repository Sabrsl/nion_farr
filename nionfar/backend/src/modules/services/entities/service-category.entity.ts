import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => ServiceCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: ServiceCategory;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => ServiceCategory, (category) => category.parent)
  children: ServiceCategory[];

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<ServiceCategory>) {
    Object.assign(this, partial);
  }
} 