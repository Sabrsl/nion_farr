const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement manuellement
let uri;
try {
  const envPath = path.resolve(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mongoMatch = envContent.match(/MONGODB_URI=([^\n]+)/);
  if (mongoMatch && mongoMatch[1]) {
    uri = mongoMatch[1];
  } else {
    // URI de secours
    uri = 'mongodb+srv://vynalapp:uVmENC9K21dkMfma@clusternionfar.rjuvvf7.mongodb.net/nionfar?retryWrites=true&w=majority&appName=Clusternionfar';
  }
} catch (err) {
  // URI de secours
  uri = 'mongodb+srv://vynalapp:uVmENC9K21dkMfma@clusternionfar.rjuvvf7.mongodb.net/nionfar?retryWrites=true&w=majority&appName=Clusternionfar';
  console.log('Fichier .env non trouvé, utilisation de l\'URI de secours');
}

async function testMongoAPI() {
  try {
    console.log('=== Test de connexion MongoDB et API basiques ===');
    console.log('URI MongoDB:', uri.substring(0, 30) + '...');

    // Test de connexion MongoDB
    console.log('\n1. Test de connexion MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connexion à MongoDB établie avec succès');

    // Vérifier les collections
    const db = client.db('nionfar');
    const collections = await db.listCollections().toArray();
    console.log('\n2. Collections disponibles:', collections.length);
    collections.forEach(coll => {
      console.log(` - ${coll.name}`);
    });

    // Compter les documents dans chaque collection
    console.log('\n3. Nombre de documents par collection:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(` - ${coll.name}: ${count} documents`);
    }

    // Tester une requête d'agrégation simple
    console.log('\n4. Test d\'agrégation MongoDB:');
    const ordersAggregation = await db.collection('orders').aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('Commandes par statut:');
    ordersAggregation.forEach(result => {
      console.log(` - Statut "${result._id}": ${result.count} commandes`);
    });

    // Test de recherche texte
    console.log('\n5. Test de recherche:');
    const services = await db.collection('services').find({
      $or: [
        { title: { $regex: 'site', $options: 'i' } },
        { description: { $regex: 'web', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`Services liés au web (${services.length} résultats):`);
    services.forEach(service => {
      console.log(` - ${service.title}: ${service.price}€`);
    });

    // Fermer la connexion
    await client.close();
    console.log('\n✅ Tests MongoDB complétés avec succès');
    
    // Tester l'API backend
    console.log('\n6. Test de l\'API backend:');
    await testHttpEndpoint('localhost', 3001, '/api/health');
    await testHttpEndpoint('localhost', 3001, '/api');
    
    console.log('\n=== Tests terminés ===');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

async function testHttpEndpoint(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    console.log(`Testing ${host}:${port}${path}...`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Endpoint ${path} - Status: ${res.statusCode}`);
        try {
          if (data && data.trim()) {
            const jsonData = JSON.parse(data);
            console.log('  Response:', jsonData);
          } else {
            console.log('  No response data or empty response');
          }
          resolve();
        } catch (e) {
          console.log(`  Non-JSON response: ${data.substr(0, 100)}${data.length > 100 ? '...' : ''}`);
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Erreur lors de la requête à ${path}:`, error.message);
      resolve(); // Resolve anyway to continue tests
    });
    
    req.on('timeout', () => {
      console.log(`❌ Timeout lors de la requête à ${path}`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// Exécuter la fonction
testMongoAPI(); 