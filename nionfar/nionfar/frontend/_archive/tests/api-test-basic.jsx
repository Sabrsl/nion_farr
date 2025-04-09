import { useState } from 'react';
import ClientOnly from '../components/ClientOnly';

export default function APITestBasic() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        Test Basique de Connexion Backend
      </h1>
      
      <ClientOnly>
        <APITestContent />
      </ClientOnly>
    </div>
  );
}

function APITestContent() {
  const [testResults, setTestResults] = useState({
    running: false,
    results: [],
    message: ''
  });

  const testConnection = async () => {
    setTestResults({
      running: true,
      results: [],
      message: 'Test en cours...'
    });

    const results = [];
    const ports = [3000, 3001, 3002, 8080];

    // Tester différentes ports
    for (const port of ports) {
      try {
        const baseUrl = `http://localhost:${port}`;
        console.log(`Checking ${baseUrl}...`);
        
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          }
        });
        
        const text = await response.text();
        
        results.push({
          name: `Port ${port}`,
          endpoint: baseUrl,
          status: response.status,
          success: response.ok,
          message: response.ok ? `Succès (${text.substring(0, 50)}...)` : `Erreur: ${response.status} ${response.statusText}`
        });
      } catch (error) {
        results.push({
          name: `Port ${port}`,
          endpoint: `http://localhost:${port}`,
          status: 0,
          success: false,
          message: `Erreur de connexion: ${error.message}`
        });
      }
    }

    // Vérifier les résultats
    const anySuccess = results.some(result => result.success);
    const successCount = results.filter(result => result.success).length;

    setTestResults({
      running: false,
      results: results,
      message: anySuccess 
        ? `${successCount}/${results.length} tests ont réussi.` 
        : 'Aucun port n\'est accessible. Vérifiez que le serveur backend est en cours d\'exécution.'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <p>Ce test vérifie uniquement si votre serveur répond sur l'un des ports courants.</p>
      </div>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
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
          {testResults.running ? 'Test en cours...' : 'Tester la connexion serveur'}
        </button>
      </div>
      
      {testResults.message && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: testResults.results.some(r => r.success) ? '#dff0d8' : '#f2dede',
          color: testResults.results.some(r => r.success) ? '#3c763d' : '#a94442',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>{testResults.message}</strong>
        </div>
      )}
      
      {testResults.results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Résultats détaillés :</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Port</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>URL</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Résultat</th>
              </tr>
            </thead>
            <tbody>
              {testResults.results.map((result, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>{result.name}</td>
                  <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>{result.endpoint}</td>
                  <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>{result.status}</td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    border: '1px solid #ddd',
                    color: result.success ? '#3c763d' : '#a94442'
                  }}>
                    {result.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: '30px', color: '#777', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>
          <strong>Étapes suivantes :</strong>
        </p>
        <ul>
          <li>Si un port répond mais pas celui attendu (3001), vérifiez la configuration du serveur</li>
          <li>Si aucun port ne répond, assurez-vous que le serveur backend est bien démarré</li>
          <li>Consultez les logs du serveur pour les erreurs éventuelles</li>
        </ul>
      </div>
    </div>
  );
} 