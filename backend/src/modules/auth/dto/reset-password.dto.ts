import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    description: 'Token de réinitialisation de mot de passe',
  })
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd123',
    description: 'Nouveau mot de passe',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
  })
  newPassword: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd123',
    description: 'Confirmation du nouveau mot de passe',
  })
  @IsString({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La confirmation du mot de passe est requise' })
  passwordConfirmation: string;
} 