import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../../audit/audit.module';
import { authenticator } from 'otplib';

describe('Two Factor Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let twoFactorSecret: string;
  let twoFactorCode: string;

  beforeAll(async () => {
    // Configuration du module de test
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/nionfar-test',
          }),
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        AuditModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Créer un utilisateur de test et obtenir un token JWT
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test2fa@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'CLIENT',
      })
      .expect(201);

    userId = registerResponse.body.user.id;
    authToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Two Factor Authentication Flow', () => {
    it('should generate a 2FA secret and QR code', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/two-factor/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);

      twoFactorSecret = response.body.secret;
    });

    it('should verify a valid 2FA code', async () => {
      // Générer un code TOTP valide
      twoFactorCode = authenticator.generate(twoFactorSecret);

      const response = await request(app.getHttpServer())
        .post('/auth/two-factor/verify')
        .send({
          userId,
          twoFactorCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Code vérifié avec succès');
    });

    it('should reject an invalid 2FA code', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/two-factor/verify')
        .send({
          userId,
          twoFactorCode: '000000',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Code 2FA invalide');
    });

    it('should enable 2FA for the user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/two-factor/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          twoFactorCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Authentification à deux facteurs activée avec succès');
    });

    it('should check if 2FA is enabled', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/two-factor/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isEnabled', true);
    });

    it('should disable 2FA for the user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/two-factor/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Authentification à deux facteurs désactivée avec succès');
    });

    it('should confirm 2FA is disabled', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/two-factor/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isEnabled', false);
    });
  });
}); 