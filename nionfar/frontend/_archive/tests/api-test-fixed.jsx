import React, { useState, useRef, useEffect } from 'react';
import ClientOnly from '../components/ClientOnly';

export default function APITestFixed() {
  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Test de connexion au backend Nionfar</h1>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="font-semibold text-lg mb-2">Notes importantes:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Assurez-vous que votre backend est en cours d'exécution sur <strong>http://localhost:3001</strong></li>
          <li>Vérifiez que votre <code>.env</code> est correctement configuré avec <code>NEXT_PUBLIC_API_URL=http://localhost:3001/api</code></li>
          <li>Ce test utilise l'URL configurée dans vos variables d'environnement</li>
        </ul>
      </div>
      <APITestContent />
    </div>
  );
}

function APITestContent() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [testMode, setTestMode] = useState(false);
  const logsEndRef = useRef(null);

  // Fonction pour ajouter des messages de log
  const testApiConnection = async () => {
    setLogs([]);
    setResults([]);
    setStatus('running');

    // Fonction pour ajouter des messages de log
    const logMessage = (type, ...args) => {
      const message = args.join(' ');
      setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
    };

    try {
      // Vérifier l'URL de l'API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      logMessage('info', '📡 URL de l\'API configurée:', apiUrl);

      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');
      if (token) {
        logMessage('info', '🔑 Token d\'authentification trouvé');
      } else {
        logMessage('warn', '⚠️ Aucun token d\'authentification trouvé. Certains tests peuvent échouer.');
      }

      // Options de requête par défaut
      const headers = {
        'Content-Type': 'application/json',
      };

      // Ajouter le token d'authentification si disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Ajouter l'en-tête de mode test si activé
      if (testMode) {
        headers['x-test-mode'] = 'true';
        logMessage('info', '🧪 Mode test activé - Contourne les vérifications de sécurité');
      }

      // Test 1: Vérifier le statut du serveur
      logMessage('info', '🔍 Test #1: Vérification du statut du serveur...');
      try {
        const statusResponse = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          headers
        });

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          logMessage('success', '✅ Connexion au serveur réussie:', JSON.stringify(data));
          setResults(prev => [...prev, { name: 'Statut du serveur', status: 'success' }]);
        } else {
          const errorText = await statusResponse.text();
          logMessage('error', '❌ Échec de la connexion au serveur:', statusResponse.status, statusResponse.statusText, errorText);
          setResults(prev => [...prev, { name: 'Statut du serveur', status: 'error' }]);
        }
      } catch (error) {
        logMessage('error', '❌ Erreur lors de la vérification du statut:', error.message);
        
        // Essayer une route alternative pour le test de ping
        logMessage('info', '🔄 Tentative avec une route alternative...');
        try {
          const altResponse = await fetch(`${apiUrl.replace(/\/api$/, '')}`, { 
            method: 'GET',
            headers
          });
          
          if (altResponse.ok) {
            logMessage('success', '✅ Connexion à la route racine réussie');
            setResults(prev => [...prev, { name: 'Statut du serveur (alt)', status: 'success' }]);
          } else {
            logMessage('error', '❌ Échec également sur la route racine:', altResponse.status);
            setResults(prev => [...prev, { name: 'Statut du serveur (alt)', status: 'error' }]);
          }
        } catch (altError) {
          logMessage('error', '❌ Erreur sur la route alternative:', altError.message);
          setResults(prev => [...prev, { name: 'Statut du serveur (alt)', status: 'error' }]);
        }
      }

      // Test 2: Vérifier l'accès à Swagger
      logMessage('info', '🔍 Test #2: Vérification de la documentation API (Swagger)...');
      try {
        const swaggerResponse = await fetch(`${apiUrl.replace(/\/api$/, '')}/docs`, { 
          method: 'GET',
          headers: { 'Content-Type': 'text/html' }
        });
        
        if (swaggerResponse.ok) {
          logMessage('success', '✅ Documentation API accessible');
          setResults(prev => [...prev, { name: 'Documentation API', status: 'success' }]);
        } else {
          logMessage('warn', '⚠️ Documentation API non accessible:', swaggerResponse.status);
          setResults(prev => [...prev, { name: 'Documentation API', status: 'warning' }]);
        }
      } catch (error) {
        logMessage('warn', '⚠️ Erreur lors de l\'accès à la documentation:', error.message);
        setResults(prev => [...prev, { name: 'Documentation API', status: 'warning' }]);
      }

      // Test 3: Accéder aux données publiques (catégories)
      logMessage('info', '🔍 Test #3: Accès aux données publiques (catégories)...');
      try {
        const categoriesResponse = await fetch(`${apiUrl}/services/categories`, { 
          method: 'GET',
          headers
        });
        
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          logMessage('success', `✅ Accès aux catégories réussi. ${categories.length} catégories trouvées.`);
          setResults(prev => [...prev, { name: 'Données publiques', status: 'success' }]);
        } else {
          const errorText = await categoriesResponse.text();
          logMessage('error', '❌ Échec de l\'accès aux catégories:', categoriesResponse.status, errorText);
          
          // Essayer une route alternative
          logMessage('info', '🔄 Tentative avec une route alternative pour les catégories...');
          try {
            const altCatResponse = await fetch(`${apiUrl}/categories`, { 
              method: 'GET',
              headers
            });
            
            if (altCatResponse.ok) {
              const categories = await altCatResponse.json();
              logMessage('success', `✅ Accès à la route alternative des catégories réussi. ${categories.length} catégories trouvées.`);
              setResults(prev => [...prev, { name: 'Données publiques (alt)', status: 'success' }]);
            } else {
              logMessage('error', '❌ Échec également sur la route alternative des catégories:', altCatResponse.status);
              setResults(prev => [...prev, { name: 'Données publiques', status: 'error' }]);
            }
          } catch (altError) {
            logMessage('error', '❌ Erreur sur la route alternative des catégories:', altError.message);
            setResults(prev => [...prev, { name: 'Données publiques', status: 'error' }]);
          }
        }
      } catch (error) {
        logMessage('error', '❌ Erreur lors de l\'accès aux catégories:', error.message);
        setResults(prev => [...prev, { name: 'Données publiques', status: 'error' }]);
      }

      logMessage('info', '✨ Tests terminés');
      setStatus('completed');
    } catch (error) {
      logMessage('error', '🚫 Erreur critique dans le processus de test:', error.message);
      setStatus('error');
    }
  };

  // Fonction pour lancer tous les tests
  const runTest = async () => {
    await testApiConnection();
  };

  // Scroll automatique vers le bas des logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <button
          onClick={runTest}
          disabled={status === 'running'}
          className={`py-2 px-4 rounded font-medium ${
            status === 'running' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {status === 'running' ? 'Test en cours...' : 'Lancer le test de connexion'}
        </button>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={() => setTestMode(!testMode)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="testMode" className="text-sm font-medium text-gray-700">
            Activer le mode test (contourne les vérifications de sécurité)
          </label>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Résultats:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded flex items-center ${
                  result.status === 'success' ? 'bg-green-50 border border-green-200' :
                  result.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}
              >
                <span 
                  className={`inline-block w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                    result.status === 'success' ? 'bg-green-500' :
                    result.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                >
                  {result.status === 'success' ? '✓' : result.status === 'warning' ? '!' : '✕'}
                </span>
                <span>{result.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded bg-gray-50 p-4 h-80 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Les logs de test s'afficheront ici...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'error' ? 'text-red-600' :
              log.type === 'success' ? 'text-green-600' :
              log.type === 'warn' ? 'text-yellow-600' :
              'text-gray-800'
            }`}>
              <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {status === 'completed' || status === 'error' ? (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">Dépannage:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vérifiez que votre backend est en cours d'exécution sur <code>http://localhost:3001</code></li>
            <li>Vérifiez que votre <code>.env</code> est correctement configuré avec <code>NEXT_PUBLIC_API_URL=http://localhost:3001/api</code></li>
            <li>Vérifiez que CORS est correctement configuré sur le backend</li>
            <li>En cas d'erreur 400, essayez d'activer le mode test pour contourner les vérifications de sécurité</li>
            <li>Si les problèmes persistent, consultez les logs du serveur backend</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
} 