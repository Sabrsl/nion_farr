import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { ServiceCategory } from '../entities/service-category.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(createServiceDto: any) {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(query: any) {
    // Filtres de base pour exclure les services fictifs/placeholder
    const baseWhere: any = {
      isActive: true
    };
    
    // Si le paramètre providerId est fourni, filtrer par fournisseur
    if (query.providerId) {
      baseWhere.providerId = query.providerId;
    }
    
    // Si le paramètre categoryId est fourni, filtrer par catégorie
    if (query.categoryId) {
      baseWhere.categoryId = query.categoryId;
    }
    
    // Si une recherche par texte est fournie, filtrer par titre ou description
    if (query.search) {
      // Utiliser find() avec une requête regex au lieu de createQueryBuilder
      return this.serviceRepository.find({
        where: {
          ...baseWhere,
          $or: [
            { title: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } }
          ]
        },
        relations: ['provider', 'category', 'reviews'],
        order: { createdAt: 'DESC' }
      });
    }
    
    // Requête standard sans recherche textuelle
    return this.serviceRepository.find({
      where: baseWhere,
      relations: ['provider', 'category', 'reviews'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id, isActive: true },
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
      where: { providerId, isActive: true },
      relations: ['provider', 'category', 'reviews'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByCategory(category: string) {
    return this.serviceRepository.find({
      where: { categoryId: category, isActive: true },
      relations: ['provider', 'category', 'reviews'],
      order: { createdAt: 'DESC' }
    });
  }
  
  async getCategoriesCount() {
    // Récupérer toutes les catégories
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
    });
    
    // Pour chaque catégorie, compter le nombre de services actifs
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await this.serviceRepository.count({
          where: {
            categoryId: category.id,
            isActive: true,
          },
        });
        
        return {
          id: category.id,
          name: category.name,
          slug: category.name.toLowerCase().replace(/\s+/g, '-'),
          count,
        };
      })
    );
    
    return {
      categories: categoriesWithCount,
    };
  }

  /**
   * Récupère diverses statistiques sur les services
   * @returns Statistiques des services
   */
  async getServiceStats() {
    try {
      // Récupérer tous les services actifs
      const services = await this.serviceRepository.find({
        where: { isActive: true },
        relations: ['reviews'],
      });

      if (!services || services.length === 0) {
        return {
          stats: {
            avgRating: 0,
            monthlyOrders: 0,
            avgDeliveryTime: 0,
            avgPrice: 0,
            totalServices: 0,
          }
        };
      }

      // Calculer la note moyenne
      const totalRating = services.reduce((sum, service) => sum + (service.rating || 0), 0);
      const avgRating = services.length > 0 ? parseFloat((totalRating / services.length).toFixed(1)) : 0;

      // Calculer les commandes mensuelles (simulées pour l'instant)
      // Dans un système réel, vous pourriez calculer cela à partir d'une table de commandes
      const monthlyOrders = services.reduce((sum, service) => sum + (service.totalOrders || 0), 0);

      // Calculer le temps de livraison moyen
      const totalDeliveryTime = services.reduce((sum, service) => sum + (service.deliveryTime || 0), 0);
      const avgDeliveryTime = services.length > 0 ? Math.round(totalDeliveryTime / services.length) : 0;

      // Calculer le prix moyen
      const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
      const avgPrice = services.length > 0 ? Math.round(totalPrice / services.length) : 0;

      return {
        stats: {
          avgRating,
          monthlyOrders,
          avgDeliveryTime,
          avgPrice,
          totalServices: services.length,
        }
      };
    } catch (error) {
      console.error('Error calculating service stats:', error);
      return {
        stats: {
          avgRating: 0,
          monthlyOrders: 0,
          avgDeliveryTime: 0,
          avgPrice: 0,
          totalServices: 0,
        }
      };
    }
  }

  /**
   * Récupérer les meilleurs services basés sur le nombre de commandes et d'avis
   * @param limit Nombre maximum de services à récupérer
   * @param minReviews Nombre minimum d'avis requis
   * @returns Les meilleurs services
   */
  async findTopServices(limit: number = 4, minReviews: number = 5): Promise<Service[]> {
    // Utiliser find() avec des critères MongoDB au lieu de createQueryBuilder
    return this.serviceRepository.find({
      where: {
        isActive: true,
        totalReviews: { $gte: minReviews }
      },
      relations: ['provider', 'category', 'reviews'],
      order: { totalOrders: 'DESC' },
      take: limit
    });
  }
} 