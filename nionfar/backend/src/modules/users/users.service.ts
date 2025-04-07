import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  async create(user: any): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    
    // Hash du mot de passe avant de sauvegarder
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    
    return this.usersRepository.save(user);
  }

  async update(id: string, updatedUser: any): Promise<User> {
    const user = await this.findOne(id);
    
    // Si on essaie de changer l'email, vérifier qu'il n'existe pas déjà
    if (updatedUser.email && updatedUser.email !== user.email) {
      const existingUser = await this.findByEmail(updatedUser.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }
    
    // Ne pas mettre à jour le mot de passe via cette méthode
    if (updatedUser.password) {
      delete updatedUser.password;
    }
    
    await this.usersRepository.update(id, updatedUser);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  
  async changePassword(userId: string, changePasswordDto: any): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password'] // S'assurer qu'on récupère le mot de passe hashé
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    // Hash et mettre à jour le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
  
  async findFreelancers(): Promise<User[]> {
    return this.usersRepository.find({ 
      where: { 
        isFreelancer: true,
        isActive: true
      },
      order: {
        rating: 'DESC'
      }
    });
  }
} 