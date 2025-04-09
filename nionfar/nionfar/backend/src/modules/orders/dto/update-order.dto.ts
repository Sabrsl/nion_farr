import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
} 