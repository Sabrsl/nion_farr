import { useState, useEffect } from 'react';
import Head from 'next/head';
import { EmailEventType } from '../lib/emails/emailConfig';

export default function TestTemplatePage() {
  const [email, setEmail] = useState('');
  const [templateType, setTemplateType] = useState<string>(EmailEventType.ACCOUNT_VERIFICATION);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeout, setTimeout] = useState<boolean>(false);
  // L'adresse email autorisée en mode test
  const allowedTestEmail = 'badzagueye@gmail.com';

  const templateOptions = Object.values(EmailEventType).filter(type => {
    // Inclure seulement les templates que nous savons fonctionnels
    return [
      EmailEventType.ACCOUNT_VERIFICATION,
      EmailEventType.PASSWORD_RESET,
      EmailEventType.ORDER_ACCEPTED,
      EmailEventType.ORDER_COMPLETED,
      EmailEventType.ORDER_REJECTED,
      EmailEventType.NEW_MESSAGE
    ].includes(type);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setResult(null);
    setTimeout(false);

    // Ajouter un timeout pour éviter que la page tourne indéfiniment
    const timeoutId = window.setTimeout(() => {
      setTimeout(true);
    }, 15000); // 15 secondes

    try {
      const response = await fetch('/api/test-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          templateType
        }),
      });

      window.clearTimeout(timeoutId);
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      window.clearTimeout(timeoutId);
      setResult({
        success: false,
        error: error.message || 'Une erreur est survenue'
      });
    } finally {
      setLoading(false);
    }
  };

  // Convertir le type d'événement en nom lisible
  const getReadableTemplateName = (type: string) => {
    const names: Record<string, string> = {
      account_verification: 'Vérification de compte',
      password_reset: 'Réinitialisation de mot de passe',
      order_accepted: 'Commande acceptée',
      order_rejected: 'Commande rejetée',
      order_completed: 'Commande complétée',
      new_message: 'Nouveau message',
      order_created: 'Commande créée',
      order_delivered: 'Commande livrée',
      payment_received: 'Paiement reçu',
      payment_withdrawal: 'Retrait de fonds',
      dispute_opened: 'Litige ouvert',
      dispute_resolved: 'Litige résolu',
      review_reminder: 'Rappel d\'évaluation',
      message_digest: 'Récapitulatif de messages',
      account_created: 'Compte créé'
    };
    
    return names[type] || type;
  };

  return (
    <div className="container">
      <Head>
        <title>Test des Templates d'Emails - Nionfar</title>
        <meta name="description" content="Page de test pour les templates d'emails" />
      </Head>

      <main>
        <h1>Test des Templates d'Emails</h1>
        
        <div className="card">
          <h2>Envoi d'emails avec template</h2>
          <p>Sélectionnez un type de template et une adresse email pour tester l'envoi.</p>
          
          {/* Information pour les utilisateurs en mode test */}
          <div className="info-panel">
            <h3>Mode Test Resend</h3>
            <p>Vous êtes actuellement en mode test avec l'API Resend. <strong>Important:</strong></p>
            <ul>
              <li>Seule l'adresse <strong>{allowedTestEmail}</strong> peut recevoir des emails réels en mode test</li>
              <li>Pour les autres adresses, l'envoi sera simulé et aucun email ne sera réellement envoyé</li>
              <li>En production, vérifiez un domaine sur <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">Resend.com</a></li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email">Adresse email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {email && email !== allowedTestEmail && (
                <small className="warning">
                  Cette adresse ne recevra pas d'email réel en mode test. Utilisez {allowedTestEmail} pour des tests réels.
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="templateType">Type de template:</label>
              <select
                id="templateType"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                disabled={loading}
              >
                {templateOptions.map((type) => (
                  <option key={type} value={type}>
                    {getReadableTemplateName(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={!email || loading}
              className="button"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer avec template'}
            </button>
          </form>

          {loading && (
            <div className="loading-box">
              <p>Envoi de l'email en cours...</p>
              {timeout && (
                <div className="warning-box">
                  <h4>L'opération prend plus de temps que prévu</h4>
                  <p>Vérifiez les points suivants:</p>
                  <ul>
                    <li>La connexion internet est active</li>
                    <li>Le serveur Next.js fonctionne correctement</li>
                    <li>La clé d'API Resend est configurée correctement</li>
                    <li>Si vous utilisez un serveur local, vérifiez les logs du serveur</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className={`result ${result.success ? 'success' : 'error'}`}>
              <h3>{result.success ? (result.note ? '[SIMULATION] Email envoyé' : 'Email envoyé') : 'Erreur d\'envoi'}</h3>
              <p>{result.message || result.error}</p>
              
              {result.note && (
                <div className="info-box note-box">
                  <p><strong>Note:</strong> {result.note}</p>
                </div>
              )}
              
              {result.templateUsed && (
                <div className="info-box">
                  <p><strong>Template utilisé:</strong> {getReadableTemplateName(result.templateUsed)}</p>
                </div>
              )}
              
              <div className="details">
                <h4>Détails du template:</h4>
                <pre>{JSON.stringify(result.templateData || {}, null, 2)}</pre>
              </div>
              
              {result.success && result.details?.previewHtml && (
                <div className="preview-box">
                  <h4>Aperçu du contenu HTML:</h4>
                  <div className="html-preview">
                    <pre>{result.details.previewHtml}</pre>
                    <p><em>Note: Il s'agit d'un aperçu tronqué. L'email complet contiendrait plus de contenu.</em></p>
                  </div>
                </div>
              )}
              
              {!result.success && result.details && (
                <div className="error-details">
                  <h4>Détails de l'erreur:</h4>
                  <pre>{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="navigation">
          <a href="/test-basics" className="nav-link">
            ← Retour aux tests basiques
          </a>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        main {
          padding: 2rem 0;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #333;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #444;
        }

        h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        
        h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }

        .card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .form {
          margin: 1.5rem 0;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }

        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .button:hover {
          background-color: #4338CA;
        }

        .button:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }

        .result {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 4px;
        }

        .success {
          background-color: #ECFDF5;
          border: 1px solid #10B981;
        }

        .error {
          background-color: #FEF2F2;
          border: 1px solid #EF4444;
        }

        .details, .error-details, .preview-box {
          margin-top: 1rem;
          background-color: #F9FAFB;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        pre {
          font-family: monospace;
          white-space: pre-wrap;
          font-size: 0.875rem;
        }

        .info-box {
          background-color: #EFF6FF;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
          border-left: 3px solid #3B82F6;
        }
        
        .note-box {
          background-color: #FFFBEB;
          border-left: 3px solid #F59E0B;
        }

        .navigation {
          margin-top: 2rem;
        }

        .nav-link {
          display: inline-block;
          color: #4F46E5;
          text-decoration: none;
        }

        .nav-link:hover {
          text-decoration: underline;
        }

        .loading-box {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 4px;
          background-color: #f5f5f5;
        }

        .warning-box {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          background-color: #fef2f2;
          border: 1px solid #ef4444;
        }
        
        .info-panel {
          background-color: #EFF6FF;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }
        
        .info-panel h3 {
          margin-top: 0;
          color: #1E40AF;
          font-size: 1.1rem;
        }
        
        .info-panel ul {
          margin-top: 0.5rem;
          padding-left: 1.5rem;
        }
        
        .warning {
          color: #b91c1c;
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
        }
        
        .html-preview {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          background-color: #f8fafc;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
} 