import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['reviewer', 'reviewee', 'service', 'order'],
    });
  }

  async findByService(serviceId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { serviceId },
      relations: ['reviewer', 'reviewee', 'order'],
    });
  }

  async create(reviewData: Partial<Review>): Promise<Review> {
    const review = this.reviewsRepository.create(reviewData);
    return this.reviewsRepository.save(review);
  }
} 