import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  UsePipes,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createServiceSchema, updateServiceSchema, CreateServiceDto, UpdateServiceDto } from '../schemas/service.schema';
import { Public } from '../../auth/decorators/public.decorator';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'providerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get('top')
  @Public()
  @ApiOperation({ summary: 'Récupérer les meilleurs services' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minReviews', required: false, type: Number })
  async getTopServices(
    @Query('limit') limit = 4,
    @Query('minReviews') minReviews = 5,
  ) {
    return this.servicesService.findTopServices(+limit, +minReviews);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateServiceSchema))
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Get('provider/:providerId')
  @Public()
  findByProvider(@Param('providerId') providerId: string) {
    return this.servicesService.findByProvider(providerId);
  }

  @Get('category/:category')
  @Public()
  findByCategory(@Param('category') category: string) {
    return this.servicesService.findByCategory(category);
  }

  @Get('categories/count')
  @Public()
  async getCategoriesCount() {
    return this.servicesService.getCategoriesCount();
  }

  @Get('stats')
  @Public()
  async getServiceStats() {
    return this.servicesService.getServiceStats();
  }
} 