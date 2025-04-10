"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Schéma pour la connexion
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis'),
    rememberMe: zod_1.z.boolean().optional()
});
// Schéma pour l'inscription
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: zod_1.z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
    role: zod_1.z.enum(['CLIENT', 'PROVIDER', 'ADMIN', 'SUPER_ADMIN', 'USER', 'FREELANCER'], {
        errorMap: () => ({ message: 'Rôle invalide' })
    })
});
// Schéma pour la réinitialisation du mot de passe (demande)
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide')
});
// Schéma pour la réinitialisation du mot de passe (définition du nouveau mot de passe)
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Le token est requis'),
    password: zod_1.z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')
});
// Schéma pour la vérification par e-mail
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .min(1, { message: 'Le jeton est requis' }),
});
// Schéma pour le rafraîchissement du jeton
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string()
        .min(1, { message: 'Le jeton de rafraîchissement est requis' }),
});
