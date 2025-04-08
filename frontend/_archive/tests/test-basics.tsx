import { useState } from 'react';
import Head from 'next/head';
import { EmailEventType } from '../lib/emails/emailConfig';

export default function TestBasicsPage() {
  const [email, setEmail] = useState('');
  const [pingResult, setPingResult] = useState<any>(null);
  const [basicResult, setBasicResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [templateType, setTemplateType] = useState<string>(EmailEventType.ACCOUNT_VERIFICATION);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateResult, setTemplateResult] = useState<any>(null);

  const handlePingResend = async () => {
    setLoading(true);
    setPingResult(null);

    try {
      const response = await fetch('/api/ping-resend');
      const data = await response.json();
      setPingResult(data);
    } catch (error: any) {
      setPingResult({
        success: false,
        error: error.message || 'Une erreur est survenue'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setBasicLoading(true);
    setBasicResult(null);

    try {
      const response = await fetch('/api/test-basics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setBasicResult(data);
    } catch (error: any) {
      setBasicResult({
        success: false,
        error: error.message || 'Une erreur est survenue'
      });
    } finally {
      setBasicLoading(false);
    }
  };

  const handleTemplateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setTemplateLoading(true);
    setTemplateResult(null);

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

      const data = await response.json();
      setTemplateResult(data);
    } catch (error: any) {
      setTemplateResult({
        success: false,
        error: error.message || 'Une erreur est survenue'
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  // Détection si l'adresse est l'adresse autorisée pour les tests
  const isAllowedEmail = email === 'badzagueye@gmail.com';

  return (
    <div className="container">
      <Head>
        <title>Tests d'API basiques - Nionfar</title>
        <meta name="description" content="Page de test des API basiques Resend" />
      </Head>

      <main>
        <h1>Tests de diagnostic Resend</h1>
        
        <section className="card">
          <h2>Test de Ping Resend</h2>
          <p>Ce test vérifie la connexion avec l'API Resend en envoyant un email simple à une adresse de test interne.</p>
          
          <button 
            onClick={handlePingResend}
            disabled={loading}
            className="button"
          >
            {loading ? 'Test en cours...' : 'Tester la connexion Resend'}
          </button>

          {pingResult && (
            <div className={`result ${pingResult.success ? 'success' : 'error'}`}>
              <h3>{pingResult.success ? 'Connexion réussie' : 'Erreur de connexion'}</h3>
              <p>{pingResult.message}</p>
              
              {pingResult.error && (
                <div className="error-details">
                  <p><strong>Erreur:</strong> {pingResult.error}</p>
                </div>
              )}
              
              <div className="details">
                <pre>{JSON.stringify(pingResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </section>
        
        <section className="card">
          <h2>Test d'envoi basique</h2>
          <p>Ce test envoie un email simple à l'adresse spécifiée.</p>
          
          <div className="info-box">
            <strong>Note sur le mode test:</strong> En mode test, seule l'adresse <span className="highlight">badzagueye@gmail.com</span> peut recevoir des emails.
            Les autres adresses recevront une réponse simulée.
          </div>
          
          <form onSubmit={handleBasicTest} className="form">
            <div className="form-group">
              <label htmlFor="email">Adresse email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={basicLoading}
                required
              />
              {!isAllowedEmail && email && (
                <p className="warning-text">Cette adresse ne recevra pas réellement d'email en mode test.</p>
              )}
              {isAllowedEmail && (
                <p className="success-text">Cette adresse est autorisée pour les tests réels.</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!email || basicLoading}
              className="button"
            >
              {basicLoading ? 'Envoi en cours...' : 'Envoyer un email basique'}
            </button>
          </form>

          {basicResult && (
            <div className={`result ${basicResult.success ? 'success' : 'error'}`}>
              <h3>{basicResult.success ? 'Email envoyé' : 'Erreur d\'envoi'}</h3>
              <p>{basicResult.message || basicResult.error}</p>
              
              {basicResult.note && (
                <div className="note-box">
                  <p><strong>Note:</strong> {basicResult.note}</p>
                </div>
              )}
              
              <div className="details">
                <pre>{JSON.stringify(basicResult.details || {}, null, 2)}</pre>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Test des templates d'email</h2>
          <p>Ce test envoie un email avec un template spécifique à l'adresse indiquée.</p>
          
          <div className="info-box">
            <strong>Note:</strong> En mode test, seule l'adresse <span className="highlight">badzagueye@gmail.com</span> peut recevoir des emails.
          </div>
          
          <form onSubmit={handleTemplateTest} className="form">
            <div className="form-group">
              <label htmlFor="email-template">Adresse email:</label>
              <input
                type="email"
                id="email-template"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={templateLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="template-type">Type de template:</label>
              <select
                id="template-type"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                disabled={templateLoading}
                className="select-input"
              >
                {Object.values(EmailEventType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={!email || templateLoading}
              className="button"
            >
              {templateLoading ? 'Envoi en cours...' : 'Tester le template'}
            </button>
          </form>

          {templateResult && (
            <div className={`result ${templateResult.success ? 'success' : 'error'}`}>
              <h3>{templateResult.success ? 'Email avec template envoyé' : 'Erreur d\'envoi'}</h3>
              <p>{templateResult.message || templateResult.error}</p>
              
              {templateResult.note && (
                <div className="note-box">
                  <p><strong>Note:</strong> {templateResult.note}</p>
                </div>
              )}
              
              <div className="details">
                <pre>{JSON.stringify(templateResult.details || {}, null, 2)}</pre>
              </div>
            </div>
          )}
        </section>
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

        input, .select-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }

        .button {
          padding: 0.75rem 1.5rem;
          background-color: #4F46E5;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          min-width: 200px;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .result {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 4px;
        }

        .success {
          background-color: #ecfdf5;
          border: 1px solid #10b981;
        }

        .error {
          background-color: #fef2f2;
          border: 1px solid #ef4444;
        }

        .error-details {
          margin-top: 0.5rem;
          color: #b91c1c;
        }

        .details {
          margin-top: 1rem;
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          font-size: 0.85rem;
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
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
          border-left: 3px solid #F59E0B;
        }

        .highlight {
          background-color: #ffe1b4;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-weight: bold;
        }

        .warning-text {
          color: #b91c1c;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .success-text {
          color: #047857;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
} 