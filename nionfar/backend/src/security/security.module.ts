import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityMiddleware } from './security.middleware';
import { AuditLogService } from './audit-log.service';

@Module({
  providers: [SecurityService, AuditLogService],
  exports: [SecurityService, AuditLogService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
} 