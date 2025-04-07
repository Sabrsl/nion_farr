import { useState, useEffect } from 'react';

export default function APITestQuick() {
  const [apiUrl, setApiUrl] = useState('');
  const [result, setResult] = useState('Cliquez sur Tester pour vérifier la connexion...');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    // Récupérer l'URL de l'API à partir des variables d'environnement
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    setApiUrl(envApiUrl);
  }, []);

  const testConnection = async () => {
    setStatus('loading');
    setResult('Test en cours...');

    try {
      // Test direct de l'endpoint health
      const response = await fetch(`http://localhost:3001/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      setResult(`
        Connexion réussie!
        
        Status: ${response.status} ${response.statusText}
        
        Réponse: ${JSON.stringify(data, null, 2)}
      `);
      setStatus('success');
    } catch (error) {
      setResult(`
        Erreur de connexion:
        
        ${error.message}
        
        Vérifiez que le serveur backend est bien démarré sur le port 3001.
      `);
      setStatus('error');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        Test Rapide d'API
      </h1>
      
      <p>Cette page teste une connexion directe à l'endpoint health du backend.</p>
      
      <div style={{ margin: '20px 0' }}>
        <p><strong>URL de l'API:</strong> {apiUrl}</p>
        <button 
          onClick={testConnection}
          disabled={status === 'loading'}
          style={{
            backgroundColor: status === 'loading' ? '#ccc' : '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '16px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            borderRadius: '4px'
          }}
        >
          {status === 'loading' ? 'Test en cours...' : 'Tester la connexion'}
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: status === 'success' ? '#dff0d8' : 
                          status === 'error' ? '#f2dede' : '#f8f8f8',
        color: status === 'success' ? '#3c763d' : 
               status === 'error' ? '#a94442' : '#666',
        padding: '15px',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace'
      }}>
        {result}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#777' }}>
        <p>
          <strong>Note:</strong> Ce test vérifie directement l'endpoint <code>/api/health</code> sans proxy ni middleware.
        </p>
      </div>
    </div>
  );
} 