import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { 
  createOrderSchema,
  updateOrderSchema,
  deliverOrderSchema,
  updateOrderStatusSchema,
  requestRevisionSchema,
  cancelOrderSchema,
  acceptOrderSchema
} from '../schemas/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  create(@Body() createOrderDto: any, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, req.user);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  update(@Param('id') id: string, @Body() updateOrderDto: any, @Request() req) {
    return this.ordersService.update(id, updateOrderDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Post(':id/deliver')
  @UsePipes(new ZodValidationPipe(deliverOrderSchema))
  deliver(@Param('id') id: string, @Body() deliverOrderDto: any, @Request() req) {
    return this.ordersService.deliver(id, deliverOrderDto, req.user);
  }

  @Post(':id/accept')
  @UsePipes(new ZodValidationPipe(acceptOrderSchema))
  accept(@Param('id') id: string, @Body() acceptOrderDto: any, @Request() req) {
    return this.ordersService.accept(id, acceptOrderDto, req.user);
  }

  @Post(':id/revision')
  @UsePipes(new ZodValidationPipe(requestRevisionSchema))
  requestRevision(@Param('id') id: string, @Body() revisionDto: any, @Request() req) {
    return this.ordersService.requestRevision(id, revisionDto, req.user);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Request() req) {
    return this.ordersService.complete(id, req.user);
  }

  @Post(':id/cancel')
  @UsePipes(new ZodValidationPipe(cancelOrderSchema))
  cancel(@Param('id') id: string, @Body() cancelDto: any, @Request() req) {
    return this.ordersService.cancel(id, cancelDto, req.user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateOrderStatusSchema))
  updateStatus(@Param('id') id: string, @Body() statusDto: any) {
    return this.ordersService.updateStatus(id, statusDto);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN)
  findByClient(@Param('clientId') clientId: string) {
    return this.ordersService.findByClient(clientId);
  }

  @Get('freelancer/:freelancerId')
  @Roles(UserRole.ADMIN)
  findByFreelancer(@Param('freelancerId') freelancerId: string) {
    return this.ordersService.findByFreelancer(freelancerId);
  }
} 