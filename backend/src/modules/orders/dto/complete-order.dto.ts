import { IsString, IsOptional } from 'class-validator';

export class CompleteOrderDto {
  @IsString()
  @IsOptional()
  completionMessage?: string;
} 