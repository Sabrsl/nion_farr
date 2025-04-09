const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

// Charger les variables d'environnement
dotenv.config();

async function createCollections() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connexion à MongoDB avec URI:', uri);

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion à MongoDB établie');

    // Accéder à la base de données nionfar
    const db = client.db('nionfar');

    // 1. Créer collection orders si elle n'existe pas
    try {
      const ordersCollection = await db.createCollection('orders');
      console.log('Collection orders créée');
    } catch (error) {
      console.log('Collection orders existe déjà');
    }

    // 2. Créer collection disputes si elle n'existe pas
    try {
      const disputesCollection = await db.createCollection('disputes');
      console.log('Collection disputes créée');
    } catch (error) {
      console.log('Collection disputes existe déjà');
    }
    
    // 3. Créer collection messages si elle n'existe pas
    try {
      const messagesCollection = await db.createCollection('messages');
      console.log('Collection messages créée');
    } catch (error) {
      console.log('Collection messages existe déjà');
    }

    // 4. Créer collection payments si elle n'existe pas
    try {
      const paymentsCollection = await db.createCollection('payments');
      console.log('Collection payments créée');
    } catch (error) {
      console.log('Collection payments existe déjà');
    }

    // 5. Créer collection reviews si elle n'existe pas
    try {
      const reviewsCollection = await db.createCollection('reviews');
      console.log('Collection reviews créée');
    } catch (error) {
      console.log('Collection reviews existe déjà');
    }

    // 6. Créer collection notifications si elle n'existe pas
    try {
      const notificationsCollection = await db.createCollection('notifications');
      console.log('Collection notifications créée');
    } catch (error) {
      console.log('Collection notifications existe déjà');
    }

    // Récupérer les utilisateurs et services existants
    const users = await db.collection('users').find().toArray();
    const services = await db.collection('services').find().toArray();

    // Créer des commandes d'exemple
    if (users.length > 0 && services.length > 0) {
      const clientId = users.find(u => u.role === 'client')?._id;
      const freelancerId = users.find(u => u.role === 'freelancer')?._id;
      
      if (clientId && freelancerId) {
        const ordersCollection = db.collection('orders');
        
        // Vérifier si des commandes existent déjà
        const orderCount = await ordersCollection.countDocuments();
        
        if (orderCount === 0) {
          console.log('Création de commandes...');
          
          const orderStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'disputed'];
          
          for (let i = 0; i < 5; i++) {
            const serviceId = services[i % services.length]._id;
            const servicePrice = services[i % services.length].price;
            
            await ordersCollection.insertOne({
              client: clientId,
              freelancer: freelancerId,
              service: serviceId,
              orderNumber: `ORD-${Date.now()}-${i}`,
              status: orderStatuses[i % orderStatuses.length],
              amount: servicePrice,
              requirements: `Voici mes besoins pour cette commande ${i+1}`,
              deliveryDate: new Date(Date.now() + ((i+1) * 7 * 24 * 60 * 60 * 1000)),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          
          console.log('5 commandes créées');
        } else {
          console.log(`${orderCount} commandes existent déjà`);
        }
        
        // Créer des messages
        const messagesCollection = db.collection('messages');
        const messageCount = await messagesCollection.countDocuments();
        
        if (messageCount === 0) {
          console.log('Création de messages...');
          
          const messages = [
            {
              sender: clientId,
              receiver: freelancerId,
              content: "Bonjour, j'ai besoin de plus d'informations sur votre service",
              read: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              sender: freelancerId,
              receiver: clientId,
              content: "Bonjour, je serai ravi de vous aider. Quelles informations souhaitez-vous?",
              read: false,
              createdAt: new Date(Date.now() + 3600000),
              updatedAt: new Date(Date.now() + 3600000)
            },
            {
              sender: clientId,
              receiver: freelancerId,
              content: "Je voudrais savoir si vous pouvez livrer dans un délai de 3 jours?",
              read: false,
              createdAt: new Date(Date.now() + 7200000),
              updatedAt: new Date(Date.now() + 7200000)
            }
          ];
          
          await messagesCollection.insertMany(messages);
          console.log('3 messages créés');
        } else {
          console.log(`${messageCount} messages existent déjà`);
        }
        
        // Créer des avis
        const reviewsCollection = db.collection('reviews');
        const reviewCount = await reviewsCollection.countDocuments();
        
        if (reviewCount === 0) {
          console.log('Création d\'avis...');
          
          const reviews = [
            {
              reviewer: clientId,
              reviewee: freelancerId,
              service: services[0]._id,
              rating: 5,
              comment: "Excellent travail, je recommande vivement!",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              reviewer: clientId,
              reviewee: freelancerId,
              service: services[1]._id,
              rating: 4,
              comment: "Bon travail, mais délai un peu long",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          
          await reviewsCollection.insertMany(reviews);
          console.log('2 avis créés');
        } else {
          console.log(`${reviewCount} avis existent déjà`);
        }
      }
    }

    // Vérification finale
    const collections = await db.listCollections().toArray();
    console.log('\nCollections disponibles dans la base de données:');
    collections.forEach(coll => {
      console.log(` - ${coll.name}`);
    });

    // Afficher un décompte des documents dans chaque collection
    console.log('\nNombre de documents dans chaque collection:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(` - ${coll.name}: ${count} documents`);
    }

    await client.close();
    console.log('\nConnexion à MongoDB fermée');
  } catch (error) {
    console.error('Erreur lors de la création des collections:', error);
  }
}

// Exécuter la fonction
createCollections(); 