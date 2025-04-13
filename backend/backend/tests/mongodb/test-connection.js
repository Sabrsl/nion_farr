/**
 * Test de connexion MongoDB sans l'option batchSize
 * Ce script permet de vérifier si la connexion MongoDB fonctionne correctement
 * après la suppression de l'option batchSize qui causait l'erreur
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Récupération de l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

// Masquer les informations sensibles pour l'affichage
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`🔍 Test de connexion à MongoDB avec URI: ${maskedUri}`);

// Options de connexion sans batchSize et sans options non supportées
const options = {
  // Désactiver l'indexation automatique qui nécessite de la mémoire
  autoIndex: false,
  
  // Paramètres de timeout pour éviter les connexions en suspens
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  
  // Tampon de commandes assure la stabilité mais utilise moins de mémoire
  bufferCommands: false,
  
  // Quantité minimale de connexions MongoDB
  minPoolSize: 1,
  maxPoolSize: 5,
  
  // Compression pour réduire le trafic réseau et l'utilisation de la mémoire
  compressors: 'zlib',
  
  // Préoccupations d'écriture
  writeConcern: {
    w: 1,
    j: false
  }
  
  // REMARQUE: retryAttempts et retryDelay ont été retirés car ils ne sont pas supportés
  // comme options de connexion directe
};

console.log('Options de connexion utilisées:');
console.log(JSON.stringify(options, null, 2));

// Tentative de connexion
mongoose.connect(uri, options)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie!');
    // Vérifier que nous pouvons effectuer des opérations
    return mongoose.connection.db.admin().ping();
  })
  .then((pingResult) => {
    console.log('✅ Ping MongoDB réussi:', pingResult);
    // Lister les collections disponibles
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('📋 Collections disponibles:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    // Fermer proprement la connexion
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('✅ Test terminé avec succès!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur lors du test de connexion MongoDB:');
    console.error(err);
    // Essayer de fermer la connexion si elle existe
    try {
      if (mongoose.connection.readyState !== 0) {
        mongoose.disconnect();
      }
    } catch (closeErr) {
      console.error('Erreur supplémentaire lors de la fermeture de la connexion:', closeErr);
    }
    process.exit(1);
  }); 