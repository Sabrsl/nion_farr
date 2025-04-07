// Script de test pour vérifier la communication API avec Fetch
const fetch = require('node-fetch');

console.log('Début du test de communication API avec Fetch...');

// Teste l'API d'authentification mockée
const testAuth = async (email, password) => {
  try {
    console.log(`\nTentative de connexion avec: ${email} / ${password}`);
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log(`Statut de la réponse: ${response.status} (${response.statusText})`);
    console.log('En-têtes de réponse:', response.headers);
    
    const contentType = response.headers.get('content-type');
    console.log('Type de contenu:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Réponse de l\'API (parsée):', data);
      return data;
    } else {
      const text = await response.text();
      console.log('Réponse de l\'API (texte):', text);
      return { success: false, error: 'Réponse non-JSON' };
    }
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    return { success: false, error: error.message };
  }
};

// Exécuter les tests
(async () => {
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
})(); 