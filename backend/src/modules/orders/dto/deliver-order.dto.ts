import { IsString, IsArray, IsOptional } from 'class-validator';

export class DeliverOrderDto {
  @IsString()
  @IsOptional()
  deliveryMessage?: string;

  @IsArray()
  @IsOptional()
  deliveryFiles?: string[];
} 