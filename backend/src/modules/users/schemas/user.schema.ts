import { z } from 'zod';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Schéma de base pour la création d'un utilisateur
export const createUserSchema = z.object({
  email: z
    .string()
    .email({ message: 'Adresse e-mail invalide' })
    .min(5, { message: 'L\'e-mail doit contenir au moins 5 caractères' })
    .max(255, { message: 'L\'e-mail ne peut pas dépasser 255 caractères' }),
  
  firstName: z
    .string()
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' }),
  
  lastName: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
  
  username: z
    .string()
    .min(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' })
    .max(50, { message: 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères' })
    .optional(),
  
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .max(100, { message: 'Le mot de passe ne peut pas dépasser 100 caractères' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre' 
    }),
  
  role: z
    .nativeEnum(UserRole)
    .optional()
    .default(UserRole.CLIENT),
  
  status: z
    .nativeEnum(UserStatus)
    .optional()
    .default(UserStatus.PENDING_VERIFICATION),
  
  phone: z
    .string()
    .min(8, { message: 'Le numéro de téléphone doit contenir au moins 8 caractères' })
    .max(20, { message: 'Le numéro de téléphone ne peut pas dépasser 20 caractères' })
    .optional(),
  
  address: z
    .string()
    .max(255, { message: 'L\'adresse ne peut pas dépasser 255 caractères' })
    .optional(),
  
  city: z
    .string()
    .max(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
    .optional(),
  
  country: z
    .string()
    .max(100, { message: 'Le pays ne peut pas dépasser 100 caractères' })
    .optional(),
  
  bio: z
    .string()
    .max(1000, { message: 'La biographie ne peut pas dépasser 1000 caractères' })
    .optional(),
  
  skills: z
    .array(z.string())
    .max(20, { message: 'Maximum 20 compétences autorisées' })
    .optional(),
  
  isFreelancer: z
    .boolean()
    .optional()
    .default(false),
  
  avatar: z
    .string()
    .url({ message: 'URL d\'avatar invalide' })
    .optional(),
  
  bioText: z
    .string()
    .max(5000, { message: 'Le texte biographique ne peut pas dépasser 5000 caractères' })
    .optional(),
});

// Schéma pour le profil prestataire
export const providerProfileSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Le titre doit contenir au moins 5 caractères' })
    .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
  
  description: z
    .string()
    .min(50, { message: 'La description doit contenir au moins 50 caractères' })
    .max(1000, { message: 'La description ne peut pas dépasser 1000 caractères' }),
  
  experience: z
    .number()
    .int()
    .min(0, { message: 'L\'expérience ne peut pas être négative' })
    .max(100, { message: 'L\'expérience ne peut pas dépasser 100 ans' }),
  
  hourlyRate: z
    .number()
    .min(1000, { message: 'Le taux horaire minimum est de 1000 FCFA' })
    .max(100000, { message: 'Le taux horaire maximum est de 100000 FCFA' }),
  
  languages: z
    .array(z.string())
    .min(1, { message: 'Au moins une langue est requise' })
    .max(10, { message: 'Maximum 10 langues autorisées' }),
  
  responseTime: z
    .string()
    .min(2, { message: 'Le temps de réponse doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le temps de réponse ne peut pas dépasser 50 caractères' }),
  
  availability: z
    .string()
    .min(2, { message: 'La disponibilité doit contenir au moins 2 caractères' })
    .max(100, { message: 'La disponibilité ne peut pas dépasser 100 caractères' }),
});

// Schéma pour les informations de paiement
export const paymentInfoSchema = z.object({
  accountType: z
    .string()
    .min(2, { message: 'Le type de compte doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le type de compte ne peut pas dépasser 50 caractères' })
    .optional(),
  
  accountName: z
    .string()
    .min(2, { message: 'Le nom du compte doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom du compte ne peut pas dépasser 100 caractères' })
    .optional(),
  
  accountNumber: z
    .string()
    .min(5, { message: 'Le numéro de compte doit contenir au moins 5 caractères' })
    .max(50, { message: 'Le numéro de compte ne peut pas dépasser 50 caractères' })
    .optional(),
  
  bankName: z
    .string()
    .min(2, { message: 'Le nom de la banque doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom de la banque ne peut pas dépasser 100 caractères' })
    .optional(),
  
  swiftCode: z
    .string()
    .min(8, { message: 'Le code SWIFT doit contenir au moins 8 caractères' })
    .max(11, { message: 'Le code SWIFT ne peut pas dépasser 11 caractères' })
    .optional(),
  
  mobileMoneyProvider: z
    .string()
    .min(2, { message: 'Le fournisseur de mobile money doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le fournisseur de mobile money ne peut pas dépasser 50 caractères' })
    .optional(),
  
  mobileMoneyNumber: z
    .string()
    .min(8, { message: 'Le numéro de mobile money doit contenir au moins 8 caractères' })
    .max(20, { message: 'Le numéro de mobile money ne peut pas dépasser 20 caractères' })
    .optional(),
});

// Schéma pour les préférences de notification
export const notificationPreferencesSchema = z.object({
  email: z.boolean().optional().default(true),
  sms: z.boolean().optional().default(true),
  browserPush: z.boolean().optional().default(true),
  orderUpdates: z.boolean().optional().default(true),
  marketingEmails: z.boolean().optional().default(true),
  newMessages: z.boolean().optional().default(true),
});

// Schéma complet pour l'utilisateur
export const fullUserSchema = createUserSchema.extend({
  providerProfile: providerProfileSchema.optional(),
  paymentInfo: paymentInfoSchema.optional(),
  notificationPreferences: notificationPreferencesSchema.optional(),
});

// Schéma pour la mise à jour de l'utilisateur (tous les champs sont optionnels)
export const updateUserSchema = createUserSchema
  .omit({ password: true }) // Exclure le mot de passe des mises à jour générales
  .extend({
    providerProfile: providerProfileSchema.optional(),
    paymentInfo: paymentInfoSchema.optional(),
    notificationPreferences: notificationPreferencesSchema.optional(),
  })
  .partial();

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Le mot de passe actuel est requis' }),
  newPassword: z
    .string()
    .min(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
    .max(100, { message: 'Le nouveau mot de passe ne peut pas dépasser 100 caractères' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre' 
    }),
  confirmPassword: z.string().min(1, { message: 'La confirmation du mot de passe est requise' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ProviderProfileDto = z.infer<typeof providerProfileSchema>;
export type PaymentInfoDto = z.infer<typeof paymentInfoSchema>;
export type NotificationPreferencesDto = z.infer<typeof notificationPreferencesSchema>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 