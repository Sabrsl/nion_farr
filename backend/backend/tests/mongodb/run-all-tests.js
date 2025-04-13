/**
 * Script pour exécuter tous les tests de connexion MongoDB
 * Permet de vérifier si la connexion MongoDB est correcte après la correction
 */

const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Liste des tests à exécuter
const tests = [
  { 
    name: 'Validation de l\'URI MongoDB', 
    file: 'test-uri-parsing.js',
    description: 'Vérifie que l\'URI MongoDB est correctement formaté et ne contient pas d\'options invalides.'
  },
  { 
    name: 'Connexion MongoDB basique', 
    file: 'test-connection.js',
    description: 'Teste la connexion MongoDB avec des options basiques.'
  },
  { 
    name: 'Connexion MongoDB directe', 
    file: 'test-direct-connection.js',
    description: 'Teste la connexion MongoDB avec le driver natif sans Mongoose.'
  },
  { 
    name: 'Connexion MongoDB style NestJS', 
    file: 'test-nestjs-connection.js',
    description: 'Simule la façon dont NestJS se connecte à MongoDB.'
  }
];

// Fonction pour exécuter un script Node
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.bgBlue}${colors.white}${colors.bright} EXÉCUTION ${colors.reset} ${colors.blue}${colors.bright}${scriptPath}${colors.reset}\n`);
    
    const child = spawn('node', [scriptPath], { 
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Le script a échoué avec le code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Vérifier si MONGODB_URI est défini
if (!process.env.MONGODB_URI) {
  console.error(`${colors.bgRed}${colors.white}${colors.bright} ERREUR ${colors.reset} ${colors.red}La variable d'environnement MONGODB_URI n'est pas définie!${colors.reset}`);
  console.error(`${colors.yellow}Créez un fichier .env contenant MONGODB_URI=votre_uri_mongodb${colors.reset}`);
  process.exit(1);
}

// Afficher un en-tête
console.log(`\n${colors.bgMagenta}${colors.white}${colors.bright} TESTS DE CONNEXION MONGODB ${colors.reset}`);
console.log(`${colors.dim}Ces tests vérifient que la connexion MongoDB fonctionne correctement après la correction${colors.reset}\n`);

// Afficher les tests qui seront exécutés
console.log(`${colors.bright}Tests à exécuter:${colors.reset}`);
tests.forEach((test, index) => {
  console.log(`${colors.green}${index + 1}.${colors.reset} ${colors.bright}${test.name}${colors.reset}`);
  console.log(`   ${colors.dim}${test.description}${colors.reset}`);
});

// Exécuter les tests en séquence
async function runTests() {
  const results = [];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const scriptPath = path.join(__dirname, test.file);
    
    console.log(`\n${colors.bgYellow}${colors.black}${colors.bright} TEST ${i + 1}/${tests.length} ${colors.reset} ${colors.yellow}${test.name}${colors.reset}`);
    
    try {
      await runScript(scriptPath);
      results.push({ name: test.name, success: true });
      console.log(`\n${colors.bgGreen}${colors.black}${colors.bright} SUCCÈS ${colors.reset} ${colors.green}${test.name} a réussi${colors.reset}`);
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message });
      console.error(`\n${colors.bgRed}${colors.white}${colors.bright} ÉCHEC ${colors.reset} ${colors.red}${test.name} a échoué: ${error.message}${colors.reset}`);
    }
  }
  
  // Afficher un résumé
  console.log(`\n${colors.bgCyan}${colors.black}${colors.bright} RÉSUMÉ DES TESTS ${colors.reset}`);
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  console.log(`\n${colors.bright}Résultats:${colors.reset}`);
  console.log(`${colors.green}✓ ${successCount} test(s) réussi(s)${colors.reset}`);
  console.log(`${colors.red}✗ ${failureCount} test(s) échoué(s)${colors.reset}\n`);
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`${colors.green}✓ ${tests[index].name}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${tests[index].name}${colors.reset}`);
    }
  });
  
  // Conclusion et recommandations
  console.log(`\n${colors.bgWhite}${colors.black}${colors.bright} CONCLUSION ${colors.reset}`);
  
  if (failureCount === 0) {
    console.log(`\n${colors.green}${colors.bright}Tous les tests ont réussi!${colors.reset}`);
    console.log(`${colors.green}La connexion MongoDB est correctement configurée et devrait fonctionner sur Render.${colors.reset}`);
    console.log(`\n${colors.bright}Prochaines étapes recommandées:${colors.reset}`);
    console.log(`${colors.white}1. Déployez votre application sur Render${colors.reset}`);
    console.log(`${colors.white}2. Vérifiez les logs de déploiement pour confirmer que la connexion MongoDB fonctionne${colors.reset}`);
    console.log(`${colors.white}3. Testez que votre application fonctionne correctement après le déploiement${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}Certains tests ont échoué.${colors.reset}`);
    console.log(`${colors.red}Des problèmes doivent être résolus avant le déploiement sur Render.${colors.reset}`);
    console.log(`\n${colors.bright}Recommandations:${colors.reset}`);
    console.log(`${colors.white}1. Vérifiez votre chaîne de connexion MongoDB (MONGODB_URI)${colors.reset}`);
    console.log(`${colors.white}2. Assurez-vous que le serveur MongoDB est accessible${colors.reset}`);
    console.log(`${colors.white}3. Vérifiez que les options de connexion sont valides${colors.reset}`);
  }
  
  process.exit(failureCount === 0 ? 0 : 1);
}

// Exécuter les tests
runTests().catch(error => {
  console.error(`${colors.bgRed}${colors.white}${colors.bright} ERREUR FATALE ${colors.reset} ${colors.red}${error.message}${colors.reset}`);
  process.exit(1);
}); 