import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeReason } from '../schemas/dispute.schema';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'ID de la commande concernée par le litige',
    example: '5f9d4a3b9d1d2b001c8e0d9a'
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Raison du litige',
    enum: DisputeReason,
    example: DisputeReason.QUALITY_NOT_AS_EXPECTED
  })
  @IsNotEmpty()
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty({
    description: 'Description détaillée du problème',
    example: 'Le travail livré ne correspond pas du tout à mes attentes. Les couleurs sont différentes de celles demandées et le design ne respecte pas mes consignes.'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Liens vers des pièces jointes justificatives',
    example: ['/uploads/evidence1.jpg', '/uploads/evidence2.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];
} 