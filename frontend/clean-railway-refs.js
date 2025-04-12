/**
 * Script pour rechercher et remplacer toutes les références à Railway
 * dans tous les fichiers du projet frontend
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Recherche et remplacement des références à Railway...');

const RAILWAY_PATTERNS = [
  'nionfar.up.railway.app',
  'nionfar.railway.app',
  'railway.app',
  '.railway.',
  'RAILWAY_'
];

const REPLACEMENT_URL = 'https://nion-farr-backend.vercel.app';
const REPLACEMENT_API_URL = 'https://nion-farr-backend.vercel.app/api';

// Extensions de fichiers à vérifier
const FILE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.json', '.html', 
  '.css', '.scss', '.md', '.env', '.env.local', '.env.production'
];

// Dossiers à ignorer
const IGNORED_DIRS = [
  'node_modules', '.git', '.next', 'out', 'dist', 'build'
];

// Forcer les variables d'environnement
process.env.NEXT_PUBLIC_API_URL = REPLACEMENT_API_URL;
process.env.NEXT_PUBLIC_APP_URL = 'https://nion-farr.vercel.app';
process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
console.log('✅ Variables d\'environnement forcées pendant l\'exécution');

/**
 * Vérifie si un fichier doit être traité en fonction de son extension
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return FILE_EXTENSIONS.includes(ext);
}

/**
 * Recherche les occurrences des motifs Railway dans un fichier et les remplace
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Recherche de motifs Railway
    RAILWAY_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(newContent)) {
        console.log(`🔍 Référence à Railway trouvée dans: ${filePath}`);
        modified = true;

        // Remplace selon le contexte
        if (pattern.includes('railway.app') || pattern.includes('railway')) {
          // Remplacer les URLs avec /api
          newContent = newContent.replace(new RegExp(`https?://[^/'"\\s]*${pattern}[^/'"\\s)]*?/api[^'"\\s)]*`, 'gi'), REPLACEMENT_API_URL);
          
          // Remplacer les URLs sans /api
          newContent = newContent.replace(new RegExp(`https?://[^/'"\\s]*${pattern}[^'"\\s)]*`, 'gi'), REPLACEMENT_URL);
          
          // Remplacer les chaînes textuelles
          if (pattern === 'nionfar.up.railway.app') {
            newContent = newContent.replace(new RegExp(pattern, 'gi'), 'nion-farr-backend.vercel.app');
          }
        } else if (pattern === 'RAILWAY_') {
          // Remplacer les variables d'environnement
          newContent = newContent.replace(/RAILWAY_DEPLOYMENT=true/gi, 'VERCEL_DEPLOYMENT=true');
        }
      }
    });

    // Recherche supplémentaire pour les cas spéciaux
    if (filePath.endsWith('next.config.js')) {
      // Forcer apiUrl à toujours être l'URL Vercel
      newContent = newContent.replace(
        /(const\s+)(productionApiUrl|apiUrl)(\s*=\s*)([^;]+)/g, 
        `$1$2$3'${REPLACEMENT_API_URL}'`
      );
      
      // Forcer la destination à toujours utiliser REPLACEMENT_API_URL
      newContent = newContent.replace(
        /(destination:\s*`)(\${apiUrl}|[^`]+)(`)/g,
        `$1${REPLACEMENT_API_URL}$3`
      );
      
      modified = true;
    }

    // Si des modifications ont été faites, écrire le fichier
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fichier mis à jour: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du traitement du fichier ${filePath}:`, error.message);
  }
}

/**
 * Parcourt récursivement les dossiers pour traiter les fichiers
 */
function traverseDirectory(currentPath) {
  const files = fs.readdirSync(currentPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(currentPath, file.name);
    
    if (file.isDirectory()) {
      // Ignorer certains dossiers
      if (!IGNORED_DIRS.includes(file.name)) {
        traverseDirectory(fullPath);
      }
    } else if (shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

// Point d'entrée - commencer par le répertoire actuel
console.log('🔎 Début de la recherche dans le répertoire courant...');
traverseDirectory(process.cwd());
console.log('✅ Recherche et remplacement terminés');

// Recherche spécifique dans next.config.js qui est crucial
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('🔧 Vérification spécifique de next.config.js...');
  
  try {
    let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    let modified = false;
    
    // Vérifier les URLs Railway dans différents contextes
    if (nextConfigContent.includes('railway.app')) {
      console.log('⚠️ URLs Railway trouvées dans next.config.js');
      
      // Remplacer les URLs dans différents contextes
      const originalContent = nextConfigContent;
      
      // 1. Remplacer les URL d'API
      nextConfigContent = nextConfigContent.replace(/(['"`])https?:\/\/[^\/]*railway\.app[^'"`]*\/api[^'"`]*/g, `$1${REPLACEMENT_API_URL}`);
      
      // 2. Remplacer les URL sans /api
      nextConfigContent = nextConfigContent.replace(/(['"`])https?:\/\/[^\/]*railway\.app[^'"`]*/g, `$1${REPLACEMENT_URL}`);
      
      // 3. Remplacer dans les déclarations de variables
      nextConfigContent = nextConfigContent.replace(/(\w+ApiUrl\s*=\s*)(['"`])https?:\/\/[^\/]*railway\.app[^'"`]*/g, `$1$2${REPLACEMENT_URL}`);
      
      if (originalContent !== nextConfigContent) {
        modified = true;
        fs.writeFileSync(nextConfigPath, nextConfigContent, 'utf8');
        console.log('✅ URLs Railway remplacées dans next.config.js');
      }
    }
    
    if (!modified) {
      console.log('✅ Aucune référence à Railway trouvée dans next.config.js');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de next.config.js:', error.message);
  }
}

// Vérifier aussi explicitement les fichiers .env
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`🔍 Vérification de ${envFile}...`);
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      let modified = false;
      
      // Remplacer les URL dans les variables d'environnement
      if (envContent.includes('railway.app')) {
        const originalContent = envContent;
        
        envContent = envContent.replace(/^(NEXT_PUBLIC_API_URL=)https?:\/\/[^\/]*railway\.app[^\n]*/m, `$1${REPLACEMENT_API_URL}`);
        envContent = envContent.replace(/^(NEXT_PUBLIC_APP_URL=)https?:\/\/[^\/]*railway\.app[^\n]*/m, `$1${REPLACEMENT_URL}`);
        
        if (originalContent !== envContent) {
          modified = true;
          fs.writeFileSync(envPath, envContent, 'utf8');
          console.log(`✅ URLs Railway remplacées dans ${envFile}`);
        }
      }
      
      if (!modified) {
        console.log(`✅ Aucune référence à Railway trouvée dans ${envFile}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification de ${envFile}:`, error.message);
    }
  }
}); 