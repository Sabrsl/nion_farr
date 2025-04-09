import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TwoFactorSecret extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  secret: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TwoFactorSecretSchema = SchemaFactory.createForClass(TwoFactorSecret);

// Index pour la recherche rapide par userId
TwoFactorSecretSchema.index({ userId: 1 }, { unique: true });

// Index TTL pour nettoyer les secrets non vérifiés après 24h
TwoFactorSecretSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 24 * 60 * 60, partialFilterExpression: { verified: false } }
); 