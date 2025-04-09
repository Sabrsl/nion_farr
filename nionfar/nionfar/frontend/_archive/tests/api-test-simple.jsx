import { useState } from 'react';
import ClientOnly from '../components/ClientOnly';

export default function APITestSimple() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        Test de Connexion API Nionfar (Version Simple)
      </h1>
      
      <p style={{ color: '#666', lineHeight: '1.5' }}>
        Cette page teste la connexion au backend en utilisant les routes de base disponibles.
      </p>
      
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
    const baseApiUrl = 'http://localhost:3001';
    const apiUrl = `${baseApiUrl}/api`;

    // Test 1: Vérifier la page d'accueil
    try {
      const response = await fetch(baseApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true'
        }
      });
      
      results.push({
        name: 'Test Page d\'accueil',
        endpoint: baseApiUrl,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Succès' : `Erreur: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Test Page d\'accueil',
        endpoint: baseApiUrl,
        status: 0,
        success: false,
        message: `Erreur de connexion: ${error.message}`
      });
    }

    // Test 2: Vérifier le endpoint de santé
    try {
      const response = await fetch(`${baseApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true'
        }
      });
      
      results.push({
        name: 'Test Health Endpoint',
        endpoint: `${baseApiUrl}/health`,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Succès' : `Erreur: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Test Health Endpoint',
        endpoint: `${baseApiUrl}/health`,
        status: 0,
        success: false,
        message: `Erreur de connexion: ${error.message}`
      });
    }

    // Test 3: Vérifier la documentation Swagger
    try {
      const response = await fetch(`${baseApiUrl}/docs`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      results.push({
        name: 'Test Documentation Swagger',
        endpoint: `${baseApiUrl}/docs`,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Succès' : `Erreur: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Test Documentation Swagger',
        endpoint: `${baseApiUrl}/docs`,
        status: 0,
        success: false,
        message: `Erreur de connexion: ${error.message}`
      });
    }

    // Test 4: Vérifier les reviews (endpoint public)
    try {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true'
        }
      });
      
      results.push({
        name: 'Test Reviews Endpoint',
        endpoint: `${apiUrl}/reviews`,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Succès' : `Erreur: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Test Reviews Endpoint',
        endpoint: `${apiUrl}/reviews`,
        status: 0,
        success: false,
        message: `Erreur de connexion: ${error.message}`
      });
    }

    // Test 5: Vérifier les utilisateurs freelancers (endpoint public)
    try {
      const response = await fetch(`${apiUrl}/users/freelancers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true'
        }
      });
      
      results.push({
        name: 'Test Freelancers Endpoint',
        endpoint: `${apiUrl}/users/freelancers`,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'Succès' : `Erreur: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Test Freelancers Endpoint',
        endpoint: `${apiUrl}/users/freelancers`,
        status: 0,
        success: false,
        message: `Erreur de connexion: ${error.message}`
      });
    }

    // Vérifier les résultats
    const allSuccess = results.every(result => result.success);
    const successCount = results.filter(result => result.success).length;

    setTestResults({
      running: false,
      results: results,
      message: allSuccess 
        ? 'Tous les tests ont réussi !' 
        : `${successCount}/${results.length} tests ont réussi. Vérifiez les détails ci-dessous.`
    });
  };

  return (
    <div>
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
          {testResults.running ? 'Test en cours...' : 'Tester la connexion API'}
        </button>
      </div>
      
      {testResults.message && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: testResults.results.every(r => r.success) ? '#dff0d8' : '#f2dede',
          color: testResults.results.every(r => r.success) ? '#3c763d' : '#a94442',
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
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Test</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Endpoint</th>
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
          <strong>Conseils de dépannage :</strong>
        </p>
        <ul>
          <li>Vérifiez que le backend est démarré sur le port 3001</li>
          <li>Assurez-vous que le serveur backend est accessible depuis votre navigateur</li>
          <li>Vérifiez la configuration CORS côté backend</li>
          <li>Consultez les logs du serveur backend pour voir les erreurs potentielles</li>
        </ul>
      </div>
    </div>
  );
} 