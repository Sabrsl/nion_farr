import { Resend } from 'resend';

// Log environment variables for debugging
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialiser l'API Resend
export const resend = new Resend(process.env.RESEND_API_KEY || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q');

// Types d'événements qui nécessitent l'envoi d'un email
export enum EmailEventType {
  // Commandes
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  ORDER_REJECTED = 'ORDER_REJECTED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  
  // Paiements
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_WITHDRAWAL = 'PAYMENT_WITHDRAWAL',
  
  // Litiges
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  
  // Messages
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_DIGEST = 'MESSAGE_DIGEST',
  
  // Compte
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Évaluations
  REVIEW_REMINDER = 'REVIEW_REMINDER',
}

// Catégories de contact valides
export const VALID_CATEGORIES = [
  'support_general',
  'demande_information',
  'probleme_technique',
  'suggestion',
  'reclamation',
  'partenariat',
  'presse',
  'autre'
];

// Configuration générale pour les emails
export const EMAIL_CONFIG = {
  defaultSender: process.env.EMAIL_SENDER || 'Nionfar <onboarding@resend.dev>',
  supportEmail: 'badzagueye@gmail.com',
  logoUrl: process.env.EMAIL_LOGO_URL || 'https://vynalapp.com/logo.png',
  websiteUrl: process.env.WEBSITE_URL || 'https://vynalapp.com',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn',
  appName: 'Nionfar',
  templatePath: process.env.EMAIL_TEMPLATE_PATH || './templates',
  senderName: 'Nionfar',
  senderEmail: 'onboarding@resend.dev',
};

// Log the email configuration
console.log('Email configuration:', {
  baseUrl: EMAIL_CONFIG.baseUrl,
  defaultSender: EMAIL_CONFIG.defaultSender,
  supportEmail: EMAIL_CONFIG.supportEmail
});

// Interface pour les destinataires d'emails
export interface EmailRecipient {
  email: string;
  name?: string;
}

// Interface pour les données d'événement
export interface EmailEventData {
  recipient: EmailRecipient;
  subject?: string;
  templateData: Record<string, any>;
  cc?: string[];
  bcc?: string[];
} 