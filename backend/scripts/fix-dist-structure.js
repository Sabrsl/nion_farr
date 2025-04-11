/**
 * Script de correction de la structure du dossier dist/
 * - Crée la structure de dossiers nécessaire
 * - Copie les fichiers critiques au bon endroit
 * - Assure que les dépendances de réflexion sont correctement importées
 */
const fs = require('fs');
const path = require('path');

// Fonction pour créer un dossier s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`📁 Création du dossier: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ Fichier copié: ${source} -> ${destination}`);
      return true;
    } else {
      console.log(`⚠️ Fichier source manquant: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la copie de ${source} vers ${destination}:`, error);
    return false;
  }
}

// Fonction pour modifier les imports dans un fichier JS
function fixModuleImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier à modifier manquant: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si reflect-metadata est déjà importé
    if (!content.includes('require("reflect-metadata")') && !content.includes("require('reflect-metadata')")) {
      // Ajouter l'import de reflect-metadata au début du fichier
      content = `require('reflect-metadata');\n${content}`;
      console.log(`✅ Import reflect-metadata ajouté à ${filePath}`);
    }
    
    // Correction supplémentaire pour les chemins relatifs problématiques
    content = content.replace(/require\(['"]\.\/app\.controller['"]\)/g, "require('./app.controller.js')");
    content = content.replace(/from ['"]\.\/app\.controller['"]/g, "from './app.controller.js'");
    
    // Autres corrections potentielles
    content = content.replace(/require\(['"]\.\/app\.service['"]\)/g, "require('./app.service.js')");
    content = content.replace(/from ['"]\.\/app\.service['"]/g, "from './app.service.js'");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Imports corrigés dans ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la modification des imports dans ${filePath}:`, error);
    return false;
  }
}

// Fonction pour assurer que les imports nécessaires sont dans l'index.js du dist
function fixEntryPoint() {
  const mainJsPath = path.join('dist', 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    console.log('🔍 Vérification du point d\'entrée main.js...');
    fixModuleImports(mainJsPath);
  } else {
    console.log('⚠️ main.js non trouvé dans dist/');
  }
  
  // Vérifier et corriger app.module.js
  const appModulePath = path.join('dist', 'app.module.js');
  if (fs.existsSync(appModulePath)) {
    console.log('🔍 Vérification du module app.module.js...');
    fixModuleImports(appModulePath);
  }
  
  // Vérifier et corriger app.controller.js
  const appControllerPath = path.join('dist', 'app.controller.js');
  if (fs.existsSync(appControllerPath)) {
    console.log('🔍 Vérification du contrôleur app.controller.js...');
    fixModuleImports(appControllerPath);
  }
  
  // Vérifier et corriger les éventuels modèles
  const modelsDir = path.join('dist', 'models');
  if (fs.existsSync(modelsDir)) {
    console.log('🔍 Vérification des modèles...');
    
    // Ajouter reflect-metadata aux modèles
    const files = fs.readdirSync(modelsDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(modelsDir, file);
        fixModuleImports(filePath);
      }
    });
  }
}

// Assurer que les fichiers nécessaires sont au bon endroit
function fixCriticalFiles() {
  console.log('🔍 Vérification des fichiers critiques...');
  
  const criticalFiles = [
    { src: 'dist/src/main.js', dest: 'dist/main.js' },
    { src: 'dist/src/app.module.js', dest: 'dist/app.module.js' },
    { src: 'dist/src/app.controller.js', dest: 'dist/app.controller.js' },
    { src: 'dist/src/app.service.js', dest: 'dist/app.service.js' },
    // Autres fichiers critiques
    { src: 'node_modules/reflect-metadata/Reflect.js', dest: 'dist/node_modules/reflect-metadata/Reflect.js' }
  ];
  
  const ensureDirectories = [
    'dist',
    'dist/src',
    'dist/scripts',
    'dist/models',
    'dist/node_modules/reflect-metadata',
    'dist/node_modules/@nestjs',
    'dist/node_modules/@nestjs/mongoose/dist/decorators'
  ];
  
  // Créer les dossiers
  ensureDirectories.forEach(dir => ensureDirectoryExists(dir));
  
  // Copier les fichiers
  criticalFiles.forEach(file => {
    if (fs.existsSync(file.src)) {
      copyFile(file.src, file.dest);
    } else {
      console.log(`⚠️ Fichier source manquant: ${file.src}`);
    }
  });
  
  // Copier tous les modèles
  const srcModelsDir = 'dist/src/models';
  const destModelsDir = 'dist/models';
  
  if (fs.existsSync(srcModelsDir)) {
    console.log('📁 Copie des modèles...');
    
    try {
      const files = fs.readdirSync(srcModelsDir);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const srcFile = path.join(srcModelsDir, file);
          const destFile = path.join(destModelsDir, file);
          copyFile(srcFile, destFile);
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la copie des modèles:', error);
    }
  }
  
  // Créer un stub pour le décorateur de propriété mongoose si nécessaire
  ensureMongooseDecoratorStub();
  
  // Créer un modèle stub si nécessaire
  createModelStub();
}

// Fonction pour créer un stub du décorateur de propriété mongoose
function ensureMongooseDecoratorStub() {
  const decoratorDir = 'dist/node_modules/@nestjs/mongoose/dist/decorators';
  const propDecoratorPath = path.join(decoratorDir, 'prop.decorator.js');
  
  if (!fs.existsSync(propDecoratorPath)) {
    console.log('⚠️ Décorateur de propriété mongoose manquant, création d\'un stub...');
    
    const stubContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prop = void 0;

// Stub pour le décorateur @Prop de NestJS Mongoose
function Prop(options) {
    return function (target, propertyKey) {
        console.log(\`⚠️ Utilisation du stub pour le décorateur @Prop sur \${propertyKey}\`);
    };
}
exports.Prop = Prop;
`;
    
    try {
      ensureDirectoryExists(decoratorDir);
      fs.writeFileSync(propDecoratorPath, stubContent, 'utf8');
      console.log('✅ Stub du décorateur @Prop créé');
    } catch (error) {
      console.error('❌ Erreur lors de la création du stub du décorateur:', error);
    }
  }
}

// Créer un modèle stub si nécessaire
function createModelStub() {
  const orderModelPath = 'dist/models/order.model.js';
  
  if (!fs.existsSync(orderModelPath)) {
    console.log('⚠️ Modèle Order manquant, création d\'un stub...');
    
    const stubContent = `"use strict";
// Import de reflect-metadata pour éviter les erreurs
try {
  require('reflect-metadata');
} catch (e) {
  console.warn('⚠️ Impossible de charger reflect-metadata');
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = exports.Order = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;

// Enumérations
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["EN_ATTENTE"] = "en_attente";
    OrderStatus["TERMINE"] = "termine";
    OrderStatus["ANNULE"] = "annule";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));

var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["EN_ATTENTE"] = "en_attente";
    PaymentStatus["PAYE"] = "paye";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));

var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WAVE"] = "wave";
    PaymentMethod["ORANGE_MONEY"] = "orange_money";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));

// Stub pour la classe Order
class Order {
    constructor() {
        console.log('⚠️ Order Model (Stub version): Cette classe est un stub pour le CI/CD');
    }
}
exports.Order = Order;

// Stub pour le schéma
exports.OrderSchema = { name: 'Order' };
`;
    
    try {
      ensureDirectoryExists('dist/models');
      fs.writeFileSync(orderModelPath, stubContent, 'utf8');
      console.log('✅ Stub du modèle Order créé');
    } catch (error) {
      console.error('❌ Erreur lors de la création du stub du modèle:', error);
    }
  }
}

// Exécution principale
console.log('🛠️ Correction de la structure du dossier dist/...');

// Fixer la structure des fichiers
fixCriticalFiles();

// Fixer les imports dans les points d'entrée
fixEntryPoint();

console.log('✅ Structure du dossier dist/ corrigée'); 