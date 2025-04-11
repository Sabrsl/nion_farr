/**
 * Script pour restaurer le hook pre-push de husky après désactivation temporaire
 */

const fs = require('fs');
const path = require('path');

const huskyDir = path.join(__dirname, '..', '.husky');
const prePushPath = path.join(huskyDir, 'pre-push');
const prePushBackupPath = path.join(huskyDir, 'pre-push.bak');

// Vérifier si la sauvegarde du fichier pre-push existe
if (fs.existsSync(prePushBackupPath)) {
  console.log('🔍 Sauvegarde du hook pre-push détectée, restauration en cours...');
  
  try {
    // Restaurer le fichier pre-push original
    fs.copyFileSync(prePushBackupPath, prePushPath);
    fs.chmodSync(prePushPath, 0o755); // Rendre le fichier exécutable
    
    // Supprimer le fichier de sauvegarde
    fs.unlinkSync(prePushBackupPath);
    
    console.log('✅ Hook pre-push restauré avec succès');
    console.log('⚠️ Les vérifications avant push sont à nouveau actives');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration du hook:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠️ Aucune sauvegarde du hook pre-push trouvée');
  console.log('💡 Si vous souhaitez désactiver le hook, exécutez d\'abord: node scripts/disable-pre-push.js');
} 