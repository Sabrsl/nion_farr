/**
 * Script pour aider à identifier et nettoyer le code mort dans le projet
 * 
 * Usage:
 * node scripts/clean-dead-code.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Liste des fichiers prioritaires contenant du code mort potentiel
const PRIORITY_FILES = [
  'frontend/config.ts',
  'frontend/data/index.ts',
  'frontend/utils/index.ts',
  'frontend/components/ui/index.ts'
];

// Liste des exports non utilisés d'après ts-prune (extrait partiel)
const UNUSED_EXPORTS = {
  'frontend/config.ts': [
    'APP_NAME',
    'DEFAULT_LANGUAGE',
    'PRODUCTS_PER_PAGE',
    'CURRENCY',
    'IMAGE_PLACEHOLDER',
    'AVATAR_PLACEHOLDER',
    'REQUEST_TIMEOUT'
  ],
  'frontend/data/index.ts': [
    'currentUser',
    'mockServices',
    'freelancerServices',
    'freelancerOrders',
    'freelancerStats',
    'userNotifications',
    'userTransactions',
    'userWithdrawals',
    'conversations',
    'messages',
    'getMessagesByConversationId',
    'getConversationById',
    'getConversationsByUserId',
    'reviews',
    'getReviewsByServiceId',
    'getReviewsByUserId',
    'getReviewById'
  ]
};

// Variables globales
let totalUnusedExports = 0;
let totalMarkedExports = 0;

/**
 * Ajoute des commentaires "DEAD_CODE" aux exports inutilisés dans un fichier
 */
async function markUnusedExports(filePath, unusedExports) {
  if (!fs.existsSync(filePath)) {
    console.error(`⚠️ Le fichier ${filePath} n'existe pas`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  let markedContent = fileContent;
  let markedCount = 0;

  // Pattern pour trouver les export declarations
  const exportRegex = /export\s+(const|let|var|function|type|interface|enum|class)\s+([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = exportRegex.exec(fileContent)) !== null) {
    const exportName = match[2];
    
    if (unusedExports.includes(exportName)) {
      // Vérifier si le code n'est pas déjà marqué comme mort
      const prevLineIndex = fileContent.lastIndexOf('\n', match.index);
      const prevLine = fileContent.substring(
        prevLineIndex > 0 ? prevLineIndex + 1 : 0, 
        match.index
      ).trim();
      
      if (!prevLine.includes('DEAD_CODE')) {
        const insertPosition = prevLineIndex > 0 ? prevLineIndex + 1 : 0;
        const beforeInsert = markedContent.substring(0, insertPosition);
        const afterInsert = markedContent.substring(insertPosition);
        
        markedContent = beforeInsert + 
                         '// DEAD_CODE: Cet export n\'est pas utilisé dans le code\n' + 
                         afterInsert;
        
        markedCount++;
        console.log(`✓ Export marqué: ${exportName} dans ${filePath}`);
      }
    }
  }

  if (markedCount > 0) {
    const shouldUpdate = await promptYesNo(`Marquer ${markedCount} exports non utilisés dans ${filePath} ?`);
    
    if (shouldUpdate) {
      fs.writeFileSync(filePath, markedContent, 'utf8');
      console.log(`✅ ${markedCount} exports marqués dans ${filePath}`);
      totalMarkedExports += markedCount;
    } else {
      console.log(`❌ Aucune modification apportée à ${filePath}`);
    }
  } else {
    console.log(`ℹ️ Aucun export non marqué dans ${filePath}`);
  }
  
  return markedCount;
}

/**
 * Helper pour demander une confirmation oui/non
 */
function promptYesNo(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (o/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui');
    });
  });
}

/**
 * Obtient la liste des exports non utilisés avec ts-prune
 */
function getUnusedExportsWithTsPrune() {
  try {
    console.log('📊 Analyse des exports non utilisés avec ts-prune...');
    const result = execSync('npx ts-prune', { encoding: 'utf8' });
    
    // Parser la sortie de ts-prune
    const lines = result.split('\n');
    const unusedExports = {};
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):(\d+) - ([^ ]+)/);
      if (match) {
        const [_, filePath, _lineNumber, exportName] = match;
        
        // Ignorer les exports "used in module"
        if (line.includes('(used in module)')) continue;
        
        if (!unusedExports[filePath]) {
          unusedExports[filePath] = [];
        }
        
        unusedExports[filePath].push(exportName);
        totalUnusedExports++;
      }
    }
    
    return unusedExports;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de ts-prune:', error.message);
    return {};
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🧹 Détection et nettoyage du code mort dans le projet');
    
    // 1. Obtenir les exports non utilisés avec ts-prune
    const unusedExports = getUnusedExportsWithTsPrune();
    
    console.log(`\n📊 ${totalUnusedExports} exports non utilisés détectés dans ${Object.keys(unusedExports).length} fichiers`);
    
    // 2. Traiter les fichiers prioritaires
    console.log('\n🔍 Traitement des fichiers prioritaires...');
    
    for (const filePath of PRIORITY_FILES) {
      if (unusedExports[filePath] || UNUSED_EXPORTS[filePath]) {
        const exportsToMark = unusedExports[filePath] || UNUSED_EXPORTS[filePath] || [];
        await markUnusedExports(filePath, exportsToMark);
      }
    }
    
    // 3. Option pour traiter les autres fichiers
    const remainingFiles = Object.keys(unusedExports).filter(
      filePath => !PRIORITY_FILES.includes(filePath)
    );
    
    if (remainingFiles.length > 0) {
      const shouldProcessAll = await promptYesNo(`\nTraiter ${remainingFiles.length} fichiers supplémentaires ?`);
      
      if (shouldProcessAll) {
        for (const filePath of remainingFiles) {
          await markUnusedExports(filePath, unusedExports[filePath]);
        }
      }
    }
    
    console.log(`\n✅ Terminé ! ${totalMarkedExports} exports marqués comme code mort sur ${totalUnusedExports} détectés.`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

// Exécuter le script
main(); 