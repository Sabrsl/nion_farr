import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    description: 'ID de l\'utilisateur',
  })
  @IsUUID('4', { message: 'L\'ID utilisateur doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID utilisateur est requis' })
  userId: string;

  @ApiProperty({
    example: '123456',
    description: 'Code de vérification pour l\'authentification à deux facteurs',
  })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code est requis' })
  twoFactorCode: string;
} 