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
} from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { 
  createPaymentSchema,
  updatePaymentStatusSchema,
  withdrawalSchema,
  paymentWebhookSchema
} from '../schemas/payment.schema';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  createPayment(@Body() createPaymentDto: any, @Request() req) {
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
  @UsePipes(new ZodValidationPipe(paymentWebhookSchema))
  handleWebhook(@Body() webhookData: any) {
    return this.paymentsService.handleWebhook(webhookData);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updatePaymentStatusSchema))
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return this.paymentsService.updateStatus(id, statusData);
  }

  @Post('withdrawal')
  @UsePipes(new ZodValidationPipe(withdrawalSchema))
  requestWithdrawal(@Body() withdrawalDto: any, @Request() req) {
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