import { useState, useEffect } from 'react';

export default function APITestSimple() {
  const [status, setStatus] = useState('Prêt à tester');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fonction de test ultra-simplifiée
  async function testConnection() {
    setLoading(true);
    setStatus('Test en cours...');
    setResults([]);
    
    const newResults = [];
    
    // Ajouter un message
    function addResult(message, success = true) {
      newResults.push({ message, success });
      setResults([...newResults]);
    }

    try {
      // Test 1: Simple GET sur une route health
      addResult("Tentative de connexion à l'API...");
      
      try {
        const response = await fetch("http://localhost:3001/health", {
          method: 'GET'
        });
        
        if (response.ok) {
          addResult("✅ Endpoint /health accessible!", true);
          try {
            const data = await response.json();
            addResult(`✅ Statut: ${data.status || 'OK'}`, true);
          } catch (e) {
            addResult("Réponse reçue mais non-JSON", false);
          }
        } else {
          addResult(`❌ Erreur health ${response.status}`, false);
          
          // Tentative alternative avec la racine
          try {
            const rootResponse = await fetch("http://localhost:3001/", {
              method: 'GET'
            });
            
            if (rootResponse.ok) {
              addResult("✅ Route racine accessible!", true);
            } else {
              addResult(`❌ Erreur racine ${rootResponse.status}`, false);
            }
          } catch (e) {
            addResult(`❌ Erreur racine: ${e.message}`, false);
          }
        }
      } catch (error) {
        addResult(`❌ Connexion impossible: ${error.message}`, false);
      }
      
      // Test 2: Vérifier Swagger
      try {
        const docsResponse = await fetch("http://localhost:3001/docs", {
          method: 'GET'
        });
        
        if (docsResponse.ok) {
          addResult("✅ Documentation Swagger accessible!", true);
        } else {
          addResult(`❌ Documentation non accessible: ${docsResponse.status}`, false);
        }
      } catch (error) {
        addResult(`❌ Erreur Swagger: ${error.message}`, false);
      }
      
      // Test 3: Vérifier si l'API répond en utilisant une URL sans /api
      addResult("Test d'une route sans middleware de sécurité...");
      
      try {
        // Tentative sans le préfixe /api qui pourrait contourner le middleware
        const testResponse = await fetch("http://localhost:3001/", {
          method: 'GET'
        });
        
        if (testResponse.ok) {
          addResult("✅ Backend répond correctement!", true);
          addResult("🔍 Le serveur fonctionne, mais le middleware de sécurité peut bloquer certaines requêtes", true);
        } else {
          addResult(`❌ Erreur ${testResponse.status}`, false);
        }
      } catch (error) {
        addResult(`❌ Erreur: ${error.message}`, false);
      }
      
      setStatus('Test terminé');
    } catch (error) {
      addResult(`❌ Erreur générale: ${error.message}`, false);
      setStatus('Erreur pendant le test');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Test API Simple</h1>
      <p style={{ marginBottom: "20px" }}>
        Test de connexion au backend sans élément complexe qui pourrait déclencher la protection NoSQL
      </p>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: "10px 15px",
          backgroundColor: loading ? "#cccccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "default" : "pointer",
          marginBottom: "20px"
        }}
      >
        {loading ? "Test en cours..." : "Démarrer le test simple"}
      </button>
      
      <div style={{
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        marginBottom: "20px"
      }}>
        <strong>Statut: </strong> {status}
      </div>
      
      {results.length > 0 && (
        <div style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "15px"
        }}>
          <h3>Résultats:</h3>
          <ul style={{ paddingLeft: "20px" }}>
            {results.map((result, index) => (
              <li 
                key={index}
                style={{
                  color: result.success ? "#2e7d32" : "#c62828",
                  marginBottom: "8px"
                }}
              >
                {result.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{
        marginTop: "30px",
        borderTop: "1px solid #eee",
        paddingTop: "15px",
        fontSize: "14px",
        color: "#666"
      }}>
        <p><strong>Note:</strong> Ce test est intentionnellement simplifié pour éviter de déclencher les protections de sécurité.</p>
        <p>Si les tests échouent, vérifiez que:</p>
        <ul>
          <li>Le backend est bien en cours d'exécution sur le port 3001</li>
          <li>CORS est correctement configuré sur le backend</li>
          <li>Le middleware de sécurité NoSQL n'est pas trop restrictif</li>
        </ul>
        <p>
          <strong>Solutions possibles:</strong> Si les tests échouent systématiquement avec erreur 400 (Bad Request),
          cela indique que le middleware de sécurité est très restrictif. Vous devrez peut-être le désactiver ou l'ajuster
          dans le code du backend.
        </p>
      </div>
    </div>
  );
}