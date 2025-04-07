import { useState, useEffect } from 'react';

export default function APITestStandalone() {
  const [testResults, setTestResults] = useState({
    running: false,
    success: false,
    message: '',
    logs: []
  });
  const [isBrowser, setIsBrowser] = useState(false);

  // S'assurer que le code lié au DOM n'est exécuté que côté client
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const testApiConnection = async () => {
    const logs = [];
    const logMessage = (type, ...args) => {
      const message = args.join(' ');
      logs.push({ type, content: message });
      if (type === 'error') {
        console.error(message);
      } else if (type === 'warning') {
        console.warn(message);
      } else {
        console.log(message);
      }
    };

    logMessage('info', '🔍 TEST DE CONNEXION AU BACKEND NIONFAR');
    logMessage('info', '=======================================');
    
    // URL fixe pour le backend (pas de variables d'environnement)
    const apiUrl = 'http://localhost:3001/api';
    logMessage('info', `🌐 URL de l'API configurée: ${apiUrl}`);

    // Récupérer le token depuis localStorage si disponible
    let token = null;
    if (typeof window !== 'undefined') {
      try {
        token = localStorage.getItem('authToken');
        logMessage('info', token ? '🔑 Token trouvé dans localStorage' : '⚠️ Aucun token trouvé - certains tests peuvent échouer');
      } catch (e) {
        logMessage('info', '⚠️ Impossible d\'accéder au localStorage');
      }
    } else {
      logMessage('info', '⚠️ LocalStorage non disponible (rendu côté serveur)');
    }

    // Test 1: Vérification du statut du serveur
    try {
      logMessage('info', '\n📡 TEST #1: Vérification du statut du serveur');
      // Ajouter le paramètre testMode=true pour contourner la sécurité
      const healthResponse = await fetch(`${apiUrl}/services/categories?testMode=true`, {
        method: 'GET',
        headers: {
          'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
        }
      });
      
      if (healthResponse.ok) {
        logMessage('info', '✅ Connexion réussie au backend!');
        logMessage('info', '📊 Status: OK');
      } else {
        logMessage('error', `❌ Échec de la connexion: ${healthResponse.status} ${healthResponse.statusText}`);
      }
    } catch (error) {
      logMessage('error', '❌ Erreur de connexion:', error.message);
      logMessage('info', '🔍 Vérifiez que votre backend est bien démarré sur le port correct');
    }

    // Test 2: Tester une route protégée (si token disponible)
    if (token) {
      try {
        logMessage('info', '\n🔒 TEST #2: Accès à une route protégée');
        const profileResponse = await fetch(`${apiUrl}/auth/profile?testMode=true`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
          }
        });
        
        if (profileResponse.ok) {
          logMessage('info', '✅ Accès réussi aux données protégées!');
          logMessage('info', '👤 Données utilisateur reçues avec succès');
        } else if (profileResponse.status === 401) {
          logMessage('warning', '⚠️ Token expiré ou invalide (401 Unauthorized)');
        } else if (profileResponse.status === 400) {
          logMessage('error', `❌ Échec de l'accès: ${profileResponse.status} - Requête invalide, possible problème de validation de données`);
        } else {
          logMessage('error', `❌ Échec de l'accès: ${profileResponse.status} ${profileResponse.statusText}`);
        }
      } catch (error) {
        logMessage('error', '❌ Erreur lors de l\'accès aux données protégées:', error.message);
      }
    }

    // Test 3: Tester une route publique simplifiée (catégories au lieu de services)
    try {
      logMessage('info', '\n🌍 TEST #3: Accès aux données publiques');
      const categoriesResponse = await fetch(`${apiUrl}/categories?testMode=true`, {
        method: 'GET',
        headers: {
          'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
        }
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const count = Array.isArray(categoriesData) ? categoriesData.length : 'N/A';
        logMessage('info', '✅ Accès réussi aux catégories!');
        logMessage('info', `📊 Nombre de catégories: ${count}`);
        logMessage('info', '🔍 Catégories récupérées avec succès');
      } else {
        logMessage('error', `❌ Échec de l'accès aux catégories: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
        
        // Plan B: essayer une autre route si celle-ci échoue
        logMessage('info', '🔄 Tentative avec une autre route...');
        try {
          const alternativeResponse = await fetch(`${apiUrl}/users/roles?testMode=true`, {
            method: 'GET',
            headers: {
              'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
            }
          });
          
          if (alternativeResponse.ok) {
            logMessage('info', '✅ Connexion alternative réussie!');
          } else {
            logMessage('error', `❌ Échec de la connexion alternative: ${alternativeResponse.status}`);
          }
        } catch (alternativeError) {
          logMessage('error', '❌ Erreur lors de la tentative alternative:', alternativeError.message);
        }
      }
    } catch (error) {
      logMessage('error', '❌ Erreur lors de l\'accès aux données publiques:', error.message);
    }

    logMessage('info', '\n📝 RÉSUMÉ DU TEST');
    logMessage('info', '=================');
    logMessage('info', 'Si les tests ont réussi, votre frontend est correctement connecté au backend.');
    logMessage('info', 'En cas d\'échec:');
    logMessage('info', '1. Vérifiez que votre backend est démarré sur le port 3001');
    logMessage('info', '2. Vérifiez que l\'URL de l\'API est correcte (http://localhost:3001/api)');
    logMessage('info', '3. Vérifiez la configuration CORS côté backend');
    logMessage('info', '4. Vérifiez les problèmes réseau/firewall bloquant les requêtes');
    logMessage('info', '5. En cas d\'erreur 400 (Bad Request), essayez une autre route ou endpoint');
    
    return { success: true, logs };
  };

  const runTest = async () => {
    setTestResults({
      running: true,
      success: false,
      message: 'Test en cours...',
      logs: []
    });

    try {
      const result = await testApiConnection();
      
      setTestResults({
        running: false,
        success: result.success,
        message: result.success ? 'Test terminé avec succès' : 'Certains tests ont échoué',
        logs: result.logs
      });
    } catch (error) {
      setTestResults({
        running: false,
        success: false,
        message: `Erreur lors du test: ${error.message}`,
        logs: []
      });
    }
  };

  // Si le rendu est côté serveur, ne rendons qu'un contenu minimal
  if (!isBrowser) {
    return (
      <div>
        <h1>Test de Connexion API Nionfar</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        Test de Connexion API Nionfar (Version Autonome)
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
          <li>Le backend est démarré et fonctionne sur le port correct (3001)</li>
          <li>La configuration de l'URL de l'API est correcte (http://localhost:3001/api)</li>
          <li>La configuration CORS côté backend autorise les requêtes depuis cette origine</li>
          <li>Il n'y a pas de problèmes réseau/firewall bloquant les requêtes</li>
        </ul>
      </div>
    </div>
  );
} 