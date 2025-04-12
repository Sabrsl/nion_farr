import * as Joi from 'joi';

export const validate = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3001),
    API_PREFIX: Joi.string().default('api'),
    APP_URL: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
    
    // Database
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNC: Joi.boolean().default(false),
    
    // JWT
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    
    // 2FA
    TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().default('NionFar'),
    
    // Email
    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().default(587),
    MAIL_USER: Joi.string().required(),
    MAIL_PASSWORD: Joi.string().required(),
    MAIL_FROM: Joi.string().required(),
    
    // Payment (Wave)
    WAVE_API_KEY: Joi.string().optional(),
    WAVE_API_SECRET: Joi.string().optional(),
    WAVE_API_URL: Joi.string().optional(),
    
    // Payment (Orange Money)
    ORANGE_MONEY_API_KEY: Joi.string().optional(),
    ORANGE_MONEY_API_SECRET: Joi.string().optional(),
    ORANGE_MONEY_API_URL: Joi.string().optional(),
    
    // Payment (Free Money)
    FREE_MONEY_API_KEY: Joi.string().optional(),
    FREE_MONEY_API_SECRET: Joi.string().optional(),
    FREE_MONEY_API_URL: Joi.string().optional(),
  });

  const { error, value } = schema.validate(config, { allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
}; 