import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../models/user.model';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Le prénom de l\'utilisateur',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Le nom de l\'utilisateur',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'L\'adresse email de l\'utilisateur',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Le mot de passe de l\'utilisateur',
    example: 'Password123!',
    required: false,
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

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
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Le statut de l\'utilisateur',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Le numéro de téléphone de l\'utilisateur',
    example: '+221xxxxxxxxx',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'L\'adresse de l\'utilisateur',
    example: 'Dakar, Sénégal',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'La ville de l\'utilisateur',
    example: 'Dakar',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Le pays de l\'utilisateur',
    example: 'Sénégal',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'L\'URL de l\'avatar de l\'utilisateur',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'La biographie de l\'utilisateur',
    example: 'Je suis un développeur web passionné...',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
} 