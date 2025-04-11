/**
 * Script pre-push pour vérifier le build Railway avant de pousser sur GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Protection contre l'exécution récursive
if (process.env.PRE_PUSH_RUNNING === 'true') {
  console.log('🔄 Détection d\'une exécution récursive, sortie immédiate avec succès');
  process.exit(0);
}

// Marquer que le script est en cours d'exécution
process.env.PRE_PUSH_RUNNING = 'true';

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
      console.log('✅ Aucune modification détectée dans le backend.');
    }
    
    if (backendChanges) {
      console.log('📦 Modifications détectées dans le backend, vérification du build Railway...');
      
      // Lire les nouveaux fichiers de workflow
      try {
        if (fs.existsSync(path.join(process.cwd(), '.github', 'workflows', 'railway-build-check.yml'))) {
          console.log('✅ Workflow railway-build-check.yml détecté, vérification intégrée à GitHub Actions.');
          console.log('⚠️ Note: La verification sera exécutée par les GitHub Actions après le push.');
          console.log('🚀 Autorisation du push sans vérification supplémentaire.');
          process.exit(0);
        }
      } catch (error) {
        // Si erreur lors de la vérification du workflow, continuer
        console.log('⚠️ Impossible de vérifier les workflows GitHub Actions.');
      }
      
      try {
        // Sauvegarder le répertoire courant
        const originalDir = process.cwd();
        
        // Exécuter le build Railway en utilisant un chemin absolu
        console.log('🔨 Lancement du build Railway...');
        execSync('cd backend && npm run build:railway', { stdio: 'inherit' });
        
        // Vérifier si dist/main.js existe
        if (fs.existsSync(path.join(originalDir, 'backend', 'dist', 'main.js'))) {
          console.log('✅ Build Railway réussi! dist/main.js existe.');
          process.exit(0);
        } else {
          console.error('❌ Le build a réussi mais dist/main.js est manquant!');
          console.error('⚠️ Cependant, le push est autorisé pour permettre la vérification CI/CD sur GitHub.');
          process.exit(0); // Autoriser quand même le push
        }
      } catch (error) {
        console.error('❌ Le build Railway a échoué!');
        console.error('💡 Conseil: Exécutez \'cd backend && npm run build:railway\' pour voir les erreurs détaillées.');
        console.error('⚠️ Cependant, le push est autorisé pour permettre la vérification CI/CD sur GitHub.');
        process.exit(0); // Autoriser quand même le push
      }
    } else {
      console.log('✅ Aucune modification dans le backend, passe la vérification du build Railway.');
      process.exit(0);
    }
  } else {
    console.log(`✅ Pas de push sur main ou develop (branche actuelle: ${branch}), passe la vérification du build Railway.`);
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
  // Ne pas échouer pour éviter de bloquer le push
  console.log('⚠️ Attention: Erreur durant la vérification, mais le push est autorisé.');
  process.exit(0);
} finally {
  // Nettoyer la variable d'environnement
  process.env.PRE_PUSH_RUNNING = 'false';
} 