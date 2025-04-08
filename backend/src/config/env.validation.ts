import * as Joi from 'joi';

export const validate = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3001),
    API_PREFIX: Joi.string().default('api'),
    APP_URL: Joi.string().default('https://nionfar-backend.onrender.com'),
    FRONTEND_URL: Joi.string().default('https://nionfar.vercel.app'),
    
    // Database
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().default('postgres'),
    DB_DATABASE: Joi.string().default('nionfar'),
    DB_SYNC: Joi.boolean().default(false),
    
    // JWT
    JWT_SECRET: Joi.string().default('dev-jwt-secret-key-replace-in-production'),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
    JWT_REFRESH_SECRET: Joi.string().default('dev-jwt-refresh-secret-key-replace-in-production'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    
    // 2FA
    TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().default('NionFar'),
    
    // Email
    MAIL_HOST: Joi.string().optional().default('smtp.example.com'),
    MAIL_PORT: Joi.number().default(587),
    MAIL_USER: Joi.string().optional().default('user@example.com'),
    MAIL_PASSWORD: Joi.string().optional().default('password'),
    MAIL_FROM: Joi.string().optional().default('noreply@nionfar.sn'),
    
    // SMS (Twilio)
    TWILIO_ACCOUNT_SID: Joi.string().optional().default(''),
    TWILIO_AUTH_TOKEN: Joi.string().optional().default(''),
    TWILIO_PHONE_NUMBER: Joi.string().optional().default(''),
    
    // Payment (Wave)
    WAVE_API_KEY: Joi.string().optional().default(''),
    WAVE_API_SECRET: Joi.string().optional().default(''),
    WAVE_API_URL: Joi.string().optional().default(''),
    
    // Payment (Orange Money)
    ORANGE_MONEY_API_KEY: Joi.string().optional().default(''),
    ORANGE_MONEY_API_SECRET: Joi.string().optional().default(''),
    ORANGE_MONEY_API_URL: Joi.string().optional().default(''),
    
    // Payment (Free Money)
    FREE_MONEY_API_KEY: Joi.string().optional().default(''),
    FREE_MONEY_API_SECRET: Joi.string().optional().default(''),
    FREE_MONEY_API_URL: Joi.string().optional().default(''),
    
    // MongoDB
    MONGODB_URI: Joi.string().optional().default('mongodb://localhost:27017/nionfar'),
  });

  const { error, value } = schema.validate(config, { allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
}; 