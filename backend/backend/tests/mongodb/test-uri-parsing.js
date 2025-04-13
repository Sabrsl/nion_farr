/**
 * Test de validation de l'URI MongoDB
 * Ce script vérifie que l'URI MongoDB est correctement formaté 
 * et peut être analysé par le driver sans erreur
 */

const { MongoClient, MongoParseError } = require('mongodb');
require('dotenv').config();

// Récupération de l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

// Masquer les informations sensibles pour l'affichage
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`🔍 Analyse de l'URI MongoDB: ${maskedUri}`);

// Fonction pour analyser l'URI
function parseMongoURI(uri) {
  try {
    console.log('Tentative d\'analyse de l\'URI...');
    
    // Décomposition manuelle de l'URI pour vérification
    let protocol, auth, host, database, params;
    
    // Extraire le protocole
    const protocolSplit = uri.split('://');
    if (protocolSplit.length !== 2) {
      throw new Error('Format de protocole incorrect. Doit être mongodb:// ou mongodb+srv://');
    }
    
    protocol = protocolSplit[0];
    const remainder = protocolSplit[1];
    
    // Vérifier si le protocole est valide
    if (protocol !== 'mongodb' && protocol !== 'mongodb+srv') {
      throw new Error(`Protocole ${protocol} non valide. Doit être mongodb ou mongodb+srv`);
    }
    
    // Extraire l'authentification, l'hôte et le reste
    let hostAndRest;
    if (remainder.includes('@')) {
      const authSplit = remainder.split('@');
      auth = authSplit[0];
      hostAndRest = authSplit[1];
      
      // Vérifier l'authentification
      if (!auth.includes(':')) {
        throw new Error('Format d\'authentification incorrect. Doit être username:password');
      }
    } else {
      auth = null;
      hostAndRest = remainder;
    }
    
    // Extraire la base de données et les paramètres
    let hostPart;
    if (hostAndRest.includes('/')) {
      const hostSplit = hostAndRest.split('/');
      hostPart = hostSplit[0];
      
      // La partie après le premier / peut contenir la base de données et les paramètres
      const dbAndParams = hostSplit.slice(1).join('/');
      
      if (dbAndParams.includes('?')) {
        const dbSplit = dbAndParams.split('?');
        database = dbSplit[0];
        params = dbSplit[1];
      } else {
        database = dbAndParams;
        params = '';
      }
    } else {
      hostPart = hostAndRest;
      database = '';
      params = '';
    }
    
    // Vérifier l'hôte
    host = hostPart;
    if (!host) {
      throw new Error('Hôte manquant dans l\'URI');
    }
    
    // Extraire et vérifier les paramètres
    const parameters = {};
    if (params) {
      params.split('&').forEach(param => {
        if (param.includes('=')) {
          const [key, value] = param.split('=');
          parameters[key] = value;
        }
      });
    }
    
    console.log('✅ Analyse manuelle de l\'URI réussie');
    
    return {
      valid: true,
      protocol,
      auth: auth ? { username: auth.split(':')[0], password: '***' } : null,
      host,
      database,
      parameters
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse manuelle de l\'URI:', error.message);
    return { valid: false, error: error.message };
  }
}

// Fonction pour tester la création du client MongoDB avec l'URI
function testMongoClientCreation(uri) {
  try {
    console.log('Création d\'une instance de MongoClient...');
    // Tente juste de créer un client sans se connecter
    const client = new MongoClient(uri);
    console.log('✅ MongoClient créé avec succès');
    return { valid: true };
  } catch (error) {
    console.error('❌ Erreur lors de la création du MongoClient:', error.message);
    if (error instanceof MongoParseError) {
      console.error('   C\'est une erreur de parsing MongoDB!');
    }
    return { valid: false, error: error.message };
  }
}

// Analyse de l'URI
const parsedURI = parseMongoURI(uri);
console.log('\n📋 Résultat de l\'analyse manuelle:');
console.log(JSON.stringify(parsedURI, null, 2));

// Test de création du client
const clientTest = testMongoClientCreation(uri);
console.log('\n📋 Résultat du test de création du client:');
console.log(JSON.stringify(clientTest, null, 2));

// Vérifier s'il y a des paramètres problématiques
console.log('\n🔍 Recherche de paramètres problématiques dans l\'URI...');
if (uri.toLowerCase().includes('batchsize=')) {
  console.error('❌ ATTENTION: Le paramètre "batchSize" a été détecté dans l\'URI!');
  console.error('   Ce paramètre est à l\'origine de l\'erreur et doit être supprimé de l\'URI.');
  
  // Suggérer un URI corrigé
  const correctedUri = uri.replace(/[\?&]batchsize=\d+/i, '').replace(/&+/g, '&').replace(/\?&/g, '?');
  const maskedCorrectedUri = correctedUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  
  console.log('\n✅ URI corrigé suggéré:');
  console.log(maskedCorrectedUri);
} else {
  console.log('✅ Aucun paramètre "batchSize" détecté dans l\'URI');
}

// Rapport final
console.log('\n📊 Résultat final:');
if (parsedURI.valid && clientTest.valid) {
  console.log('✅ L\'URI MongoDB est valide et peut être utilisé avec le driver MongoDB');
  process.exit(0);
} else {
  console.error('❌ L\'URI MongoDB contient des problèmes qui doivent être corrigés');
  process.exit(1);
} 