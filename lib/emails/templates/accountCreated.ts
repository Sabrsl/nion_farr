import { EmailTemplate } from '../emailTemplates';
import { EMAIL_CONFIG } from '../emailConfig';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './baseTemplate';

/**
 * Template pour le message de bienvenue après création de compte
 */
export const accountCreatedTemplate: EmailTemplate = {
  name: 'account-created',
  defaultSubject: 'Bienvenue sur Nionfar !',
  render: (data) => {
    const {
      userName,
      userRole = 'client', // 'client' or 'freelancer'
      dashboardLink,
      tutorialLink,
      exploreCategoriesLink,
      supportLink,
      profileLink,
    } = data;

    const actualDashboardLink = dashboardLink || `${EMAIL_CONFIG.baseUrl}/dashboard/${userRole}`;
    const actualProfileLink = profileLink || `${EMAIL_CONFIG.baseUrl}/dashboard/${userRole}/profile`;
    const actualExploreCategoriesLink = exploreCategoriesLink || `${EMAIL_CONFIG.baseUrl}/services/categories`;
    const actualTutorialLink = tutorialLink || `${EMAIL_CONFIG.baseUrl}/help/getting-started`;
    const actualSupportLink = supportLink || `${EMAIL_CONFIG.baseUrl}/help/contact-support`;
    
    const isFreelancer = userRole === 'freelancer';

    const htmlContent = `
      <h2>Bienvenue sur Nionfar !</h2>
      <p>Bonjour ${userName},</p>
      
      <p>Nous sommes ravis de vous accueillir sur Nionfar, ${isFreelancer ? 
        'la plateforme de référence pour les freelancers au Sénégal et en Afrique de l\'Ouest.' : 
        'la plateforme qui vous connecte aux meilleurs talents freelance du Sénégal et d\'Afrique de l\'Ouest.'}</p>
      
      <div class="highlight-box">
        <h3>Votre compte est activé</h3>
        <p>Vous pouvez dès maintenant vous connecter à votre espace personnel et ${isFreelancer ? 
          'commencer à proposer vos services aux clients potentiels.' : 
          'découvrir les services proposés par nos prestataires.'}</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${actualDashboardLink}" class="button" style="padding: 12px 24px;">Accéder à mon espace</a>
        </p>
      </div>
      
      <h3>Pour bien démarrer sur Nionfar</h3>
      
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; min-width: 250px; background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
          <h4 style="margin-top: 0;">1. Complétez votre profil</h4>
          <p>Un profil complet ${isFreelancer ? 'augmente vos chances de décrocher des contrats' : 'facilite vos interactions avec les prestataires'}.</p>
          <p><a href="${actualProfileLink}" style="color: #1a73e8; text-decoration: none;">Compléter mon profil →</a></p>
        </div>
        
        <div style="flex: 1; min-width: 250px; background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
          <h4 style="margin-top: 0;">2. ${isFreelancer ? 'Créez votre premier service' : 'Explorez les services'}</h4>
          <p>${isFreelancer ? 
            'Présentez vos compétences et définissez vos offres pour attirer des clients.' : 
            'Découvrez la diversité des services proposés par nos freelancers.'}</p>
          <p><a href="${isFreelancer ? actualDashboardLink + '/services/new' : actualExploreCategoriesLink}" style="color: #1a73e8; text-decoration: none;">${isFreelancer ? 'Créer un service' : 'Explorer les services'} →</a></p>
        </div>
        
        <div style="flex: 1; min-width: 250px; background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
          <h4 style="margin-top: 0;">3. Consultez nos tutoriels</h4>
          <p>Découvrez comment tirer le meilleur parti de Nionfar avec nos guides pratiques.</p>
          <p><a href="${actualTutorialLink}" style="color: #1a73e8; text-decoration: none;">Voir les tutoriels →</a></p>
        </div>
      </div>
      
      <div class="notice-box">
        <h3>Besoin d'aide ?</h3>
        <p>Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos premiers pas sur la plateforme.</p>
        <p style="text-align: center; margin: 15px 0;">
          <a href="${actualSupportLink}" class="secondary-button">Contacter le support</a>
        </p>
      </div>
      
      <p>Nous vous souhaitons une excellente expérience sur Nionfar !</p>
      
      <p>Cordialement,<br>L'équipe Nionfar</p>
      
      <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        <p>Suivez-nous sur les réseaux sociaux pour rester informé des dernières actualités :</p>
        <p>
          <a href="https://www.facebook.com/nionfarofficial" style="color: #1a73e8; text-decoration: none; margin-right: 10px;">Facebook</a>
          <a href="https://www.instagram.com/nionfarofficial" style="color: #1a73e8; text-decoration: none; margin-right: 10px;">Instagram</a>
          <a href="https://www.linkedin.com/company/nionfar" style="color: #1a73e8; text-decoration: none;">LinkedIn</a>
        </p>
      </div>
    `;

    const textContent = `
      Bienvenue sur Nionfar !
      
      Bonjour ${userName},
      
      Nous sommes ravis de vous accueillir sur Nionfar, ${isFreelancer ? 
        'la plateforme de référence pour les freelancers au Sénégal et en Afrique de l\'Ouest.' : 
        'la plateforme qui vous connecte aux meilleurs talents freelance du Sénégal et d\'Afrique de l\'Ouest.'}
      
      VOTRE COMPTE EST ACTIVÉ
      
      Vous pouvez dès maintenant vous connecter à votre espace personnel et ${isFreelancer ? 
        'commencer à proposer vos services aux clients potentiels.' : 
        'découvrir les services proposés par nos prestataires.'}
      
      Accéder à mon espace: ${actualDashboardLink}
      
      POUR BIEN DÉMARRER SUR NIONFAR
      
      1. Complétez votre profil
      Un profil complet ${isFreelancer ? 'augmente vos chances de décrocher des contrats' : 'facilite vos interactions avec les prestataires'}.
      Compléter mon profil: ${actualProfileLink}
      
      2. ${isFreelancer ? 'Créez votre premier service' : 'Explorez les services'}
      ${isFreelancer ? 
        'Présentez vos compétences et définissez vos offres pour attirer des clients.' : 
        'Découvrez la diversité des services proposés par nos freelancers.'}
      ${isFreelancer ? 'Créer un service' : 'Explorer les services'}: ${isFreelancer ? actualDashboardLink + '/services/new' : actualExploreCategoriesLink}
      
      3. Consultez nos tutoriels
      Découvrez comment tirer le meilleur parti de Nionfar avec nos guides pratiques.
      Voir les tutoriels: ${actualTutorialLink}
      
      BESOIN D'AIDE ?
      
      Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos premiers pas sur la plateforme.
      Contacter le support: ${actualSupportLink}
      
      Nous vous souhaitons une excellente expérience sur Nionfar !
      
      Cordialement,
      L'équipe Nionfar
      
      --
      Suivez-nous sur les réseaux sociaux pour rester informé des dernières actualités :
      Facebook: https://www.facebook.com/nionfarofficial
      Instagram: https://www.instagram.com/nionfarofficial
      LinkedIn: https://www.linkedin.com/company/nionfar
    `;

    const html = createBaseHtmlTemplate('Bienvenue sur Nionfar', htmlContent);
    const text = createBaseTextTemplate('Bienvenue sur Nionfar !', textContent);

    return { html, text };
  },
}; 