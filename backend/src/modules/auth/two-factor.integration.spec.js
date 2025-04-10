"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const auth_module_1 = require("./auth.module");
const users_module_1 = require("../users/users.module");
const audit_module_1 = require("../../audit/audit.module");
const otplib_1 = require("otplib");
describe('Two Factor Authentication (e2e)', () => {
    let app;
    let authToken;
    let userId;
    let twoFactorSecret;
    let twoFactorCode;
    beforeAll(async () => {
        // Configuration du module de test
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                }),
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: async (configService) => ({
                        uri: configService.get('MONGODB_URI') || 'mongodb://localhost:27017/nionfar-test',
                    }),
                    inject: [config_1.ConfigService],
                }),
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: async (configService) => ({
                        secret: configService.get('JWT_SECRET') || 'test-secret',
                        signOptions: { expiresIn: '1h' },
                    }),
                    inject: [config_1.ConfigService],
                }),
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                audit_module_1.AuditModule,
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe());
        await app.init();
        // Créer un utilisateur de test et obtenir un token JWT
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
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
            const response = await (0, supertest_1.default)(app.getHttpServer())
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
            twoFactorCode = otplib_1.authenticator.generate(twoFactorSecret);
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/two-factor/verify')
                .send({
                userId,
                twoFactorCode,
            })
                .expect(200);
            expect(response.body).toHaveProperty('message', 'Code vérifié avec succès');
        });
        it('should reject an invalid 2FA code', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/two-factor/verify')
                .send({
                userId,
                twoFactorCode: '000000',
            })
                .expect(401);
            expect(response.body).toHaveProperty('message', 'Code 2FA invalide');
        });
        it('should enable 2FA for the user', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/two-factor/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                twoFactorCode,
            })
                .expect(200);
            expect(response.body).toHaveProperty('message', 'Authentification à deux facteurs activée avec succès');
        });
        it('should check if 2FA is enabled', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/auth/two-factor/status')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('isEnabled', true);
        });
        it('should disable 2FA for the user', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/two-factor/disable')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message', 'Authentification à deux facteurs désactivée avec succès');
        });
        it('should confirm 2FA is disabled', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/auth/two-factor/status')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('isEnabled', false);
        });
    });
});
