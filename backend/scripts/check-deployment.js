#!/usr/bin/env node

/**
 * Script de diagnostic pour le déploiement Railway
 * Ce script vérifie la connectivité, les variables d'environnement et tente de diagnostiquer
 * les problèmes courants de déploiement.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question et obtenir une réponse
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🔍 Diagnostic du déploiement Railway...');
  console.log('====================================');
  
  // Récupération de l'URL Railway
  const railwayUrl = 'https://nionfar.up.railway.app';
  console.log(`URL Railway: ${railwayUrl}`);
  
  // Vérification de la connectivité de base
  console.log('\n📡 Vérification de la connectivité de base...');
  try {
    const pingResponse = await axios.get(railwayUrl, { 
      validateStatus: () => true,
      timeout: 10000
    });
    console.log(`Statut de base: ${pingResponse.status} - ${pingResponse.statusText}`);
    console.log(`Réponse: ${pingResponse.status === 200 ? 'OK' : 'Problème potentiel'}`);
    
    if (pingResponse.status === 404) {
      console.log('⚠️  L\'application répond mais renvoie une erreur 404. Vérifiez que:');
      console.log('   - Le build a réussi sur Railway');
      console.log('   - La commande de démarrage est correcte');
      console.log('   - Les routes sont correctement configurées');
    }
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error.message);
    console.log('⚠️  Impossible de se connecter à l\'application. Causes possibles:');
    console.log('   - Le déploiement n\'est pas terminé ou a échoué');
    console.log('   - Le service est en cours de redémarrage');
    console.log('   - L\'URL est incorrecte');
  }
  
  // Vérification des endpoints d'API
  console.log('\n🔄 Test des endpoints API spécifiques...');
  const endpoints = [
    '/health',
    '/api/health',  // Alternative si le prefix API est requis
    '/api',
    '/api/services/categories/count'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${railwayUrl}${endpoint}`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      console.log(`Endpoint ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        try {
          console.log(`  Réponse: ${JSON.stringify(response.data).substring(0, 100)}${JSON.stringify(response.data).length > 100 ? '...' : ''}`);
        } catch (e) {
          console.log(`  Réponse: [Données non affichables]`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur sur ${endpoint}:`, error.message);
    }
  }
  
  // Vérification des variables d'environnement dans .env.railway
  console.log('\n🔑 Vérification des variables d\'environnement essentielles...');
  try {
    const envPath = path.join(process.cwd(), '.env.railway');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      const criticalVars = ['MONGODB_URI', 'PORT', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
      const missingVars = [];
      
      for (const varName of criticalVars) {
        const varLine = envLines.find(line => line.startsWith(`${varName}=`));
        if (!varLine || varLine.includes('PLACEHOLDER') || varLine.split('=')[1].trim() === '') {
          missingVars.push(varName);
        }
      }
      
      if (missingVars.length > 0) {
        console.error(`❌ Variables d'environnement manquantes ou incomplètes: ${missingVars.join(', ')}`);
        console.log('⚠️  Ces variables doivent être configurées correctement dans Railway et dans votre fichier .env.railway');
      } else {
        console.log('✅ Toutes les variables d\'environnement critiques sont présentes dans .env.railway');
      }
    } else {
      console.error('❌ Fichier .env.railway non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des variables d\'environnement:', error.message);
  }
  
  // Vérification de la connexion MongoDB
  console.log('\n💾 Vérification de la connexion MongoDB...');
  console.log('Il n\'est pas possible de vérifier directement la connexion MongoDB depuis ce script.');
  console.log('Vérifiez les logs Railway pour les problèmes de connexion à la base de données.');
  console.log('Assurez-vous que:');
  console.log('- L\'URI MongoDB est correct');
  console.log('- Les identifiants MongoDB sont valides');
  console.log('- Les adresses IP autorisées incluent les IPs de Railway (0.0.0.0/0 pour le développement)');
  
  // Conseils pour le débogage
  console.log('\n🔧 Conseils de débogage:');
  console.log('1. Consultez les logs Railway via l\'interface web');
  console.log('2. Vérifiez que le build s\'est terminé avec succès');
  console.log('3. Essayez de redémarrer le service manuellement');
  console.log('4. Vérifiez que la configuration CORS est correcte (CORS_ALLOWED_ORIGINS)');
  console.log('5. Si nécessaire, augmentez la mémoire allouée via NODE_OPTIONS dans les variables d\'environnement');
  
  // Commandes utiles
  console.log('\n💻 Commandes utiles pour le débogage:');
  console.log('- railway logs              # Voir les logs de l\'application');
  console.log('- railway restart          # Redémarrer l\'application');
  console.log('- railway vars             # Voir les variables d\'environnement');
  console.log('- railway up               # Redéployer l\'application');
  
  // Question à l'utilisateur pour les prochaines étapes
  const nextStep = await question('\nSouhaitez-vous redéployer l\'application sur Railway? (o/n): ');
  if (nextStep.toLowerCase() === 'o') {
    console.log('\n⚠️  Pour redéployer manuellement:');
    console.log('1. Accédez au dashboard Railway: https://railway.app/dashboard');
    console.log('2. Sélectionnez votre projet "nionfar"');
    console.log('3. Cliquez sur "Redeploy" ou "Deploy"');
    console.log('4. Attendez la fin du déploiement');
    console.log('5. Exécutez à nouveau ce script pour vérifier le statut');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Erreur lors du diagnostic:', error.message);
  rl.close();
  process.exit(1);
}); 