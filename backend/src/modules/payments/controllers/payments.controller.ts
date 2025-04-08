import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { Public } from '../../auth/decorators/public.decorator';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { WithdrawalDto } from '../dto/withdrawal.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.createPayment(createPaymentDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('user')
  findUserPayments(@Request() req) {
    return this.paymentsService.findUserPayments(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.paymentsService.findOne(id, req.user);
  }

  @Post('webhook')
  @Public()
  @UsePipes(ValidationPipe)
  handleWebhook(@Body() webhookData: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(webhookData);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UsePipes(ValidationPipe)
  updateStatus(@Param('id') id: string, @Body() statusData: UpdatePaymentStatusDto) {
    return this.paymentsService.updateStatus(id, statusData);
  }

  @Post('withdrawal')
  @UsePipes(ValidationPipe)
  requestWithdrawal(@Body() withdrawalDto: WithdrawalDto, @Request() req) {
    return this.paymentsService.requestWithdrawal(withdrawalDto, req.user.id);
  }

  @Get('withdrawal/history')
  getWithdrawalHistory(@Request() req) {
    return this.paymentsService.getWithdrawalHistory(req.user.id);
  }

  @Get('transactions')
  getUserTransactions(@Request() req) {
    return this.paymentsService.getUserTransactions(req.user.id);
  }

  @Get('balance')
  getUserBalance(@Request() req) {
    return this.paymentsService.getUserBalance(req.user.id);
  }
} 