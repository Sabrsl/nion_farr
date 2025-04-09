import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cette adresse email existe déjà');
    }

    // Vérifier si le nom d'utilisateur existe déjà (s'il est fourni)
    if (createUserDto.username) {
      const existingUsername = await this.userModel.findOne({ username: createUserDto.username }).exec();
      if (existingUsername) {
        throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
      }
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer le nouvel utilisateur
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      memberSince: new Date(),
    });

    // Sauvegarder et retourner l'utilisateur
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
    }

    // Si le mot de passe est fourni, le hacher
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .select('-password')
      .exec();

    return updatedUser;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
    }

    return { deleted: true, message: `Utilisateur avec ID "${id}" supprimé avec succès` };
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
} 