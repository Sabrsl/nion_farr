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
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam 
} from '@nestjs/swagger';

import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau litige' })
  @ApiResponse({ status: 201, description: 'Litige créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async create(@Body() createDisputeDto: CreateDisputeDto, @Request() req) {
    try {
      return await this.disputesService.create(createDisputeDto, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Création du litige impossible: ' + error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les litiges' })
  @ApiResponse({ status: 200, description: 'Litiges récupérés avec succès' })
  async findAll(@Request() req) {
    const { id, role } = req.user;
    
    // Seuls les admins peuvent voir tous les litiges
    // Les autres ne voient que leurs propres litiges
    return this.disputesService.findAll(id, role);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les litiges (admin)' })
  @ApiResponse({ status: 200, description: 'Litiges récupérés avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async findAllAdmin() {
    return this.disputesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un litige par ID' })
  @ApiParam({ name: 'id', description: 'ID du litige' })
  @ApiResponse({ status: 200, description: 'Litige récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Litige non trouvé' })
  async findOne(@Param('id') id: string, @Request() req) {
    const dispute = await this.disputesService.findOne(id);
    
    // Vérifier les permissions (sauf pour l'admin)
    if (req.user.role !== UserRole.ADMIN) {
      const order = await this.disputesService.getOrder(dispute.order.toString());
      const isInvolved = order.client.toString() === req.user.id || 
                        order.provider.toString() === req.user.id;
      
      if (!isInvolved) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à ce litige');
      }
    }
    
    return dispute;
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Récupérer un litige par ID de commande' })
  @ApiParam({ name: 'orderId', description: 'ID de la commande' })
  @ApiResponse({ status: 200, description: 'Litige récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Litige non trouvé' })
  async findByOrder(@Param('orderId') orderId: string, @Request() req) {
    const dispute = await this.disputesService.findByOrder(orderId);
    
    // Vérifier les permissions (sauf pour l'admin)
    if (req.user.role !== UserRole.ADMIN) {
      const order = await this.disputesService.getOrder(dispute.order.toString());
      const isInvolved = order.client.toString() === req.user.id || 
                        order.provider.toString() === req.user.id;
      
      if (!isInvolved) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à ce litige');
      }
    }
    
    return dispute;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un litige' })
  @ApiParam({ name: 'id', description: 'ID du litige' })
  @ApiResponse({ status: 200, description: 'Litige mis à jour avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Litige non trouvé' })
  async update(
    @Param('id') id: string, 
    @Body() updateDisputeDto: UpdateDisputeDto, 
    @Request() req
  ) {
    // Les utilisateurs non-admin ne peuvent changer que certains statuts
    const isAdmin = req.user.role === UserRole.ADMIN;
    
    if (!isAdmin && updateDisputeDto.status) {
      const allowedStatusForUsers = ['pending']; // Statuts autorisés pour les utilisateurs non-admin
      
      if (!allowedStatusForUsers.includes(updateDisputeDto.status)) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à changer le statut de ce litige');
      }
    }
    
    return this.disputesService.update(id, updateDisputeDto, req.user.id, isAdmin);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Ajouter un message à un litige' })
  @ApiParam({ name: 'id', description: 'ID du litige' })
  @ApiResponse({ status: 201, description: 'Message ajouté avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Litige non trouvé' })
  async addMessage(
    @Param('id') id: string, 
    @Body() messageDto: AddDisputeMessageDto, 
    @Request() req
  ) {
    return this.disputesService.addMessage(id, messageDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un litige (admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du litige' })
  @ApiResponse({ status: 200, description: 'Litige supprimé avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Litige non trouvé' })
  async remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    await this.disputesService.remove(id, isAdmin);
    return { message: 'Litige supprimé avec succès' };
  }
} 