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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const Joi = __importStar(require("joi"));
const validate = (config) => {
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
        // SMS (Twilio)
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_PHONE_NUMBER: Joi.string().required(),
        // Payment (Wave)
        WAVE_API_KEY: Joi.string().required(),
        WAVE_API_SECRET: Joi.string().required(),
        WAVE_API_URL: Joi.string().required(),
        // Payment (Orange Money)
        ORANGE_MONEY_API_KEY: Joi.string().required(),
        ORANGE_MONEY_API_SECRET: Joi.string().required(),
        ORANGE_MONEY_API_URL: Joi.string().required(),
        // Payment (Free Money)
        FREE_MONEY_API_KEY: Joi.string().required(),
        FREE_MONEY_API_SECRET: Joi.string().required(),
        FREE_MONEY_API_URL: Joi.string().required(),
    });
    const { error, value } = schema.validate(config, { allowUnknown: true });
    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }
    return value;
};
exports.validate = validate;
