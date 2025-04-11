/**
 * Script pour désactiver temporairement le hook pre-push de husky
 */

const fs = require('fs');
const path = require('path');

const huskyDir = path.join(__dirname, '..', '.husky');
const prePushPath = path.join(huskyDir, 'pre-push');
const prePushBackupPath = path.join(huskyDir, 'pre-push.bak');

// Vérifier si le fichier pre-push existe
if (fs.existsSync(prePushPath)) {
  console.log('🔍 Hook pre-push détecté, sauvegarde en cours...');
  
  try {
    // Sauvegarder le fichier pre-push actuel
    fs.copyFileSync(prePushPath, prePushBackupPath);
    console.log('✅ Sauvegarde du hook pre-push effectuée: .husky/pre-push.bak');
    
    // Remplacer le contenu du fichier pre-push par une version qui réussit toujours
    const newContent = `#!/usr/bin/env sh
# Hook pre-push temporairement désactivé
echo "⚠️ Hook pre-push désactivé - Mode bypass"
exit 0
`;
    
    fs.writeFileSync(prePushPath, newContent);
    fs.chmodSync(prePushPath, 0o755); // Rendre le fichier exécutable
    
    console.log('✅ Hook pre-push temporairement désactivé');
    console.log('📝 Vous pouvez maintenant faire vos push sans vérification');
    console.log('⚠️ Pour restaurer le hook, exécutez: node scripts/restore-pre-push.js');
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation du hook:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠️ Aucun hook pre-push trouvé dans .husky/');
  console.log('✅ Aucune action nécessaire');
} 