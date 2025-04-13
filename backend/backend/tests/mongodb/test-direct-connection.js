/**
 * Test de connexion MongoDB direct avec le driver natif
 * Ce script utilise directement le driver MongoDB (sans Mongoose)
 * pour vérifier la connexion sans l'option batchSize
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Récupération de l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

// Masquer les informations sensibles pour l'affichage
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`🔍 Test de connexion directe à MongoDB avec URI: ${maskedUri}`);

// Options de connexion sans batchSize
const options = {
  // Paramètres de timeout pour éviter les connexions en suspens
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  
  // Quantité minimale de connexions MongoDB
  minPoolSize: 1,
  maxPoolSize: 5,
  
  // Compression pour réduire le trafic réseau
  compressors: 'zlib',
};

console.log('Options de connexion utilisées:');
console.log(JSON.stringify(options, null, 2));

// Création du client MongoDB
const client = new MongoClient(uri, options);

// Tentative de connexion
async function run() {
  try {
    // Connexion au serveur
    await client.connect();
    console.log('✅ Connexion MongoDB directe réussie!');
    
    // Vérifier que nous pouvons effectuer des opérations
    const adminDb = client.db().admin();
    const pingResult = await adminDb.ping();
    console.log('✅ Ping MongoDB réussi:', pingResult);
    
    // Lister toutes les bases de données disponibles
    const dbList = await adminDb.listDatabases();
    console.log('📋 Bases de données disponibles:');
    dbList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // Obtenir la base de données à partir de l'URI
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`Se connectant à la base de données: ${dbName}`);
    
    const db = client.db(dbName);
    
    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections dans la base de données:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    console.log('✅ Test terminé avec succès!');
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion MongoDB directe:');
    console.error(err);
    process.exit(1);
  } finally {
    // Fermer le client quelle que soit l'issue
    await client.close();
    console.log('📝 Client MongoDB fermé');
  }
}

// Exécuter le test
run()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  }); 