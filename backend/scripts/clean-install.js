const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des dépendances...');

// Supprimer node_modules et package-lock.json
const filesToRemove = ['node_modules', 'package-lock.json'];
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`Suppression de ${file}...`);
    try {
      if (file === 'node_modules') {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de supprimer ${file}: ${error.message}`);
    }
  }
});

// Créer/mettre à jour .npmrc
const npmrcPath = path.join(__dirname, '..', '.npmrc');
const npmrcContent = `save-exact=true
legacy-peer-deps=true
strict-peer-dependencies=false
script-shell="C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"`;

try {
  fs.writeFileSync(npmrcPath, npmrcContent);
  console.log('✅ Configuration .npmrc mise à jour');
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour de .npmrc:', error.message);
  process.exit(1);
}

// Réinstaller les dépendances
console.log('📦 Installation des dépendances...');
try {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['install'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    shell: true
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`npm install failed with status ${result.status}`);
  }

  console.log('✅ Installation terminée avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'installation:', error.message);
  process.exit(1);
} 