import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendService } from './resend.service';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService, ResendService],
  exports: [EmailService, ResendService],
})
export class EmailModule {} 