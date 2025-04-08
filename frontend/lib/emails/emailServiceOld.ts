// Ancien service d'emails conservé pour référence

import { Resend } from 'resend';
import { EmailEventType } from './emailConfig';

// Initialisation de Resend avec la clé API fournie
const resend = new Resend('re_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q');

// Configuration des emails
const EMAIL_CONFIG = {
  fromEmail: 'notifications@nionfar.sn',
  fromName: 'Nionfar',
  replyTo: 'support@nionfar.sn',
  // URLs du site pour les liens dans les emails
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://nionfar.sn',
};

/**
 * Exemple simple d'envoi d'email avec Resend
 */
async function sendBasicEmail() {
  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'hello world',
      html: '<p>it works!</p>',
    });
    
    console.log('Email envoyé avec succès:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

/**
 * Exemple d'envoi d'emails par lots avec Resend
 */
async function sendBatchEmails() {
  try {
    const data = await resend.batch.send([
      {
        from: 'Acme <onboarding@resend.dev>',
        to: ['foo@gmail.com'],
        subject: 'hello world',
        html: '<h1>it works!</h1>',
      },
      {
        from: 'Acme <onboarding@resend.dev>',
        to: ['bar@outlook.com'],
        subject: 'world hello',
        html: '<p>it works!</p>',
      },
    ]);
    
    console.log('Emails envoyés par lot avec succès:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'emails par lot:', error);
    throw error;
  }
}

/**
 * Exemple de récupération d'un email par son ID
 */
async function getEmailById(emailId: string) {
  try {
    const data = await resend.emails.get(emailId);
    console.log('Email récupéré avec succès:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'email:', error);
    throw error;
  }
}

/**
 * Exemple de mise à jour d'un email programmé
 */
async function updateScheduledEmail(emailId: string) {
  try {
    const oneMinuteFromNow = new Date(Date.now() + 1000 * 60).toISOString();
    
    const data = await resend.emails.update({
      id: emailId,
      scheduledAt: oneMinuteFromNow,
    });
    
    console.log('Email mis à jour avec succès:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'email:', error);
    throw error;
  }
}

/**
 * Exemple d'annulation d'un email programmé
 */
async function cancelScheduledEmail(emailId: string) {
  try {
    const data = await resend.emails.cancel(emailId);
    console.log('Email annulé avec succès:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'email:', error);
    throw error;
  }
}

export const emailServiceExamples = {
  sendBasicEmail,
  sendBatchEmails,
  getEmailById,
  updateScheduledEmail,
  cancelScheduledEmail
}; 