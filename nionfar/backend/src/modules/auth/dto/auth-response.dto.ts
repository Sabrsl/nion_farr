import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/enums/user-role.enum';

export class UserInfoDto {
  @ApiProperty({
    description: 'Identifiant unique de l\'utilisateur',
    example: '5f8d0c1b9c1c9b1d9c1c9b1d',
  })
  id: string;

  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: UserRole.CLIENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indique si l\'utilisateur est un freelancer',
    example: false,
    type: Boolean,
  })
  isFreelancer: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token d\'authentification JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Informations sur l\'utilisateur',
    type: UserInfoDto,
  })
  user: UserInfoDto;
} 