// Script de test pour vérifier la communication API
const https = require('https');
const http = require('http');

console.log('Début du test de communication API...');

// Teste l'API d'authentification mockée
const testAuth = (email, password) => {
  return new Promise((resolve, reject) => {
    // Préparer les données de la requête
    const data = JSON.stringify({ email, password });
    
    console.log(`Tentative de connexion avec: ${email} / ${password}`);

    // Options de la requête
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    // Créer la requête
    const req = http.request(options, (res) => {
      console.log(`Statut de la réponse: ${res.statusCode}`);
      console.log('En-têtes de réponse:', JSON.stringify(res.headers, null, 2));
      
      let responseData = '';
      
      // Récupérer les données de la réponse
      res.on('data', (chunk) => {
        responseData += chunk;
        console.log('Chunk reçu:', chunk.toString());
      });
      
      // Finaliser la réponse
      res.on('end', () => {
        console.log('Données brutes reçues:', responseData);
        
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          console.log('Réponse de l\'API (parsée):', parsedData);
          resolve(parsedData);
        } catch (e) {
          console.error('Erreur lors du parsing de la réponse:', e);
          console.log('Données reçues mais non parsables:', responseData);
          reject(e);
        }
      });
    });
    
    // Gérer les erreurs de requête
    req.on('error', (error) => {
      console.error('Erreur lors de la requête:', error);
      reject(error);
    });
    
    // Envoyer les données
    req.write(data);
    req.end();
  });
};

// Tests avec différents identifiants
const runTests = async () => {
  try {
    // Test avec les identifiants du mock
    console.log('\n=== TEST 1: Identifiants du mock ===');
    const result1 = await testAuth('jean.dupont@example.com', 'password123');
    
    // Test avec un identifiant "test" (mentionné dans authService.ts)
    console.log('\n=== TEST 2: Identifiant contenant "test" ===');
    const result2 = await testAuth('test@example.com', 'password123');
    
    // Test avec des identifiants invalides
    console.log('\n=== TEST 3: Identifiants invalides ===');
    const result3 = await testAuth('invalide@example.com', 'mauvaismdp');
    
    console.log('\n=== RÉSUMÉ DES TESTS ===');
    console.log('Test 1:', result1.success ? 'RÉUSSI' : 'ÉCHOUÉ');
    console.log('Test 2:', result2.success ? 'RÉUSSI' : 'ÉCHOUÉ');
    console.log('Test 3:', result3.success ? 'RÉUSSI' : 'ÉCHOUÉ');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tests:', error);
  }
};

// Lancer les tests
runTests(); 