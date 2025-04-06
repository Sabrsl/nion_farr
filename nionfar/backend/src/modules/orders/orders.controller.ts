import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SelfOrderGuard } from './guards/self-order.guard';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Crée une nouvelle commande
   * Utilise SelfOrderGuard pour empêcher un utilisateur de commander son propre service
   */
  @Post()
  @UseGuards(JwtAuthGuard, SelfOrderGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    // Extraire l'ID de l'utilisateur authentifié de la requête
    const userId = req.user['id'];
    
    // Ajouter automatiquement l'ID du client à partir de l'utilisateur connecté
    createOrderDto.clientId = userId;
    
    // Ajouter l'ID du vendeur à partir du service (sera vérifié dans le service)
    const service = await this.ordersService.getServiceById(createOrderDto.serviceId);
    createOrderDto.freelancerId = service.providerId;
    
    return this.ordersService.create(createOrderDto);
  }

  /**
   * Récupère toutes les commandes
   * Limite l'accès aux administrateurs
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query, @Req() req: Request) {
    // Vérifier si l'utilisateur est admin
    const isAdmin = req.user['role'] === 'admin';
    if (!isAdmin) {
      return this.ordersService.findAllByUser(req.user['id']);
    }
    return this.ordersService.findAll(query);
  }

  /**
   * Récupère les commandes d'un client spécifique
   */
  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  findByClient(@Param('clientId') clientId: string, @Req() req: Request) {
    // Vérifier que l'utilisateur demande ses propres commandes ou est admin
    const userId = req.user['id'];
    const isAdmin = req.user['role'] === 'admin';
    
    if (userId !== clientId && !isAdmin) {
      return { message: 'Non autorisé', orders: [] };
    }
    
    return this.ordersService.findByClient(clientId);
  }

  /**
   * Récupère les commandes d'un vendeur spécifique
   */
  @Get('freelancer/:freelancerId')
  @UseGuards(JwtAuthGuard)
  findByFreelancer(@Param('freelancerId') freelancerId: string, @Req() req: Request) {
    // Vérifier que l'utilisateur demande ses propres commandes ou est admin
    const userId = req.user['id'];
    const isAdmin = req.user['role'] === 'admin';
    
    if (userId !== freelancerId && !isAdmin) {
      return { message: 'Non autorisé', orders: [] };
    }
    
    return this.ordersService.findByFreelancer(freelancerId);
  }

  /**
   * Récupère une commande spécifique
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.ordersService.findOne(id);
  }

  /**
   * Met à jour une commande
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Req() req: Request) {
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * Supprime une commande (admin uniquement)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    // Vérifier si l'utilisateur est admin
    const isAdmin = req.user['role'] === 'admin';
    if (!isAdmin) {
      return { message: 'Non autorisé' };
    }
    
    return this.ordersService.remove(id);
  }
} 