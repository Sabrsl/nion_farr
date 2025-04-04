import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Envoyer une notification' })
  async sendNotification(
    @Body() notificationData: { userId: string; message: string },
  ): Promise<{ success: boolean }> {
    await this.notificationsService.sendNotification(
      notificationData.userId,
      notificationData.message,
    );
    return { success: true };
  }
} 