import { IsString, IsNumber, IsEnum, IsObject, Min } from 'class-validator';
import { WithdrawalMethod } from '../enums/withdrawal-method.enum';

export class WithdrawalDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(WithdrawalMethod)
  method: WithdrawalMethod;

  @IsObject()
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    phoneNumber?: string;
    walletId?: string;
  };
} 