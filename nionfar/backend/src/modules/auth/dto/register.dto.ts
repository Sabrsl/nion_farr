import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email de l\'utilisateur',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom de l\'utilisateur',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Nom de famille de l\'utilisateur',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @ApiProperty({
    example: '+221777777777',
    description: 'Numéro de téléphone (optionnel)',
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères' })
  phoneNumber?: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd123',
    description: 'Mot de passe (minimum 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial)',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre ou un caractère spécial',
  })
  password: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd123',
    description: 'Confirmation du mot de passe',
  })
  @IsString({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La confirmation du mot de passe est requise' })
  passwordConfirm: string;

  @ApiProperty({
    example: true,
    description: 'Acceptation des conditions d\'utilisation',
    default: false,
  })
  @IsNotEmpty({ message: 'Vous devez accepter les conditions d\'utilisation' })
  termsAccepted: boolean;
} 