import { Controller, Get, Logger } from '@nestjs/common';
import { SecurityService } from './security.service';
import { Public } from '../modules/auth/decorators/public.decorator';

@Controller('security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  constructor(private readonly securityService: SecurityService) {}

  @Public()
  @Get('csrf-tokens')
  getCsrfToken() {
    try {
      const token = this.securityService.generateCsrfToken();
      this.logger.debug('Generated new CSRF token');
      return { token };
    } catch (error) {
      this.logger.error(`Error generating CSRF token: ${error.message}`);
      throw error;
    }
  }
} 