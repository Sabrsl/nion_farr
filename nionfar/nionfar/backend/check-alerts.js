const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Charger les variables d'environnement
dotenv.config();

async function checkAlerts() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connexion à MongoDB avec URI:', uri);

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion à MongoDB établie');

    // Accéder à la base de données nionfar
    const db = client.db('nionfar');
    
    // Créer collection logs si elle n'existe pas
    try {
      const logsCollection = await db.createCollection('logs');
      console.log('Collection logs créée');
    } catch (error) {
      console.log('Collection logs existe déjà');
    }
    
    // Créer collection alerts si elle n'existe pas
    try {
      const alertsCollection = await db.createCollection('alerts');
      console.log('Collection alerts créée');
    } catch (error) {
      console.log('Collection alerts existe déjà');
    }
    
    // Insérer des logs de test
    const logsCollection = db.collection('logs');
    const logCount = await logsCollection.countDocuments();
    
    if (logCount === 0) {
      console.log('Création de logs de test...');
      await logsCollection.insertMany([
        {
          level: 'info',
          message: 'Application démarrée',
          timestamp: new Date(),
          service: 'backend'
        },
        {
          level: 'info',
          message: 'Utilisateur connecté',
          timestamp: new Date(),
          service: 'auth',
          userId: 'client1@nionfar.com'
        },
        {
          level: 'error',
          message: 'Échec de connexion',
          timestamp: new Date(Date.now() - 3600000),
          service: 'auth',
          details: 'Mot de passe incorrect'
        }
      ]);
      console.log('3 logs créés');
    } else {
      console.log(`${logCount} logs existent déjà`);
    }
    
    // Insérer des alertes de test
    const alertsCollection = db.collection('alerts');
    const alertCount = await alertsCollection.countDocuments();
    
    if (alertCount === 0) {
      console.log('Création d\'alertes de test...');
      await alertsCollection.insertMany([
        {
          level: 'warning',
          message: 'Tentative de connexion échouée multiple',
          timestamp: new Date(),
          service: 'auth',
          details: '3 tentatives échouées pour l\'utilisateur admin@nionfar.com',
          resolved: false
        },
        {
          level: 'critical',
          message: 'Service de paiement inaccessible',
          timestamp: new Date(Date.now() - 7200000),
          service: 'payment',
          details: 'Timeout lors de la connexion à l\'API de paiement',
          resolved: true,
          resolvedAt: new Date(Date.now() - 3600000)
        }
      ]);
      console.log('2 alertes créées');
    } else {
      console.log(`${alertCount} alertes existent déjà`);
    }

    // Afficher un résumé des logs et alertes
    console.log('\nRésumé des logs:');
    const logs = await logsCollection.find().toArray();
    logs.forEach(log => {
      console.log(` - [${log.level.toUpperCase()}] ${log.timestamp.toISOString()} ${log.service}: ${log.message}`);
    });
    
    console.log('\nRésumé des alertes:');
    const alerts = await alertsCollection.find().toArray();
    alerts.forEach(alert => {
      const status = alert.resolved ? 'RÉSOLU' : 'ACTIF';
      console.log(` - [${alert.level.toUpperCase()}] [${status}] ${alert.timestamp.toISOString()} ${alert.service}: ${alert.message}`);
      if (alert.details) {
        console.log(`   Détails: ${alert.details}`);
      }
    });

    // Vérification finale
    const collections = await db.listCollections().toArray();
    console.log('\nToutes les collections disponibles:');
    collections.forEach(coll => {
      console.log(` - ${coll.name}`);
    });

    await client.close();
    console.log('\nConnexion à MongoDB fermée');
    
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
  }
}

// Exécuter la fonction
checkAlerts(); 