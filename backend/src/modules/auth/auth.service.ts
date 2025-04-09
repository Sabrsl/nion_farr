import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../users/enums/user-role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, passwordConfirm, firstName, lastName, role, isFreelancer } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier que les mots de passe correspondent
    if (password !== passwordConfirm) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer un username à partir du prénom et nom
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

    // Créer un nouvel utilisateur
    const newUser = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      username,
      isActive: true,
      status: UserStatus.PENDING_VERIFICATION,
      role: role || UserRole.CLIENT,
      isFreelancer: isFreelancer || false,
      emailVerificationToken: Math.random().toString(36).substring(2, 15),
    });
    
    // Sauvegarder l'utilisateur
    const savedUser = await this.usersRepository.save(newUser);

    // Retourner l'utilisateur sans le mot de passe et le token
    const { password: _, emailVerificationToken: __, ...result } = savedUser;
    
    return {
      message: 'Inscription réussie',
      user: result,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Trouver l'utilisateur par email
    const user = await this.usersRepository.findOne({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isFreelancer: true,
        firstName: true,
        lastName: true,
        username: true,
        isActive: true,
        status: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_VERIFICATION) {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // Générer les tokens
    const tokens = this.generateTokens(user);

    // Retourner l'utilisateur connecté avec les tokens
    const { password: _, ...result } = user;
    
    return {
      message: 'Connexion réussie',
      ...tokens,
      user: result,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const { refreshToken } = refreshTokenDto;
      
      if (!refreshToken) {
        throw new UnauthorizedException('Token de rafraîchissement non fourni');
      }

      // Vérifier la validité du token de rafraîchissement
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Trouver l'utilisateur
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
      }

      // Générer de nouveaux tokens
      const tokens = this.generateTokens(user);
      
      return {
        message: 'Tokens renouvelés avec succès',
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }
  }

  /**
   * Génère les tokens JWT pour l'authentification
   * @param user Utilisateur pour lequel générer les tokens
   * @returns Tokens JWT (access et refresh)
   */
  private generateTokens(user: User): { accessToken: string, refreshToken: string } {
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role,
      isFreelancer: user.isFreelancer
    };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
      secret: this.configService.get('JWT_SECRET')
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    
    return { accessToken, refreshToken };
  }
} 