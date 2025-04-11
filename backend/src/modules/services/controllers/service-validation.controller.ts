import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ServiceValidationService } from '../services/service-validation.service';
import { ValidationResult } from '../interfaces/validation.interface';

@ApiTags('admin/validation')
@Controller('admin/services/validation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ServiceValidationController {
  constructor(private readonly serviceValidationService: ServiceValidationService) {}

  @Get()
  @ApiOperation({ summary: 'Get services pending validation with filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDirection', required: false })
  async getPendingServices(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ) {
    return this.serviceValidationService.getPendingServices({
      status,
      category,
      search,
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      sortBy: sortBy || 'createdAt',
      sortDirection: sortDirection || 'asc',
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get validation statistics' })
  async getValidationStats() {
    return this.serviceValidationService.getValidationStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service validation details' })
  async getServiceValidationDetails(@Param('id') id: string): Promise<{ service: any; validationResult: ValidationResult }> {
    return this.serviceValidationService.getServiceWithValidationDetails(id);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze a service for validation' })
  async analyzeService(@Param('id') id: string): Promise<{ service: any; validationResult: ValidationResult }> {
    return this.serviceValidationService.analyzeService(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service validation status' })
  async updateServiceStatus(
    @Param('id') id: string,
    @Body() updateDto: { status: string; feedback?: string },
    @Req() req: any,
  ) {
    return this.serviceValidationService.updateServiceStatus(
      id, 
      updateDto.status, 
      req.user.id, 
      updateDto.feedback
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get service validation history' })
  async getServiceValidationHistory(@Param('id') id: string) {
    return this.serviceValidationService.getServiceValidationHistory(id);
  }
} 