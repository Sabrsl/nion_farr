import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: any) {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(query: any) {
    return this.serviceRepository.find({
      relations: ['provider', 'category', 'reviews'],
    });
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'category', 'reviews'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: any) {
    const service = await this.findOne(id);
    this.serviceRepository.merge(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    return this.serviceRepository.remove(service);
  }

  async findByProvider(providerId: string) {
    return this.serviceRepository.find({
      where: { providerId },
      relations: ['provider', 'category', 'reviews'],
    });
  }

  async findByCategory(category: string) {
    return this.serviceRepository.find({
      where: { categoryId: category },
      relations: ['provider', 'category', 'reviews'],
    });
  }
} 