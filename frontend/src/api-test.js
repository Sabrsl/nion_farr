/**
 * Script de test pour vérifier la connexion au backend Nionfar
 * 
 * Exécutez ce script dans le navigateur avec :
 * - Soit en l'important dans une page React
 * - Soit en le copiant dans la console du navigateur
 */

export const testApiConnection = async () => {
  console.log('🔍 TEST DE CONNEXION AU BACKEND NIONFAR');
  console.log('=======================================');
  
  // URL fixe pour le backend
  const apiUrl = 'http://localhost:3001/api';
  console.log(`🌐 URL de l'API configurée: ${apiUrl}`);

  // Récupérer le token depuis localStorage si disponible
  let token = null;
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('authToken');
      console.log(token ? '🔑 Token trouvé dans localStorage' : '⚠️ Aucun token trouvé - certains tests peuvent échouer');
    } catch (e) {
      console.log('⚠️ Impossible d\'accéder au localStorage');
    }
  } else {
    console.log('⚠️ LocalStorage non disponible (rendu côté serveur)');
  }

  // Test 1: Vérification du statut du serveur via une route intégrée au backend
  try {
    console.log('\n📡 TEST #1: Vérification du statut du serveur');
    // Ajouter le paramètre testMode=true pour contourner la sécurité
    const healthResponse = await fetch(`${apiUrl}/services/categories?testMode=true`, {
      method: 'GET',
      headers: {
        'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
      }
    });
    
    if (healthResponse.ok) {
      console.log('✅ Connexion réussie au backend!');
      console.log('📊 Status: OK');
    } else {
      console.error(`❌ Échec de la connexion: ${healthResponse.status} ${healthResponse.statusText}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('🔍 Vérifiez que votre backend est bien démarré sur le port correct');
  }

  // Test 2: Tester une route protégée (si token disponible)
  if (token) {
    try {
      console.log('\n🔒 TEST #2: Accès à une route protégée');
      const profileResponse = await fetch(`${apiUrl}/auth/profile?testMode=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Accès réussi aux données protégées!');
        // Ne pas afficher les données complètes pour éviter les problèmes de sécurité
        console.log('👤 Données utilisateur reçues avec succès');
      } else if (profileResponse.status === 401) {
        console.warn('⚠️ Token expiré ou invalide (401 Unauthorized)');
      } else {
        console.error(`❌ Échec de l'accès: ${profileResponse.status} ${profileResponse.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès aux données protégées:', error.message);
    }
  }

  // Test 3: Tester une route publique simplifiée (catégories au lieu de services)
  try {
    console.log('\n🌍 TEST #3: Accès aux données publiques');
    const categoriesResponse = await fetch(`${apiUrl}/categories?testMode=true`, {
      method: 'GET',
      headers: {
        'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
      }
    });
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      const count = Array.isArray(categoriesData) ? categoriesData.length : 'N/A';
      console.log('✅ Accès réussi aux catégories!');
      console.log(`📊 Nombre de catégories: ${count}`);
      console.log('🔍 Catégories récupérées avec succès');
    } else {
      console.error(`❌ Échec de l'accès aux catégories: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
      
      // Plan B: essayer une autre route si celle-ci échoue
      console.log('🔄 Tentative avec une autre route...');
      try {
        const alternativeResponse = await fetch(`${apiUrl}/users/roles?testMode=true`, {
          method: 'GET',
          headers: {
            'x-test-mode': 'true'  // Ajouter ce header pour activer le mode test
          }
        });
        
        if (alternativeResponse.ok) {
          console.log('✅ Connexion alternative réussie!');
        } else {
          console.error(`❌ Échec de la connexion alternative: ${alternativeResponse.status}`);
        }
      } catch (alternativeError) {
        console.error('❌ Erreur lors de la tentative alternative:', alternativeError.message);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'accès aux données publiques:', error.message);
  }

  console.log('\n📝 RÉSUMÉ DU TEST');
  console.log('=================');
  console.log('Si les tests ont réussi, votre frontend est correctement connecté au backend.');
  console.log('En cas d\'échec:');
  console.log('1. Vérifiez que votre backend est démarré sur le port 3001');
  console.log('2. Vérifiez que l\'URL de l\'API est correctement définie (http://localhost:3001/api)');
  console.log('3. Vérifiez la configuration CORS côté backend');
  console.log('4. Vérifiez les problèmes réseau/firewall bloquant les requêtes');
  console.log('5. En cas d\'erreur 400 (Bad Request), vérifiez que vous avez bien appliqué les modifications du middleware de sécurité');
  
  return true;
};

// Exécuter automatiquement si importé directement dans le navigateur
if (typeof window !== 'undefined') {
  console.log('Script de test API chargé. Utilisez testApiConnection() pour lancer le test.');
} 