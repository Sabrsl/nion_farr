import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrdersService } from '../orders.service';

/**
 * Guard qui empêche un utilisateur de commander son propre service
 */
@Injectable()
export class SelfOrderGuard implements CanActivate {
  constructor(private ordersService: OrdersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const createOrderDto = request.body;

    if (!user || !createOrderDto.serviceId) {
      return true; // Let the controller handle validation errors
    }

    // Get the service to check if the provider is the same as the current user
    const service = await this.ordersService.getServiceById(createOrderDto.serviceId);
    
    if (service.providerId === user.id) {
      throw new ForbiddenException('Vous ne pouvez pas commander votre propre service');
    }

    return true;
  }
} 