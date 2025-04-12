/**
 * Script pour corriger l'erreur "Cannot find module './entities/user.entity.js'"
 * Ce script vérifie si les dossiers et fichiers d'entités existent et les crée si nécessaire
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification des fichiers d\'entité manquants...');

// Définition des chemins
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Liste des entités à vérifier
const ENTITY_FILES = [
  {
    distPath: path.join(DIST_DIR, 'modules', 'users', 'entities', 'user.entity.js'),
    srcPath: path.join(SRC_DIR, 'modules', 'users', 'entities', 'user.entity.ts'),
    dir: path.join(DIST_DIR, 'modules', 'users', 'entities'),
    name: 'user.entity.js'
  },
  {
    distPath: path.join(DIST_DIR, 'modules', 'services', 'entities', 'service.entity.js'),
    srcPath: path.join(SRC_DIR, 'modules', 'services', 'entities', 'service.entity.ts'),
    dir: path.join(DIST_DIR, 'modules', 'services', 'entities'),
    name: 'service.entity.js'
  },
  {
    distPath: path.join(DIST_DIR, 'modules', 'orders', 'entities', 'order.entity.js'),
    srcPath: path.join(SRC_DIR, 'modules', 'orders', 'entities', 'order.entity.ts'),
    dir: path.join(DIST_DIR, 'modules', 'orders', 'entities'),
    name: 'order.entity.js'
  },
  {
    distPath: path.join(DIST_DIR, 'modules', 'reviews', 'entities', 'review.entity.js'),
    srcPath: path.join(SRC_DIR, 'modules', 'reviews', 'entities', 'review.entity.ts'),
    dir: path.join(DIST_DIR, 'modules', 'reviews', 'entities'),
    name: 'review.entity.js'
  },
  {
    distPath: path.join(DIST_DIR, 'modules', 'messages', 'entities', 'message.entity.js'),
    srcPath: path.join(SRC_DIR, 'modules', 'messages', 'entities', 'message.entity.ts'),
    dir: path.join(DIST_DIR, 'modules', 'messages', 'entities'),
    name: 'message.entity.js'
  }
];

// Assurez-vous que le dossier existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Création du dossier: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// Vérifie et corrige les fichiers d'entité
function checkAndFixEntityFiles() {
  let missingEntities = 0;
  let fixedEntities = 0;

  // Créer les dossiers nécessaires
  ENTITY_FILES.forEach(entity => {
    ensureDirectoryExists(entity.dir);
  });

  // Vérifier chaque fichier d'entité
  ENTITY_FILES.forEach(entity => {
    if (!fs.existsSync(entity.distPath)) {
      missingEntities++;
      console.log(`❌ Entité manquante: ${entity.name}`);

      // Essayer d'utiliser le fichier source s'il existe
      if (fs.existsSync(entity.srcPath)) {
        console.log(`🔄 Tentative de compilation du fichier source: ${entity.srcPath}`);
        try {
          // Option 1: Tenter une compilation directe avec tsc (si disponible)
          try {
            const tscCommand = `npx tsc ${entity.srcPath} --outDir ${entity.dir} --target ES2018 --module CommonJS`;
            execSync(tscCommand, { stdio: 'inherit' });
            console.log(`✅ Compilation réussie avec tsc: ${entity.name}`);
            fixedEntities++;
          } catch (e) {
            console.log(`⚠️ Échec de la compilation avec tsc: ${e.message}`);
            throw e; // Pour passer à la solution alternative
          }
        } catch (err) {
          console.log(`⚠️ Impossible de compiler: ${err.message}`);
          
          // Option 2: Créer un fichier simplifié
          console.log(`🔄 Création d'une version simplifiée de ${entity.name}`);
          try {
            // Exécuter le script fix-entity-relations.js
            console.log('🔄 Exécution de fix-entity-relations.js...');
            execSync('node scripts/fix-entity-relations.js', { stdio: 'inherit' });
            
            if (fs.existsSync(entity.distPath)) {
              console.log(`✅ Entité créée avec succès par fix-entity-relations.js: ${entity.name}`);
              fixedEntities++;
            } else {
              console.log(`❌ Échec de création avec fix-entity-relations.js: ${entity.name}`);
            }
          } catch (e) {
            console.log(`❌ Erreur lors de l'exécution de fix-entity-relations.js: ${e.message}`);
          }
        }
      } else {
        console.log(`❌ Fichier source introuvable: ${entity.srcPath}`);
        
        // Exécuter le script fix-entity-relations.js comme dernier recours
        console.log('🔄 Exécution de fix-entity-relations.js comme dernier recours...');
        try {
          execSync('node scripts/fix-entity-relations.js', { stdio: 'inherit' });
          if (fs.existsSync(entity.distPath)) {
            console.log(`✅ Entité créée avec succès par fix-entity-relations.js: ${entity.name}`);
            fixedEntities++;
          } else {
            console.log(`❌ Échec de création avec fix-entity-relations.js: ${entity.name}`);
          }
        } catch (e) {
          console.log(`❌ Erreur lors de l'exécution de fix-entity-relations.js: ${e.message}`);
        }
      }
    } else {
      console.log(`✅ Entité présente: ${entity.name}`);
      
      // Vérifier que le fichier contient du code valide
      const content = fs.readFileSync(entity.distPath, 'utf8');
      if (content.length < 100) {
        console.log(`⚠️ Le fichier ${entity.name} semble incomplet (${content.length} octets)`);
        try {
          console.log('🔄 Exécution de fix-entity-relations.js pour recréer le fichier...');
          execSync('node scripts/fix-entity-relations.js', { stdio: 'inherit' });
          console.log(`✅ Fichier ${entity.name} recréé`);
          fixedEntities++;
        } catch (e) {
          console.log(`❌ Erreur lors de l'exécution de fix-entity-relations.js: ${e.message}`);
        }
      }
    }
  });

  // Vérifier les imports dans les services
  const usersServicePath = path.join(DIST_DIR, 'modules', 'users', 'users.service.js');
  if (fs.existsSync(usersServicePath)) {
    console.log(`🔍 Vérification des imports dans users.service.js...`);
    let content = fs.readFileSync(usersServicePath, 'utf8');
    
    // Vérifier si l'import est correct
    if (content.includes("require('./entities/user.entity')") && !content.includes("require('./entities/user.entity.js')")) {
      console.log(`🔄 Correction de l'import dans users.service.js...`);
      content = content.replace(/require\(['"]\.\/entities\/user\.entity['"]\)/g, "require('./entities/user.entity.js')");
      fs.writeFileSync(usersServicePath, content, 'utf8');
      console.log(`✅ Import corrigé dans users.service.js`);
    } else {
      console.log(`✅ Import déjà correct dans users.service.js`);
    }
  }

  // Résumé
  console.log('\n📊 Résumé:');
  console.log(`- Entités manquantes: ${missingEntities}`);
  console.log(`- Entités corrigées: ${fixedEntities}`);

  return missingEntities === 0 || fixedEntities > 0;
}

// Exécuter les vérifications et corrections
const result = checkAndFixEntityFiles();

if (result) {
  console.log('✅ Vérification et correction des entités terminées avec succès');
  process.exit(0);
} else {
  console.log('❌ Des problèmes persistent avec les fichiers d\'entité');
  process.exit(1);
} 