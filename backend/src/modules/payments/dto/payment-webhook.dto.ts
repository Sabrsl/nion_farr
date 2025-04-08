import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentWebhookDto {
  @IsString()
  transactionId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  providerTransactionId?: string;

  @IsObject()
  @IsOptional()
  providerResponse?: Record<string, any>;

  @IsString()
  @IsOptional()
  failureReason?: string;
} 