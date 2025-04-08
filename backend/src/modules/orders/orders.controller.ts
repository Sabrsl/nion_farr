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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/schemas/user.schema';
import { Request } from 'express';

interface RequestWithUser {
  user: {
    _id: string;
    role: UserRole;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Crée une nouvelle commande
   */
  @Post()
  @Roles(UserRole.CLIENT)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: RequestWithUser) {
    return this.ordersService.create(createOrderDto, req.user._id);
  }

  /**
   * Récupère toutes les commandes
   */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * Récupère les commandes d'un client
   */
  @Get('client')
  @Roles(UserRole.CLIENT)
  findByClient(@Req() req: RequestWithUser) {
    return this.ordersService.findByClient(req.user._id);
  }

  /**
   * Récupère les commandes d'un freelance
   */
  @Get('freelancer')
  @Roles(UserRole.FREELANCER)
  findByFreelancer(@Req() req: RequestWithUser) {
    return this.ordersService.findByFreelancer(req.user._id);
  }

  /**
   * Récupère une commande spécifique
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  /**
   * Met à jour une commande
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * Supprime une commande
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Post(':id/accept')
  @Roles(UserRole.FREELANCER)
  accept(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.ordersService.accept(id, req.user._id);
  }

  @Post(':id/complete')
  @Roles(UserRole.FREELANCER)
  complete(
    @Param('id') id: string,
    @Body('completionMessage') completionMessage: string
  ) {
    return this.ordersService.complete(id, completionMessage);
  }

  @Post(':id/cancel')
  @Roles(UserRole.CLIENT, UserRole.FREELANCER)
  cancel(
    @Param('id') id: string,
    @Body('cancellationReason') cancellationReason: string
  ) {
    return this.ordersService.cancel(id, cancellationReason);
  }
} 