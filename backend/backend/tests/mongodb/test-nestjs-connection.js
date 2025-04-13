/**
 * Test simulant la connexion MongoDB comme le fait NestJS
 * Ce script reproduit la manière dont NestJS se connecte à MongoDB
 * sans l'option batchSize qui causait l'erreur
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
console.log(`🔍 Test de connexion NestJS à MongoDB avec URI: ${maskedUri}`);

// Simuler la fonction createMongooseOptions de MongodbConfigService
function createMongooseOptions() {
  console.log('Création des options de connexion Mongoose (comme dans NestJS)');
  
  // Dans NestJS, on sépare la configuration Mongoose de la configuration du driver MongoDB
  // uri et connectionFactory sont des options Mongoose, pas du driver MongoDB
  return {
    // Ces options sont pour Mongoose, pas pour le driver MongoDB
    uri,
    connectionFactory: (connection) => {
      console.log('Activation des listeners sur la connexion');
      
      connection.on('connected', () => {
        console.log('MongoDB connected successfully');
      });
      
      connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      
      connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      
      return connection;
    },
    // Ces options seront passées au driver MongoDB
    // IMPORTANT: retryAttempts et retryDelay ont été retirés car ils ne sont pas supportés
    // dans les options du driver
    autoIndex: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    minPoolSize: 1,
    maxPoolSize: 5,
    compressors: 'zlib',
    writeConcern: {
      w: 1,
      j: false
    }
  };
}

// Récupérer les options
const mongooseOptions = createMongooseOptions();
console.log('Options Mongoose complètes:');
console.log(JSON.stringify({ ...mongooseOptions, uri: '***masked***' }, null, 2));

// Extraire les options du driver MongoDB (sans uri, connectionFactory, retryAttempts, retryDelay)
const { uri: mongoUri, connectionFactory, ...driverOptions } = mongooseOptions;
console.log('Options du driver MongoDB uniquement:');
console.log(JSON.stringify(driverOptions, null, 2));

// Tentative de connexion
async function testNestJSConnection() {
  try {
    // Connexion à MongoDB comme le fait NestJS, mais en séparant correctement
    // les options Mongoose des options du driver MongoDB
    await mongoose.connect(mongoUri, driverOptions);
    console.log('✅ Connexion MongoDB (style NestJS) réussie!');
    
    // Appliquer le connectionFactory manuellement
    if (connectionFactory) {
      connectionFactory(mongoose.connection);
    }
    
    // Vérifier que nous pouvons effectuer des opérations
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('✅ Ping MongoDB réussi:', pingResult);
    
    // Obtenir les informations sur le serveur MongoDB
    const serverInfo = await mongoose.connection.db.admin().serverInfo();
    console.log('📊 Informations sur le serveur MongoDB:');
    console.log(` - Version: ${serverInfo.version}`);
    console.log(` - Moteur de stockage: ${serverInfo.storageEngines}`);
    
    // Vérifier l'état de la connexion
    console.log('📡 État de la connexion:', mongoose.connection.readyState);
    console.log('   (0 = déconnecté, 1 = connecté, 2 = connexion en cours, 3 = déconnexion en cours)');
    
    // Fermer proprement la connexion
    await mongoose.disconnect();
    console.log('✅ Test terminé avec succès!');
    return true;
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion MongoDB (style NestJS):');
    console.error(err);
    
    // Essayer de fermer la connexion si elle existe
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (closeErr) {
      console.error('Erreur supplémentaire lors de la fermeture de la connexion:', closeErr);
    }
    
    return false;
  }
}

// Exécuter le test
testNestJSConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  }); 