import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop({ default: UserRole.CLIENT, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop({ default: UserStatus.PENDING_VERIFICATION, enum: Object.values(UserStatus) })
  status: UserStatus;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  avatar: string;

  @Prop()
  bio: string;

  @Prop([String])
  skills: string[];

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isIdentityVerified: boolean;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  phoneVerificationCode: string;
  
  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  lastLogin: Date;

  @Prop({ default: false })
  twoFactorAuthEnabled: boolean;

  @Prop()
  twoFactorAuthSecret: string;

  // Champs spécifiques pour les prestataires (freelancers)
  @Prop({ type: MongooseSchema.Types.Mixed })
  providerProfile: {
    title: string;
    description: string;
    experience: number;
    hourlyRate: number;
    languages: string[];
    education: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      from: Date;
      to: Date;
    }[];
    workExperience: {
      company: string;
      position: string;
      description: string;
      from: Date;
      to: Date;
      current: boolean;
    }[];
    portfolio: {
      title: string;
      description: string;
      imageUrl: string;
      link: string;
    }[];
    certificates: {
      name: string;
      issuer: string;
      date: Date;
      link: string;
    }[];
    availability: string;
    responseTime: string;
  };

  // Champs pour les statistiques et évaluations
  @Prop({ default: 0 })
  completedOrders: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop()
  memberSince: Date;

  // Champs pour la gestion des paiements
  @Prop({ type: MongooseSchema.Types.Mixed })
  paymentInfo: {
    accountType: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
    mobileMoneyProvider: string;
    mobileMoneyNumber: string;
  };

  // Préférences de notification
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    browserPush: boolean;
    orderUpdates: boolean;
    marketingEmails: boolean;
    newMessages: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User); 