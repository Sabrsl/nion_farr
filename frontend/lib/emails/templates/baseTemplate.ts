import { EMAIL_CONFIG } from '../emailConfig';

/**
 * Crée un template HTML de base moderne et professionnel pour tous les emails
 */
export function createBaseHtmlTemplate(content: string, title: string = ''): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Nionfar'}</title>
      <style>
        /* Reset styles */
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        
        /* Container styles */
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        /* Header styles */
        .header {
          background-color: #4F46E5;
          padding: 25px 30px;
          text-align: center;
        }
        
        .header img {
          max-width: 150px;
          height: auto;
        }
        
        /* Content styles */
        .content {
          padding: 30px;
          color: #333;
        }
        
        h1 {
          color: #4F46E5;
          font-size: 22px;
          margin-top: 0;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        /* Button styles */
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 500;
          margin: 16px 0;
          text-align: center;
          transition: background-color 0.3s;
        }
        
        .button:hover {
          background-color: #3c35b5;
        }
        
        /* Code block styles */
        .code-block {
          background-color: #f5f5f5;
          border-radius: 4px;
          padding: 12px 16px;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 1px;
          text-align: center;
          margin: 16px 0;
          color: #333;
          border: 1px solid #e0e0e0;
        }
        
        /* Info block styles */
        .info-block {
          background-color: #f5f7ff;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin: 16px 0;
          border-radius: 0 4px 4px 0;
        }
        
        /* Footer styles */
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer a {
          color: #4F46E5;
          text-decoration: none;
        }
        
        .social-links {
          margin-top: 15px;
        }
        
        .social-links a {
          margin: 0 8px;
          display: inline-block;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 480px) {
          .header, .content, .footer {
            padding: 20px;
          }
          
          h1 {
            font-size: 20px;
          }
          
          p {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${EMAIL_CONFIG.baseUrl}/img/logo-white.png" alt="Nionfar Logo" />
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nionfar. Tous droits réservés.</p>
          <p>
            <a href="${EMAIL_CONFIG.baseUrl}/aide">Centre d'aide</a> &nbsp;|&nbsp; 
            <a href="${EMAIL_CONFIG.baseUrl}/contact">Contact</a> &nbsp;|&nbsp; 
            <a href="${EMAIL_CONFIG.baseUrl}/confidentialite">Confidentialité</a>
          </p>
          <div class="social-links">
            <a href="https://facebook.com/nionfar" target="_blank" rel="noopener">Facebook</a>
            <a href="https://twitter.com/nionfar" target="_blank" rel="noopener">Twitter</a>
            <a href="https://instagram.com/nionfar" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Crée un template de texte brut pour tous les emails
 */
export function createBaseTextTemplate(title: string = '', content: string): string {
  return `
${title ? `${title}\n${'-'.repeat(title.length)}\n\n` : ''}
${content}

---
© ${new Date().getFullYear()} Nionfar. Tous droits réservés.
${EMAIL_CONFIG.baseUrl}

Centre d'aide: ${EMAIL_CONFIG.baseUrl}/aide
Contact: ${EMAIL_CONFIG.baseUrl}/contact
Confidentialité: ${EMAIL_CONFIG.baseUrl}/confidentialite
  `.trim();
} 