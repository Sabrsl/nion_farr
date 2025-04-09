import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './controllers/services.service';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceOption } from './entities/service-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory, ServiceOption])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule {} 