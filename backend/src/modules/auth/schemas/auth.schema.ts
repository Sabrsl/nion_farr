import { z } from 'zod';
import { UserRole } from '../../users/enums/user-role.enum';

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional()
});

// Schéma pour l'inscription avec validations et messages d'erreur améliorés
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .trim()
    .toLowerCase(),
    
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom est trop long (maximum 100 caractères)')
    .trim()
    .refine(val => /^[a-zA-ZÀ-ÿ\s-']+$/.test(val), {
      message: 'Le prénom contient des caractères non autorisés'
    }),
    
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long (maximum 100 caractères)')
    .trim()
    .refine(val => /^[a-zA-ZÀ-ÿ\s-']+$/.test(val), {
      message: 'Le nom contient des caractères non autorisés'
    }),
    
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe est trop long (maximum 100 caractères)')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
    
  passwordConfirm: z.string().optional(),
  
  // Validation de rôle d'utilisateur avec valeurs acceptées en majuscules et minuscules
  role: z.enum(['client', 'provider', 'admin', 'super_admin', 'user', 'freelancer', 
                'CLIENT', 'PROVIDER', 'ADMIN', 'SUPER_ADMIN', 'USER', 'FREELANCER'], {
    errorMap: () => ({ 
      message: 'Le rôle doit être l\'une des valeurs suivantes: client, provider, admin, super_admin, user, freelancer' 
    })
  }).transform(val => val.toLowerCase()),
  
  // Champs optionnels 
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  termsAccepted: z.boolean().optional()
})
// Validation croisée pour vérifier que les mots de passe correspondent
.refine(data => !data.passwordConfirm || data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"]
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