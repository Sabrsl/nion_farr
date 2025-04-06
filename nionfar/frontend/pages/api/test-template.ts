import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { EmailManager } from '../../lib/emails/emailManager';
import { EMAIL_CONFIG, EmailEventType } from '../../lib/emails/emailConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Uniquement autoriser les méthodes GET et POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée',
      allowedMethods: ['GET', 'POST'] 
    });
  }

  try {
    // Récupérer le type d'email à tester (par défaut: NEW_MESSAGE)
    const { type = 'NEW_MESSAGE', email = 'test@example.com' } = req.query;
    const emailType = String(type);
    const testEmail = String(email);
    
    console.log(`🧪 Test de template d'email`, { emailType, testEmail });
    
    // Vérifions la configuration de Resend
    const resendApiKey = process.env.RESEND_API_KEY || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q';
    console.log('Clé Resend API détectée:', resendApiKey ? `${resendApiKey.substring(0, 5)}...` : 'Non définie');
    
    // Initialiser une instance directe de Resend pour tester
    const directResend = new Resend(resendApiKey);
    
    // Initialiser EmailManager
    EmailManager.initialize();
    console.log('EmailManager initialisé pour le test');
    
    // Générer des données de test selon le type d'email
    const templateData = generateTestData(emailType);
    console.log('Données de test générées:', JSON.stringify(templateData).substring(0, 200) + '...');
    
    // Tester l'envoi direct via Resend pour vérifier que l'API fonctionne
    console.log('Test direct via Resend...');
    const directResult = await directResend.emails.send({
      from: EMAIL_CONFIG.defaultSender,
      to: [testEmail],
      subject: `Test direct Resend - ${new Date().toLocaleTimeString()}`,
      html: '<h1>Test direct Resend</h1><p>Si vous voyez cet email, l\'API Resend fonctionne correctement!</p>',
      text: 'Test direct Resend. Si vous voyez cet email, l\'API Resend fonctionne correctement!'
    });
    
    console.log('Résultat direct Resend:', directResult);
    
    // Envoyer l'email via EmailManager
    console.log('Envoi via EmailManager...');
    const result = await EmailManager.sendTemplateEmail(
      emailType as EmailEventType,
      testEmail,
      templateData,
      { subject: `Test de template ${emailType} - ${new Date().toLocaleTimeString()}` }
    );
    
    console.log('Résultat EmailManager:', result);
    
    // Envoyer aussi un email de confirmation de contact pour tester
    console.log('Test de l\'email de confirmation de contact...');
    const contactResult = await EmailManager.sendContactEmail({
      name: "Utilisateur Test",
      email: testEmail,
      subject: "Test de confirmation de contact",
      message: "Ceci est un message de test pour vérifier que les emails de confirmation fonctionnent correctement.",
      phoneNumber: "+221 77 000 00 00",
      category: "probleme_technique"
    });
    
    console.log('Résultat email de contact:', contactResult);
    
    return res.status(200).json({
      success: true,
      message: 'Email de test envoyé',
      emailType,
      testEmail,
      directResult,
      templateResult: result,
      contactResult
    });
  } catch (error) {
    console.error('Erreur lors du test de template:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du test',
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Génère des données de test pour différents types d'emails
 * @param emailType Le type d'email
 * @returns Données fictives appropriées pour le type d'email
 */
function generateTestData(emailType: string): Record<string, any> {
  // Données de base communes
  const baseData = {
    userId: 'usr_' + Math.random().toString(36).substring(2, 10),
    timestamp: new Date().toISOString(),
  };
  
  // Données spécifiques selon le type d'email
  switch (emailType) {
    case EmailEventType.ORDER_CREATED:
      return {
        ...baseData,
        clientName: 'Mohamed Diop',
        clientEmail: 'mdiop@example.com',
        orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        serviceName: 'Création de logo professionnel',
        servicePrice: 25000,
        serviceFee: 2500,
        totalAmount: 27500,
        paymentMethod: 'Orange Money',
        sellerName: 'Fatou Ndiaye Design',
        estimatedDelivery: '3-5 jours',
        orderLink: 'https://nionfar.sn/orders/123',
      };
    
    case EmailEventType.ORDER_ACCEPTED:
      return {
        ...baseData,
        clientName: 'Aminata Sow',
        orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        serviceName: 'Rédaction de contenu web',
        sellerName: 'Ibrahima Copywriting',
        estimatedDelivery: '2 jours',
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderLink: 'https://nionfar.sn/orders/456',
        nextSteps: [
          'Communiquez avec le vendeur pour clarifier vos besoins',
          'Surveillez les mises à jour de votre commande',
          'Préparez-vous à examiner la livraison'
        ]
      };
      
    case EmailEventType.ORDER_DELIVERED:
      return {
        ...baseData,
        clientName: 'Ousmane Fall',
        orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        serviceName: 'Développement de site web vitrine',
        sellerName: 'Aïssatou Web Solutions',
        deliveryLink: 'https://nionfar.sn/deliveries/789',
        deliveryMessage: 'Voici la première version de votre site web. Merci de me faire part de vos retours.',
        attachmentsCount: 3,
        reviewDeadline: '3 jours',
        orderLink: 'https://nionfar.sn/orders/789'
      };
      
    case EmailEventType.PAYMENT_RECEIVED:
      return {
        ...baseData,
        userName: 'Cheikh Diagne',
        paymentAmount: 35000,
        transactionId: 'TRX-' + Math.floor(Math.random() * 100000),
        paymentMethod: 'Wave',
        paymentDate: new Date().toLocaleDateString(),
        paymentTime: new Date().toLocaleTimeString(),
        balanceLink: 'https://nionfar.sn/dashboard/finance',
        service: 'Refonte identité visuelle'
      };
      
    case EmailEventType.DISPUTE_OPENED:
      return {
        ...baseData,
        userName: 'Mariama Diallo',
        disputeId: 'DSP-' + Math.floor(Math.random() * 10000),
        orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        serviceName: 'Traduction de documents',
        disputeReason: 'Qualité insuffisante',
        disputeLink: 'https://nionfar.sn/disputes/123',
        deadlineToRespond: '48 heures',
        nextSteps: [
          'Examiner les détails du litige',
          'Fournir des informations supplémentaires',
          'Proposer une solution'
        ]
      };
      
    case EmailEventType.NEW_MESSAGE:
      return {
        ...baseData,
        recipientName: 'Abdoulaye Diop',
        senderName: 'Fatou Sall',
        subject: 'Question sur votre service de design',
        messagePreview: 'Bonjour, je voudrais savoir si vous pouvez réaliser...',
        conversationLink: 'https://nionfar.sn/messages/123',
        orderId: 'ORD-12345',
      };
      
    case EmailEventType.ACCOUNT_VERIFICATION:
      return {
        ...baseData,
        userName: 'Moussa Ndoye',
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
        verificationLink: 'https://nionfar.sn/verify?code=123456&token=abcdef',
        expirationTime: '24 heures'
      };
      
    case EmailEventType.PASSWORD_RESET:
      return {
        ...baseData,
        userName: 'Seynabou Diouf',
        resetCode: Math.floor(100000 + Math.random() * 900000).toString(),
        resetLink: 'https://nionfar.sn/reset-password?token=xyz123',
        expirationTime: '1 heure'
      };
      
    case EmailEventType.ACCOUNT_CREATED:
      return {
        ...baseData,
        userName: 'Mamadou Seck',
        userRole: Math.random() > 0.5 ? 'client' : 'freelancer',
        dashboardLink: 'https://nionfar.sn/dashboard',
        profileLink: 'https://nionfar.sn/profile',
        tutorialLink: 'https://nionfar.sn/tutorials'
      };
    
    // Par défaut: NEW_MESSAGE
    default:
      return {
        ...baseData,
        recipientName: 'Abdoulaye Diop',
        senderName: 'Fatou Sall',
        subject: 'Question sur votre service de design',
        messagePreview: 'Bonjour, je voudrais savoir si vous pouvez réaliser...',
        conversationLink: 'https://nionfar.sn/messages/123'
      };
  }
} 