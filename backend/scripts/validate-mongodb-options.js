/**
 * Script de validation des options de connexion MongoDB
 * Ce script vérifie que les options de connexion MongoDB sont valides
 * et ne contiennent pas d'options non supportées.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Liste des options MongoDB qui ne sont pas supportées comme paramètres directs
// dans les options du driver MongoDB lors de la connexion
const unsupportedDriverOptions = [
  'batchSize',        // Erreur: option batchsize is not supported
  'retryAttempts',    // Erreur: options retryattempts, retrydelay are not supported
  'retryDelay',
  'uri',              // Uri doit être passé comme premier argument, pas comme option
  'connectionFactory' // Option spécifique à Mongoose, pas au driver MongoDB
];

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Récupération de l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error(`${colors.red}${colors.bold}Erreur: MONGODB_URI n'est pas défini dans les variables d'environnement${colors.reset}`);
  process.exit(1);
}

// Fonction pour vérifier si un fichier contient des options non supportées
function checkFileForUnsupportedOptions(filePath, unsupportedOptions) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}Le fichier ${filePath} n'existe pas, ignoré${colors.reset}`);
      return { isValid: true, file: filePath, unsupportedFound: [] };
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const unsupportedFound = [];

    unsupportedOptions.forEach(option => {
      // Expression régulière pour détecter l'option dans le code
      // Recherche des motifs comme "batchSize:", "batchSize =" ou "'batchSize':"
      const regex = new RegExp(`['"]?${option}['"]?\\s*[:=]`, 'gi');
      if (regex.test(fileContent)) {
        unsupportedFound.push(option);
      }
    });

    return {
      isValid: unsupportedFound.length === 0,
      file: filePath,
      unsupportedFound
    };
  } catch (error) {
    console.error(`${colors.red}Erreur lors de la vérification du fichier ${filePath}:${colors.reset}`, error);
    return { isValid: false, file: filePath, error: error.message };
  }
}

// Fonction pour vérifier l'URI MongoDB
function validateMongoDBUri(uri) {
  try {
    // Masquer les informations sensibles pour l'affichage
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`\n${colors.blue}${colors.bold}Validation de l'URI MongoDB:${colors.reset} ${maskedUri}`);

    // Vérifier si l'URI contient des paramètres non supportés
    const unsupportedParams = [];
    const urlParams = new URL(uri).searchParams;
    
    unsupportedDriverOptions.forEach(option => {
      if (urlParams.has(option.toLowerCase())) {
        unsupportedParams.push(option);
      }
    });

    if (unsupportedParams.length > 0) {
      console.error(`${colors.red}${colors.bold}L'URI MongoDB contient des paramètres non supportés:${colors.reset} ${unsupportedParams.join(', ')}`);
      return { isValid: false, unsupportedParams };
    }

    // Création d'une instance de MongoClient pour valider l'URI
    try {
      const client = new MongoClient(uri);
      console.log(`${colors.green}✓ URI MongoDB valide${colors.reset}`);
      return { isValid: true };
    } catch (error) {
      console.error(`${colors.red}${colors.bold}Erreur lors de la création du client MongoDB:${colors.reset}`, error.message);
      return { isValid: false, error: error.message };
    }
  } catch (error) {
    console.error(`${colors.red}${colors.bold}Erreur lors de la validation de l'URI MongoDB:${colors.reset}`, error.message);
    return { isValid: false, error: error.message };
  }
}

// Fonction principale de validation
async function validateMongoDBOptions() {
  console.log(`\n${colors.blue}${colors.bold}=== VALIDATION DES OPTIONS DE CONNEXION MONGODB ===${colors.reset}`);

  // Chemins des fichiers à vérifier
  const filesToCheck = [
    path.join(__dirname, '..', 'src', 'config', 'mongodb-memory-options.ts'),
    path.join(__dirname, '..', 'src', 'app.module.ts'),
    path.join(__dirname, '..', 'config', 'mongodb.config.ts'),
    path.join(__dirname, '..', 'config', 'database.module.ts')
  ];

  // Validation de l'URI MongoDB
  const uriValidation = validateMongoDBUri(uri);

  // Vérification des fichiers pour les options non supportées
  console.log(`\n${colors.blue}${colors.bold}Vérification des fichiers de configuration:${colors.reset}`);
  const fileCheckResults = filesToCheck.map(file => 
    checkFileForUnsupportedOptions(file, unsupportedDriverOptions)
  );

  // Affichage des résultats
  console.log(`\n${colors.blue}${colors.bold}Résultats de la validation:${colors.reset}`);
  
  // Résultats de la vérification des fichiers
  fileCheckResults.forEach(result => {
    if (result.isValid) {
      console.log(`${colors.green}✓ ${result.file}: Aucune option non supportée trouvée${colors.reset}`);
    } else if (result.error) {
      console.error(`${colors.red}✗ ${result.file}: Erreur - ${result.error}${colors.reset}`);
    } else {
      console.error(`${colors.red}✗ ${result.file}: Options non supportées trouvées: ${result.unsupportedFound.join(', ')}${colors.reset}`);
    }
  });

  // Résumé final
  const allFilesValid = fileCheckResults.every(result => result.isValid);
  const overallValid = uriValidation.isValid && allFilesValid;

  console.log(`\n${colors.blue}${colors.bold}Résumé de la validation:${colors.reset}`);
  if (overallValid) {
    console.log(`${colors.green}${colors.bold}✓ SUCCÈS: La configuration MongoDB est valide et prête pour le déploiement${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}${colors.bold}✗ ÉCHEC: Des problèmes ont été détectés dans la configuration MongoDB${colors.reset}`);
    console.error(`${colors.yellow}Corrigez les problèmes ci-dessus avant de déployer l'application${colors.reset}`);
    return false;
  }
}

// Exécution de la validation
validateMongoDBOptions()
  .then(isValid => {
    process.exit(isValid ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}${colors.bold}Erreur lors de la validation:${colors.reset}`, error);
    process.exit(1);
  }); 