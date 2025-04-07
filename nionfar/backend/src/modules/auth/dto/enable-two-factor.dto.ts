import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class EnableTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Code de vérification pour activer l\'authentification à deux facteurs',
  })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code est requis' })
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 caractères' })
  @Matches(/^[0-9]+$/, { message: 'Le code doit contenir uniquement des chiffres' })
  twoFactorCode: string;
} 