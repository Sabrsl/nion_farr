const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupTestData() {
  try {
    console.log('Démarrage du nettoyage des données de test...');

    // Se connecter à MongoDB
    const uri = process.env.MONGODB_URI;
    console.log('Connexion à MongoDB...');

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion à MongoDB établie');

    // Accéder à la base de données
    const db = client.db('nionfar');

    // 1. Marquer les comptes de test plutôt que les supprimer
    console.log('Marquage des comptes de test...');
    const testEmails = ['admin@nionfar.com', 'client1@nionfar.com', 'freelancer1@nionfar.com'];
    
    for (const email of testEmails) {
      await db.collection('users').updateOne(
        { email },
        { 
          $set: { 
            firstName: '[TEST] ' + (await db.collection('users').findOne({ email }))?.firstName,
            isTestAccount: true
          } 
        }
      );
    }
    console.log('Comptes de test marqués');

    // 2. Marquer les services de test
    console.log('Marquage des services de test...');
    await db.collection('services').updateMany(
      { providerId: { $in: testEmails } },
      { 
        $set: { 
          isTestService: true,
          title: '[TEST] ' + "$title" // Préfixer le titre
        } 
      }
    );
    console.log('Services de test marqués');

    console.log('Nettoyage terminé avec succès!');
    await client.close();
    
    return {
      success: true,
      message: 'Données de test nettoyées avec succès'
    };
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    return {
      success: false,
      message: 'Erreur lors du nettoyage des données',
      error: error.message
    };
  }
}

// Exécuter uniquement si lancé directement (pas importé)
if (require.main === module) {
  cleanupTestData()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Erreur non gérée:', error);
      process.exit(1);
    });
}

module.exports = cleanupTestData; 