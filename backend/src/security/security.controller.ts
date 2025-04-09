import { Controller, Get, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { SecurityService } from './security.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('csrf-tokens')
  async getCsrfTokens(@Res() res: Response) {
    try {
      const sessionId = uuidv4();
      const csrfToken = await this.securityService.generateCsrfToken(sessionId);

      return res.json({
        csrfToken,
        sessionId,
      });
    } catch (error) {
      throw new UnauthorizedException('Failed to generate CSRF tokens');
    }
  }
} 