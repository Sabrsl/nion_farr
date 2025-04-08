import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
} 