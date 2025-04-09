const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Charger les variables d'environnement
dotenv.config();

async function checkCollections() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connexion à MongoDB avec URI:', uri);

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion à MongoDB établie');

    // Lister les bases de données
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('\nBases de données disponibles:');
    dbs.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });

    // Accéder à la base de données nionfar
    const db = client.db('nionfar');
    
    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections dans la base de données nionfar:');
    collections.forEach(coll => {
      console.log(` - ${coll.name}`);
    });

    // Si les collections users et services existent, afficher leur contenu
    if (collections.some(c => c.name === 'users')) {
      console.log('\nContenu de la collection users:');
      const users = await db.collection('users').find().toArray();
      users.forEach(user => {
        console.log(` - ${user.firstName} ${user.lastName} (${user.email}), role: ${user.role}`);
      });
    }

    if (collections.some(c => c.name === 'services')) {
      console.log('\nContenu de la collection services:');
      const services = await db.collection('services').find().toArray();
      services.forEach(service => {
        console.log(` - ${service.title} (${service.price}€), catégorie: ${service.category}`);
      });
    }

    await client.close();
    console.log('\nConnexion à MongoDB fermée');
  } catch (error) {
    console.error('Erreur lors de la vérification des collections:', error);
  }
}

// Exécuter la fonction
checkCollections(); 