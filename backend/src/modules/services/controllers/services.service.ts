import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, ILike } from 'typeorm';
import { Service } from '../entities/service.entity';
import { ServiceCategory } from '../entities/service-category.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createServiceDto: any) {
    try {
      // Vérifier que l'utilisateur (provider) existe
      const provider = await this.userRepository.findOne({ 
        where: { id: createServiceDto.providerId }
      });
      
      if (!provider) {
        throw new NotFoundException(`Provider with ID ${createServiceDto.providerId} not found`);
      }
      
      // Vérifier que la catégorie existe
      const category = await this.categoryRepository.findOne({
        where: { id: createServiceDto.categoryId }
      });
      
      if (!category) {
        throw new NotFoundException(`Category with ID ${createServiceDto.categoryId} not found`);
      }
      
      // Préparer les données avec les relations initialisées pour éviter les erreurs createValueMap
      const serviceData = {
        ...createServiceDto,
        // Initialiser toutes les relations avec des tableaux vides
        options: createServiceDto.options || [],
        reviews: [],
        orders: [],
        likedBy: [],
        validationHistory: []
      };
      
      // Créer le service
      const service = this.serviceRepository.create(serviceData);
      
      // Sauvegarder le service
      const savedService = await this.serviceRepository.save(service);
      
      // Déterminer l'ID à utiliser pour la recherche
      const serviceId = Array.isArray(savedService) 
        ? savedService[0]?.id 
        : (savedService as Service).id;
        
      if (!serviceId) {
        throw new Error('Failed to retrieve service ID after saving');
      }
      
      // Retourner le service avec les relations chargées
      return this.serviceRepository.findOne({
        where: { id: serviceId },
        relations: ['provider', 'category']
      });
    } catch (error) {
      // Si c'est une erreur déjà gérée (NotFoundException), la propager
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Gérer les erreurs TypeORM spécifiques
      if (error.message && error.message.includes('createValueMap')) {
        console.error('Erreur TypeORM createValueMap:', error);
        throw new Error('Erreur lors de la création du service: données invalides ou relations manquantes');
      }
      
      // Gérer les violations de contrainte d'unicité
      if (error.code === '23505') {
        throw new Error('Un service avec ces informations existe déjà');
      }
      
      // Erreur générique
      throw new Error(`Erreur lors de la création du service: ${error.message}`);
    }
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
      // Utiliser ILike au lieu de $regex pour les recherches insensibles à la casse
      return this.serviceRepository.find({
        where: [
          { ...baseWhere, title: ILike(`%${query.search}%`) },
          { ...baseWhere, description: ILike(`%${query.search}%`) }
        ],
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
    // Utiliser find() avec MoreThanOrEqual au lieu de l'opérateur MongoDB
    return this.serviceRepository.find({
      where: {
        isActive: true,
        totalReviews: MoreThanOrEqual(minReviews)
      },
      relations: ['provider', 'category', 'reviews'],
      order: { totalOrders: 'DESC' },
      take: limit
    });
  }
} 