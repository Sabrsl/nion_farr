import { useEffect, useState } from 'react';
import { testApiConnection } from '../src/api-test';

export default function APITestPage() {
  const [testResults, setTestResults] = useState({
    running: false,
    success: false,
    message: '',
    logs: []
  });

  const runTest = async () => {
    setTestResults({
      running: true,
      success: false,
      message: 'Test en cours...',
      logs: []
    });

    // Intercepter les logs pour les afficher dans l'UI
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const logs = [];
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      logs.push({ type: 'info', content: args.join(' ') });
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      logs.push({ type: 'error', content: args.join(' ') });
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      logs.push({ type: 'warning', content: args.join(' ') });
    };

    try {
      const result = await testApiConnection();
      
      // Restaurer les fonctions console originales
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      
      setTestResults({
        running: false,
        success: result,
        message: result ? 'Test terminé avec succès' : 'Certains tests ont échoué',
        logs
      });
    } catch (error) {
      // Restaurer les fonctions console originales
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      
      setTestResults({
        running: false,
        success: false,
        message: `Erreur lors du test: ${error.message}`,
        logs
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        Test de Connexion API Nionfar
      </h1>
      
      <p style={{ color: '#666', lineHeight: '1.5' }}>
        Cette page vérifie si votre frontend est correctement connecté au backend Nionfar.
        Le test vérifiera les routes publiques et privées, ainsi que la configuration CORS.
      </p>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button 
          onClick={runTest}
          disabled={testResults.running}
          style={{
            backgroundColor: testResults.running ? '#ccc' : '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            margin: '4px 2px',
            cursor: testResults.running ? 'not-allowed' : 'pointer',
            borderRadius: '4px'
          }}
        >
          {testResults.running ? 'Test en cours...' : 'Lancer le test de connexion'}
        </button>
      </div>
      
      {testResults.message && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: testResults.success ? '#dff0d8' : '#f2dede',
          color: testResults.success ? '#3c763d' : '#a94442',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>{testResults.message}</strong>
        </div>
      )}
      
      {testResults.logs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Résultats détaillés :</h3>
          <div style={{ 
            backgroundColor: '#f8f8f8', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '15px',
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>
            {testResults.logs.map((log, index) => (
              <div 
                key={index}
                style={{
                  color: log.type === 'error' ? '#d9534f' : 
                         log.type === 'warning' ? '#f0ad4e' : '#333',
                  marginBottom: '5px'
                }}
              >
                {log.content}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px', color: '#777', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>
          <strong>Note :</strong> Si les tests échouent, assurez-vous que :
        </p>
        <ul>
          <li>Le backend est démarré et fonctionne sur le port correct</li>
          <li>Les variables d'environnement sont correctement configurées (<code>NEXT_PUBLIC_API_URL</code>)</li>
          <li>La configuration CORS côté backend autorise les requêtes depuis cette origine</li>
          <li>Il n'y a pas de problèmes réseau/firewall bloquant les requêtes</li>
        </ul>
      </div>
    </div>
  );
} 