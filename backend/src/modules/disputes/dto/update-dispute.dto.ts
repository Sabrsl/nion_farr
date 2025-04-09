import { IsOptional, IsString, IsEnum, IsNumber, Min, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus } from '../schemas/dispute.schema';

export class UpdateDisputeDto {
  @ApiPropertyOptional({
    description: 'Statut du litige',
    enum: DisputeStatus,
    example: DisputeStatus.UNDER_REVIEW
  })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Commentaires sur la mise à jour du statut',
    example: 'Mise à jour après examen des pièces fournies'
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    description: 'Résolution détaillée du litige',
    example: 'Après examen des pièces fournies, nous avons déterminé que le travail livré ne correspond pas aux exigences. Un remboursement partiel sera effectué.'
  })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({
    description: 'Montant du remboursement (en cas de résolution)',
    example: 25000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiPropertyOptional({
    description: 'Pièces jointes supplémentaires',
    example: ['/uploads/resolution-proof.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalEvidence?: string[];
} 