import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('statistiques')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('services-by-category')
  @ApiOperation({ summary: 'Récupérer le nombre de services par catégorie' })
  @ApiResponse({ status: 200, description: 'Liste des catégories avec leur nombre de services' })
  async getServiceCountByCategory() {
    return this.statsService.getServiceCountByCategory();
  }

  @Get('active-clients-by-month')
  @ApiOperation({ summary: 'Récupérer le nombre de clients actifs par mois' })
  @ApiResponse({ status: 200, description: 'Liste des mois avec leur nombre de clients actifs' })
  async getActiveClientsByMonth() {
    return this.statsService.getActiveClientsByMonth();
  }

  @Get('total-payments-to-freelancers')
  @ApiOperation({ summary: 'Récupérer le montant total payé aux freelancers' })
  @ApiResponse({ status: 200, description: 'Montant total payé aux freelancers' })
  async getTotalPaymentsToFreelancers() {
    return this.statsService.getTotalPaymentsToFreelancers();
  }

  @Get('global')
  @ApiOperation({ summary: 'Récupérer les statistiques globales de la plateforme' })
  @ApiResponse({ status: 200, description: 'Statistiques globales de la plateforme' })
  async getGlobalStats() {
    return this.statsService.getGlobalStats();
  }
}
