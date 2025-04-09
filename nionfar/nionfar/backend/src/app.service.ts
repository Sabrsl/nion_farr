import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bienvenue sur l\'API de NionFar - Plateforme de services freelance au Sénégal';
  }
} 