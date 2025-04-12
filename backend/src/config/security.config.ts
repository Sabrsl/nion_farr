import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

export const getSecurityConfig = (configService: ConfigService) => ({
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://nion-farr.vercel.app'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),

  rateLimit: rateLimit({
    windowMs: configService.get('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    max: configService.get('RATE_LIMIT_MAX', 100), // limit each IP to 100 requests per windowMs
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  compression: compression({
    level: 6,
    threshold: 100 * 1000, // compress responses larger than 100kb
  }),

  cors: {
    origin: [
      'https://nion-farr.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  jwt: {
    secret: configService.get('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
    },
  },

  refreshToken: {
    secret: configService.get('JWT_REFRESH_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
  },
}); 