/**
 * Script pre-push pour vérifier le build Railway avant de pousser sur GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du build Railway avant le push...');

try {
  // Obtenir la branche actuelle
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  
  // Ne vérifier que si on pousse sur main ou develop
  if (branch === 'main' || branch === 'develop') {
    console.log(`🚀 Push sur ${branch} détecté, vérification du build Railway...`);
    
    // Vérifier si des fichiers du backend ont été modifiés
    let backendChanges = '';
    try {
      backendChanges = execSync('git diff --cached --name-only | grep "^backend/"').toString().trim();
    } catch (error) {
      // Si grep ne trouve rien, il renvoie un code d'erreur, c'est normal
      backendChanges = '';
    }
    
    if (backendChanges) {
      console.log('📦 Modifications détectées dans le backend, vérification du build Railway...');
      
      try {
        // Exécuter le build Railway
        process.chdir('backend');
        console.log('📂 Dossier courant:', process.cwd());
        
        console.log('🔨 Lancement du build Railway...');
        execSync('npm run build:railway', { stdio: 'inherit' });
        
        // Vérifier si dist/main.js existe
        if (fs.existsSync(path.join(process.cwd(), 'dist', 'main.js'))) {
          console.log('✅ Build Railway réussi! dist/main.js existe.');
          process.exit(0);
        } else {
          console.error('❌ Le build a réussi mais dist/main.js est manquant!');
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Le build Railway a échoué!');
        console.error('💡 Conseil: Exécutez \'cd backend && npm run build:railway\' pour voir les erreurs détaillées.');
        process.exit(1);
      }
    } else {
      console.log('✅ Aucune modification dans le backend, passe la vérification du build Railway.');
      process.exit(0);
    }
  } else {
    console.log('✅ Pas de push sur main ou develop, passe la vérification du build Railway.');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
  process.exit(1);
} 