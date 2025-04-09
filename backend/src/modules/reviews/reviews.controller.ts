import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les avis' })
  async findAll(): Promise<Review[]> {
    return this.reviewsService.findAll();
  }

  @Get('service/:id')
  @ApiOperation({ summary: 'Récupérer les avis pour un service spécifique' })
  async findByService(@Param('id') id: string): Promise<Review[]> {
    return this.reviewsService.findByService(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel avis' })
  async create(@Body() reviewData: any, @Req() req: Request) {
    const userId = req.user['id'];
    return this.reviewsService.create(reviewData, userId);
  }
} 