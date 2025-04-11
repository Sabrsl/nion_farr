import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './controllers/services.service';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceOption } from './entities/service-option.entity';
import { ServiceValidationResult } from './entities/service-validation-result.entity';
import { ServiceValidationHistory } from './entities/service-validation-history.entity';
import { ServiceValidationController } from './controllers/service-validation.controller';
import { ServiceValidationService } from './services/service-validation.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service, 
      ServiceCategory, 
      ServiceOption, 
      ServiceValidationResult, 
      ServiceValidationHistory
    ]),
    UsersModule
  ],
  controllers: [ServicesController, ServiceValidationController],
  providers: [ServicesService, ServiceValidationService],
  exports: [ServicesService, ServiceValidationService]
})
export class ServicesModule {} 