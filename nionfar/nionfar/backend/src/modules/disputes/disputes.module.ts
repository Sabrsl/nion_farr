import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { Dispute, DisputeSchema } from './schemas/dispute.schema';
// import { OrdersModule } from '../orders/orders.module'; // Commenté temporairement
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dispute.name, schema: DisputeSchema }
    ]),
    // OrdersModule, // Commenté temporairement pour éviter les dépendances circulaires
    UsersModule,
    NotificationsModule
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService]
})
export class DisputesModule {} 