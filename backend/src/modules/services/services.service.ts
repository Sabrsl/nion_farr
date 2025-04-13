import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { User } from '../users/entities/user.entity';
import { CreateServiceDto, UpdateServiceDto } from './schemas/service.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      // Vérifier si le provider existe
      const provider = await this.userRepository.findOne({
        where: { id: createServiceDto.providerId },
      });
      
      if (!provider) {
        throw new NotFoundException(`Utilisateur avec l'ID "${createServiceDto.providerId}" non trouvé`);
      }
      
      // Vérifier si la catégorie existe
      const category = await this.categoryRepository.findOne({
        where: { id: createServiceDto.categoryId },
      });
      
      if (!category) {
        throw new NotFoundException(`Catégorie avec l'ID "${createServiceDto.categoryId}" non trouvée`);
      }
      
      // Préparer les données du service avec les relations initialisées
      const serviceData = {
        ...createServiceDto,
        provider,
        category,
        options: createServiceDto.options || [],
        reviews: [],
        orders: [],
        likedBy: [],
        validationHistory: []
      };
      
      // Créer et sauvegarder le service
      const service = this.serviceRepository.create(serviceData);
      const savedService = await this.serviceRepository.save(service);
      
      // Retourner le service avec les relations chargées
      const result = await this.serviceRepository.findOne({
        where: { id: savedService.id },
        relations: ['provider', 'category'],
      });
      
      if (!result) {
        throw new NotFoundException(`Service créé mais introuvable lors de la récupération`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.code === '23505') { // Code pour violation de contrainte d'unicité
        throw new Error(`Un service avec ce titre existe déjà`);
      }
      
      console.error('Erreur lors de la création du service:', error);
      throw new Error(`Erreur lors de la création du service: ${error.message}`);
    }
  }

  // ... existing code ...
} 