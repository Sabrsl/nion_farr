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

    // Créer le payload JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isFreelancer: user.isFreelancer,
    };

    // Générer le token JWT
    const accessToken = this.jwtService.sign(payload);

    // Retourner l'utilisateur connecté avec le token
    const { password: _, ...result } = user;
    
    return {
      message: 'Connexion réussie',
      accessToken,
      user: result,
    };
  }

  /**
   * Génère un token JWT pour l'authentification
   * @param user Utilisateur pour lequel générer le token
   * @returns Token JWT
   */
  private generateToken(user: User): string {
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role,
      isFreelancer: user.isFreelancer
    };
    
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
      secret: this.configService.get('JWT_SECRET')
    });
  }
} 