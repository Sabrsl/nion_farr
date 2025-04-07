import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
  
  @Get('stats/platform')
  @Public()
  @ApiOperation({ summary: 'Obtenir les statistiques publiques de la plateforme' })
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }
  
  @Get('stats/visitors')
  @Public()
  @ApiOperation({ summary: 'Obtenir le nombre de visiteurs sur la plateforme' })
  async getVisitorsCount() {
    return this.adminService.getVisitorsCount();
  }
  
  @Get('stats/payments')
  @Public()
  @ApiOperation({ summary: 'Obtenir le montant total des paiements aux freelancers' })
  async getPaymentsTotal() {
    return this.adminService.getPaymentsTotal();
  }
} 