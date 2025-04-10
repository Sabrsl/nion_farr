#!/usr/bin/env node

/**
 * Script de validation du déploiement sur Railway
 * Ce script vérifie que les routes critiques fonctionnent correctement
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question et obtenir une réponse
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🔍 Validation du déploiement sur Railway...');
  
  // Demander l'URL de l'API avec l'URL fournie comme valeur par défaut
  const defaultUrl = 'https://nionfar.up.railway.app';
  const apiUrlInput = await question(`Entrez l'URL de l'API Railway [${defaultUrl}]: `);
  const apiUrl = apiUrlInput.trim() || defaultUrl;
  
  if (!apiUrl) {
    console.error('❌ URL invalide');
    process.exit(1);
  }
  
  const endpoints = [
    '/health',
    '/api/services/categories/count',
    // Ajoutez d'autres endpoints critiques ici
  ];
  
  console.log('\n🧪 Test des endpoints critiques:');
  
  let allSuccess = true;
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${apiUrl}${endpoint}`);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${endpoint} - ${response.status} (${duration}ms)`);
      
      // Vérifier spécifiquement /api/services/categories/count
      if (endpoint === '/api/services/categories/count') {
        if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
          console.log(`   ℹ️  Nombre de catégories: ${response.data.categories.length}`);
        } else {
          console.warn(`⚠️  Format de réponse inattendu pour ${endpoint}`);
          allSuccess = false;
        }
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - ${error.message}`);
      if (error.response) {
        console.error(`   Code: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`);
      }
      allSuccess = false;
    }
  }
  
  console.log('\n📊 Résultat de la validation:');
  if (allSuccess) {
    console.log('✅ Tous les endpoints testés fonctionnent correctement!');
    console.log('\n🚀 Votre application est correctement déployée sur Railway.');
    console.log('\n🔄 Étapes suivantes:');
    console.log('1. Vérifiez manuellement le fonctionnement de votre application frontend avec cette API');
    console.log('2. Mettez en pause votre application sur Render (ne la supprimez pas encore)');
    console.log('3. Après quelques jours de fonctionnement stable, vous pourrez supprimer l\'application sur Render');
  } else {
    console.error('⚠️ Certains endpoints ne fonctionnent pas correctement.');
    console.log('\n🔧 Vérifiez:');
    console.log('1. Les variables d\'environnement dans Railway');
    console.log('2. Les logs de l\'application sur Railway');
    console.log('3. La connexion à MongoDB');
    console.log('4. Les autorisations CORS');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Erreur lors de la validation:', error.message);
  rl.close();
  process.exit(1);
}); 