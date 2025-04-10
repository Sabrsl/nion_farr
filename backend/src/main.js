"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const express_rate_limit_1 = require("express-rate-limit");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const Sentry = __importStar(require("@sentry/node"));
const check_env_1 = require("./config/check-env");
async function bootstrap() {
    console.log('Starting server...');
    console.log('Current directory:', process.cwd());
    // Vérifier les variables d'environnement requises
    (0, check_env_1.checkRequiredEnvVars)();
    console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        API_PREFIX: process.env.API_PREFIX,
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
    try {
        // Configuration du logger
        const logger = nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                }),
            ],
        });
        console.log('Initializing application...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger,
            abortOnError: false
        });
        console.log('Application created, getting config service...');
        const configService = app.get(config_1.ConfigService);
        // Variables d'environnement
        const apiPrefix = configService.get('API_PREFIX') || 'api';
        const environment = configService.get('NODE_ENV') || 'development';
        const port = parseInt(process.env.PORT, 10) || 3000;
        console.log(`Environment: ${environment}`);
        console.log(`MongoDB URI: ${configService.get('MONGODB_URI')}`);
        // Configuration Sentry en production
        if (environment === 'production') {
            const sentryDsn = configService.get('SENTRY_DSN');
            if (sentryDsn) {
                try {
                    Sentry.init({
                        dsn: sentryDsn,
                        environment,
                        // Performance monitoring de base
                        tracesSampleRate: 1.0,
                        // Désactivation du profiling
                        profilesSampleRate: 0.0,
                    });
                    console.log('Sentry initialized for error tracking');
                }
                catch (error) {
                    console.error('Failed to initialize Sentry:', error);
                }
            }
        }
        // Middlewares de sécurité
        app.use((0, helmet_1.default)());
        // Rate limiting
        app.use((0, express_rate_limit_1.rateLimit)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        }));
        // CORS - Configuration pour la production et le développement
        const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const allowedOrigins = configService.get('CORS_ALLOWED_ORIGINS')?.split(',') || [frontendUrl];
        app.enableCors({
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
            credentials: true,
            maxAge: 3600,
        });
        // Compression
        app.use((0, compression_1.default)());
        // Validation globale
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        // Préfixe global de l'API
        app.setGlobalPrefix(apiPrefix);
        // Documentation Swagger
        if (environment !== 'production') {
            const config = new swagger_1.DocumentBuilder()
                .setTitle('NionFar API')
                .setDescription('API documentation for NionFar')
                .setVersion('1.0')
                .addBearerAuth()
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, config);
            swagger_1.SwaggerModule.setup('api/docs', app, document);
        }
        // Démarrage du serveur
        await app.listen(port, '0.0.0.0');
        console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
        console.log(`Environment: ${environment}`);
        console.log(`API Documentation: http://localhost:${port}/api/docs`);
    }
    catch (error) {
        console.error('Error during bootstrap:', error);
        process.exit(1);
    }
}
bootstrap();
