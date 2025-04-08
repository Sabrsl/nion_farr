import { z } from 'zod';

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional()
});

// Schéma pour l'inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  role: z.enum(['CLIENT', 'PROVIDER', 'ADMIN', 'SUPER_ADMIN', 'USER', 'FREELANCER'], {
    errorMap: () => ({ message: 'Rôle invalide' })
  })
});

// Schéma pour la réinitialisation du mot de passe (demande)
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide')
});

// Schéma pour la réinitialisation du mot de passe (définition du nouveau mot de passe)
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')
});

// Schéma pour la vérification par e-mail
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Le jeton est requis' }),
});

// Schéma pour le rafraîchissement du jeton
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, { message: 'Le jeton de rafraîchissement est requis' }),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>; 