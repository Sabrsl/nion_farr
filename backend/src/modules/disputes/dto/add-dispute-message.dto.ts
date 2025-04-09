import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddDisputeMessageDto {
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Voici des informations supplémentaires concernant le problème rencontré.'
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Pièces jointes au message',
    example: ['/uploads/attachment1.jpg', '/uploads/attachment2.pdf'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
} 