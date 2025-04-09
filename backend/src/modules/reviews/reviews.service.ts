import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private ordersService: OrdersService,
    private usersService: UsersService
  ) {}

  async create(createReviewDto: any, userId: string) {
    // Vérifier que la commande existe et qu'elle est complétée
    const order = await this.ordersService.findOne(createReviewDto.orderId, { id: userId });
    
    // Vérifier que l'utilisateur est le client de la commande
    if (order.clientId !== userId) {
      throw new ForbiddenException('Seul le client peut laisser un avis sur une commande');
    }
    
    // Vérifier que la commande est terminée
    if (order.status !== 'completed') {
      throw new ForbiddenException('Les avis ne peuvent être laissés que sur des commandes terminées');
    }
    
    // Vérifier qu'il n'y a pas déjà un avis pour cette commande
    const existingReview = await this.reviewRepository.findOne({
      where: { orderId: createReviewDto.orderId }
    });
    
    if (existingReview) {
      throw new ForbiddenException('Un avis a déjà été laissé pour cette commande');
    }
    
    // Créer l'avis
    const review = this.reviewRepository.create({
      ...createReviewDto,
      reviewerId: userId,
      revieweeId: order.freelancerId,
      serviceId: order.serviceId
    });
    
    const savedReview = await this.reviewRepository.save(review);
    
    // Mettre à jour le statut de la commande pour indiquer qu'elle a été notée
    await this.ordersService.update(createReviewDto.orderId, { isRated: true } as any, { id: userId });
    
    // Mettre à jour la note moyenne du freelancer
    await this.updateFreelancerRating(order.freelancerId);
    
    return savedReview;
  }

  async findAll() {
    return this.reviewRepository.find({
      relations: ['reviewer', 'reviewee', 'service', 'order']
    });
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['reviewer', 'reviewee', 'service', 'order']
    });
    
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return review;
  }

  async update(id: string, updateReviewDto: any, user: any) {
    const review = await this.findOne(id);
    
    // Vérifier que l'utilisateur est l'auteur de l'avis ou un admin
    if (review.reviewerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cet avis');
    }
    
    await this.reviewRepository.update(id, updateReviewDto);
    
    // Si la note a été modifiée, mettre à jour la note moyenne du freelancer
    if (updateReviewDto.rating) {
      await this.updateFreelancerRating(review.revieweeId);
    }
    
    return this.findOne(id);
  }

  async remove(id: string) {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
    
    // Mettre à jour la note moyenne du freelancer
    await this.updateFreelancerRating(review.revieweeId);
    
    return { id, removed: true };
  }

  async respond(id: string, respondDto: any, user: any) {
    const review = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le freelancer évalué
    if (review.revieweeId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul le prestataire évalué peut répondre à cet avis');
    }
    
    const updateData = {
      response: respondDto.response,
      responseDate: new Date()
    };
    
    await this.reviewRepository.update(id, updateData as any);
    
    return this.findOne(id);
  }

  async report(id: string, reportDto: any, userId: string) {
    const review = await this.findOne(id);
    
    // Ajouter le signalement à l'avis
    // Dans un système complet, cela pourrait être stocké dans une table séparée
    const updateData = {
      isReported: true,
      reportReason: reportDto.reason,
      reportDetails: reportDto.details
    };
    
    await this.reviewRepository.update(id, updateData as any);
    
    return this.findOne(id);
  }

  async findByUser(userId: string) {
    return this.reviewRepository.find({
      where: [
        { reviewerId: userId },
        { revieweeId: userId }
      ],
      relations: ['reviewer', 'reviewee', 'service', 'order']
    });
  }

  async findByService(serviceId: string) {
    return this.reviewRepository.find({
      where: { serviceId },
      relations: ['reviewer', 'service']
    });
  }

  async findByOrder(orderId: string, user: any) {
    // Vérifier que l'utilisateur a accès à la commande
    const order = await this.ordersService.findOne(orderId, user);
    
    return this.reviewRepository.findOne({
      where: { orderId },
      relations: ['reviewer', 'reviewee', 'service', 'order']
    });
  }

  private async updateFreelancerRating(freelancerId: string) {
    // Calculer la nouvelle note moyenne
    const reviews = await this.reviewRepository.find({
      where: { revieweeId: freelancerId }
    });
    
    if (reviews.length === 0) {
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Mettre à jour la note moyenne du freelancer
    await this.usersService.update(freelancerId, {
      rating: parseFloat(averageRating.toFixed(2)),
      totalReviews: reviews.length
    });
  }
} 