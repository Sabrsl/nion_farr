/**
 * Ce script vérifie que l'application démarre correctement avec les variables Railway
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Vérification du démarrage de l\'application avec la configuration Railway');

// Variables d'environnement simulant Railway
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3000',
  RAILWAY_DEPLOYMENT: 'true',
  IS_RENDER: 'false',
  MEMORY_OPTIMIZED: 'true',
};

// Chemin vers le fichier main.js
const mainJsPath = path.join(__dirname, '..', 'dist', 'main.js');

console.log(`📁 Vérification du chemin de main.js: ${mainJsPath}`);
const fs = require('fs');
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ Le fichier main.js n\'existe pas! Veuillez construire l\'application d\'abord.');
  console.error('   Exécutez: npm run build');
  process.exit(1);
}

console.log('✅ Le fichier main.js existe.');

// Démarrer l'application
console.log('🚀 Démarrage de l\'application...');
const app = spawn('node', [mainJsPath], { 
  env,
  stdio: 'inherit'
});

// Gérer les événements
app.on('error', (error) => {
  console.error(`❌ Erreur au démarrage: ${error.message}`);
  process.exit(1);
});

// Afficher un message après 5 secondes
setTimeout(() => {
  console.log('\n🔍 L\'application semble démarrer correctement.');
  console.log('   Vous pouvez accéder à l\'application sur: http://localhost:3000');
  console.log('   Appuyez sur Ctrl+C pour arrêter.');
}, 5000);

// Gérer la sortie
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt de la vérification...');
  app.kill();
  process.exit(0);
}); 