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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema';
import { Public } from '../../auth/decorators/public.decorator';
import { ServicesService } from './services.service';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  create(@Body() createServiceDto: any) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateServiceSchema))
  update(@Param('id') id: string, @Body() updateServiceDto: any) {
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