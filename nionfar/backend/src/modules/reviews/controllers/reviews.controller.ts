import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { 
  createReviewSchema,
  updateReviewSchema,
  respondToReviewSchema,
  reportReviewSchema,
} from '../schemas/review.schema';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReviewSchema))
  create(@Body() createReviewDto: any, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get()
  @Public()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateReviewSchema))
  update(@Param('id') id: string, @Body() updateReviewDto: any, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }

  @Post(':id/respond')
  @UsePipes(new ZodValidationPipe(respondToReviewSchema))
  respond(@Param('id') id: string, @Body() respondDto: any, @Request() req) {
    return this.reviewsService.respond(id, respondDto, req.user);
  }

  @Post(':id/report')
  @UsePipes(new ZodValidationPipe(reportReviewSchema))
  report(@Param('id') id: string, @Body() reportDto: any, @Request() req) {
    return this.reviewsService.report(id, reportDto, req.user.id);
  }

  @Get('user/:userId')
  @Public()
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Get('service/:serviceId')
  @Public()
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string, @Request() req) {
    return this.reviewsService.findByOrder(orderId, req.user);
  }
} 