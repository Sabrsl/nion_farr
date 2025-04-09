import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('api')
export class IpController {
  @Get('ip')
  getIp(@Req() req: Request) {
    const ip = req.ip || req.connection.remoteAddress;
    return { ip };
  }
} 