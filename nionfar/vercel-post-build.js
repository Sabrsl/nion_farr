// Script post-build pour Vercel
console.log('🧹 Nettoyage post-build...');

const fs = require('fs');
const path = require('path');

// Nettoyer les fichiers temporaires si nécessaire
const tempDir = path.join(__dirname, '.temp');
if (fs.existsSync(tempDir)) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✅ Répertoire temporaire supprimé');
  } catch (error) {
    console.warn('⚠️ Impossible de supprimer le répertoire temporaire:', error.message);
  }
}

// Vérifier la taille du build
try {
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    const stats = getDirectorySize(nextDir);
    console.log(`📊 Taille du build: ${formatBytes(stats.size)}`);
    console.log(`📊 Nombre de fichiers: ${stats.files}`);
  }
} catch (error) {
  console.warn('⚠️ Impossible de calculer la taille du build:', error.message);
}

console.log('✅ Post-build terminé, déploiement prêt.');

// Fonctions utilitaires
function getDirectorySize(dir) {
  let size = 0;
  let files = 0;
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const subStats = getDirectorySize(itemPath);
        size += subStats.size;
        files += subStats.files;
      } else {
        const stats = fs.statSync(itemPath);
        size += stats.size;
        files++;
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erreur lors de l'analyse du répertoire ${dir}:`, error.message);
  }
  
  return { size, files };
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 