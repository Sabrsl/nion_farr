import { useState } from 'react';
import Head from 'next/head';

// Version simplifiée sans MUI pour éviter les problèmes de rendu
export default function TestEmailsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setResult(null);
    setDetails(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Email de test envoyé avec succès',
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Erreur inconnue',
        });
        
        // Traiter les détails en chaîne de caractères simple
        try {
          if (data.details) {
            setDetails(typeof data.details === 'string' 
              ? data.details 
              : JSON.stringify(data.details, null, 2));
          }
        } catch (e) {
          setDetails('Impossible d\'afficher les détails: format non supporté');
        }
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Erreur de requête',
      });
      setDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectTest = async () => {
    if (!email) return;

    setLoadingDirect(true);
    setResult(null);
    setDetails(null);

    try {
      const response = await fetch('/api/test-email-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Email de test direct envoyé avec succès',
        });
        
        // Traiter les détails en chaîne de caractères simple
        try {
          if (data.data) {
            setDetails(typeof data.data === 'string' 
              ? data.data 
              : JSON.stringify(data.data, null, 2));
          }
        } catch (e) {
          setDetails('Impossible d\'afficher les détails: format non supporté');
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Erreur inconnue lors de l\'envoi direct',
        });
        
        // Traiter les détails en chaîne de caractères simple
        try {
          if (data.message || data.details) {
            setDetails(typeof (data.message || data.details) === 'string' 
              ? (data.message || data.details) 
              : JSON.stringify((data.message || data.details), null, 2));
          }
        } catch (e) {
          setDetails('Impossible d\'afficher les détails: format non supporté');
        }
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Erreur de requête directe',
      });
      setDetails(error.message);
    } finally {
      setLoadingDirect(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Test d'envoi d'emails - Nionfar</title>
        <meta name="description" content="Page de test pour l'envoi d'emails" />
      </Head>

      <main>
        <h1>Test d'envoi d'emails</h1>
        
        <p className="description">
          Cette page permet de tester l'envoi d'emails en utilisant l'API Resend. 
          Entrez une adresse email pour envoyer un email de test.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Adresse email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || loadingDirect}
              required
            />
          </div>
          
          <div className="button-group">
            <button
              type="submit"
              disabled={!email || loading || loadingDirect}
              className="button primary"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer avec template'}
            </button>
            
            <button
              type="button"
              onClick={handleDirectTest}
              disabled={!email || loading || loadingDirect}
              className="button secondary"
            >
              {loadingDirect ? 'Envoi en cours...' : 'Envoi direct (sans template)'}
            </button>
          </div>
        </form>

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <p>{result.success ? result.message : result.error}</p>
          </div>
        )}

        {details && (
          <div className="details">
            <h3>Détails:</h3>
            <pre>{details}</pre>
          </div>
        )}

        <div className="divider"></div>

        <p className="note">
          Si vous rencontrez des problèmes avec l'envoi d'emails via les templates, 
          essayez l'option d'envoi direct qui contourne le système de templates 
          et utilise directement l'API Resend.
        </p>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        main {
          width: 100%;
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .description {
          margin-bottom: 2rem;
        }

        .form {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          flex: 1;
          min-width: 200px;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .primary {
          background-color: #4F46E5;
          color: white;
        }

        .secondary {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #111827;
        }

        .result {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 4px;
        }

        .success {
          background-color: #ecfdf5;
          border: 1px solid #10b981;
          color: #10b981;
        }

        .error {
          background-color: #fef2f2;
          border: 1px solid #ef4444;
          color: #ef4444;
        }

        .details {
          margin-top: 1.5rem;
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .divider {
          margin: 2rem 0;
          border-top: 1px solid #e5e7eb;
        }

        .note {
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 600px) {
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
} 