/**
 * Contrôleur de performances pour NionFar
 * Expose des endpoints API pour accéder aux métriques de performance
 */

import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Performance')
@Controller('api/performance')
@UseGuards(AdminGuard) // Sécuriser les routes de performance pour les admins uniquement
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Récupère un tableau de bord complet des performances',
    description: 'Retourne l\'état actuel des métriques de performance du système'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tableau de bord des performances récupéré avec succès' 
  })
  async getDashboard() {
    try {
      return await this.performanceService.getPerformanceDashboard();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du tableau de bord des performances', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('memory')
  @ApiOperation({ 
    summary: 'Récupère l\'historique des métriques de mémoire',
    description: 'Retourne l\'historique des métriques de mémoire du système'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Nombre maximum d\'entrées à retourner'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métriques de mémoire récupérées avec succès' 
  })
  getMemoryHistory(@Query('limit') limit?: number) {
    try {
      return this.performanceService.getMemoryHistoryData(limit ? parseInt(limit as unknown as string, 10) : undefined);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des métriques de mémoire', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('api-metrics')
  @ApiOperation({ 
    summary: 'Récupère l\'historique des métriques d\'API',
    description: 'Retourne l\'historique des métriques d\'utilisation de l\'API'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Nombre maximum d\'entrées à retourner'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métriques d\'API récupérées avec succès' 
  })
  getApiMetrics(@Query('limit') limit?: number) {
    try {
      return this.performanceService.getApiMetricsHistoryData(limit ? parseInt(limit as unknown as string, 10) : undefined);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des métriques d\'API', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Récupère l\'historique des vérifications de santé',
    description: 'Retourne l\'historique des vérifications de santé du système'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Nombre maximum d\'entrées à retourner'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Historique de santé récupéré avec succès' 
  })
  getHealthHistory(@Query('limit') limit?: number) {
    try {
      return this.performanceService.getHealthHistoryData(limit ? parseInt(limit as unknown as string, 10) : undefined);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération de l\'historique de santé', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health/current')
  @ApiOperation({ 
    summary: 'Vérifie l\'état de santé actuel',
    description: 'Effectue une vérification de santé en temps réel et retourne le résultat'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Vérification de santé effectuée avec succès' 
  })
  async getCurrentHealth() {
    try {
      // Ce endpoint déclenche une vérification de santé en temps réel
      const health = await this.performanceService.getPerformanceDashboard();
      return health.systemHealth;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la vérification de santé', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 