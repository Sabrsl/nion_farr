import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../models/user.model';

export class CreateUserDto {
  @ApiProperty({
    description: 'Le prénom de l\'utilisateur',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Le nom de l\'utilisateur',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'L\'adresse email de l\'utilisateur',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Le mot de passe de l\'utilisateur',
    example: 'Password123!',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Le nom d\'utilisateur unique',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Le rôle de l\'utilisateur',
    enum: UserRole,
    default: UserRole.CLIENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Le numéro de téléphone de l\'utilisateur',
    example: '+221xxxxxxxxx',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
} 