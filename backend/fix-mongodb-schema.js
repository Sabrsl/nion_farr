/**
 * Script de correction des schémas et indexation MongoDB
 * Pour résoudre les problèmes identifiés par test-mongodb-connection.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Récupérer l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI n\'est pas défini');
  process.exit(1);
}

console.log('🔧 Démarrage des corrections de schéma et d\'indexation MongoDB...');
console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

async function fixMongoDB() {
  const client = new MongoClient(uri, {
    maxPoolSize: 3,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  });

  try {
    // Connexion à MongoDB
    await client.connect();
    console.log('✅ Connexion à MongoDB réussie');
    
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    // 1. Correction de la collection services
    console.log('\n🔧 Correction de la collection services:');
    
    // 1.1 Vérifier si les documents ont le champ userId
    const services = await db.collection('services').find().toArray();
    console.log(`  - ${services.length} services trouvés`);
    
    // 1.2 Créer les index manquants
    console.log('  - Création des index manquants: userId, category');
    await db.collection('services').createIndex({ userId: 1 });
    await db.collection('services').createIndex({ category: 1 });
    console.log('  ✅ Index créés avec succès');
    
    // 1.3 Ajouter le champ userId là où il manque
    const servicesMissingUserId = services.filter(s => !s.userId);
    if (servicesMissingUserId.length > 0) {
      console.log(`  - ${servicesMissingUserId.length} services sans userId trouvés`);
      
      // Trouver un utilisateur admin pour associer les services
      const adminUser = await db.collection('users').findOne({ role: 'admin' });
      const defaultUserId = adminUser ? adminUser._id : null;
      
      if (!defaultUserId) {
        console.log('  ⚠️ Impossible de trouver un utilisateur admin, création d\'un utilisateur temporaire');
        // Créer un utilisateur temporaire si nécessaire
        const tempUser = {
          email: 'temporary@nionfar.sn',
          password: '$2b$10$randomhashfortemporaryuser',
          role: 'admin',
          firstName: 'Temp',
          lastName: 'User',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await db.collection('users').insertOne(tempUser);
        defaultUserId = result.insertedId;
      }
      
      // Mettre à jour les services sans userId
      for (const service of servicesMissingUserId) {
        await db.collection('services').updateOne(
          { _id: service._id },
          { $set: { userId: defaultUserId } }
        );
      }
      console.log(`  ✅ ${servicesMissingUserId.length} services mis à jour avec un userId`);
    } else {
      console.log('  ✅ Tous les services ont déjà un userId');
    }
    
    // 2. Correction de la collection orders
    console.log('\n🔧 Correction de la collection orders:');
    
    // 2.1 Créer les index manquants
    console.log('  - Création des index manquants: buyerId, sellerId, serviceId, status');
    await db.collection('orders').createIndex({ buyerId: 1 });
    await db.collection('orders').createIndex({ sellerId: 1 });
    await db.collection('orders').createIndex({ serviceId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    console.log('  ✅ Index créés avec succès');
    
    // 2.2 Vérifier et corriger les commandes problématiques
    const orders = await db.collection('orders').find().toArray();
    console.log(`  - ${orders.length} commandes trouvées`);
    
    // Vérifier quels champs manquent
    const ordersToFix = orders.filter(o => 
      !o.serviceId || !o.buyerId || !o.sellerId || !o.status || o.price === undefined
    );
    
    if (ordersToFix.length > 0) {
      console.log(`  - ${ordersToFix.length} commandes à corriger`);
      
      // Obtenir un ID de service valide
      let defaultServiceId = null;
      if (services.length > 0) {
        defaultServiceId = services[0]._id;
      } else {
        // Créer un service temporaire si nécessaire
        const tempService = {
          title: 'Service temporaire',
          description: 'Service créé automatiquement pour corriger les données',
          price: 1000,
          category: 'Autre',
          userId: defaultUserId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await db.collection('services').insertOne(tempService);
        defaultServiceId = result.insertedId;
      }
      
      // Obtenir des ID d'utilisateurs pour buyer et seller
      const users = await db.collection('users').find().limit(2).toArray();
      let defaultBuyerId = null;
      let defaultSellerId = null;
      
      if (users.length >= 2) {
        defaultBuyerId = users[0]._id;
        defaultSellerId = users[1]._id;
      } else if (users.length === 1) {
        defaultBuyerId = users[0]._id;
        defaultSellerId = users[0]._id;
      } else {
        // Cas improbable mais géré pour robustesse
        console.log('  ⚠️ Aucun utilisateur trouvé, impossible de corriger les commandes');
        return;
      }
      
      // Mettre à jour chaque commande
      for (const order of ordersToFix) {
        const updates = {};
        
        if (!order.serviceId) updates.serviceId = defaultServiceId;
        if (!order.buyerId) updates.buyerId = defaultBuyerId;
        if (!order.sellerId) updates.sellerId = defaultSellerId;
        if (!order.status) updates.status = 'pending';
        if (order.price === undefined) {
          // Obtenir le prix du service associé ou utiliser une valeur par défaut
          const serviceId = order.serviceId || defaultServiceId;
          const service = await db.collection('services').findOne({ _id: serviceId });
          updates.price = service ? service.price : 1000;
        }
        
        await db.collection('orders').updateOne(
          { _id: order._id },
          { $set: updates }
        );
      }
      
      console.log(`  ✅ ${ordersToFix.length} commandes corrigées avec succès`);
    } else {
      console.log('  ✅ Aucune commande à corriger');
    }
    
    // 3. Vérifier la collection users
    console.log('\n🔧 Vérification de la collection users:');
    const users = await db.collection('users').find().toArray();
    console.log(`  - ${users.length} utilisateurs trouvés`);
    
    // Vérifier si l'index email existe
    const userIndexes = await db.collection('users').indexes();
    const hasEmailIndex = userIndexes.some(index => 
      index.key && Object.keys(index.key).includes('email')
    );
    
    if (!hasEmailIndex) {
      console.log('  - Création de l\'index manquant: email');
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('  ✅ Index email créé avec succès');
    } else {
      console.log('  ✅ L\'index email existe déjà');
    }
    
    // 4. Vérifier le format des données
    console.log('\n🔍 Vérification du format des données après correction:');
    
    // 4.1 Services
    const fixedServices = await db.collection('services').find().toArray();
    const invalidServices = fixedServices.filter(s => !s.userId || !s.title || s.price === undefined);
    console.log(`  - Services: ${invalidServices.length === 0 ? '✅ Tous valides' : `⚠️ ${invalidServices.length} toujours invalides`}`);
    
    // 4.2 Orders
    const fixedOrders = await db.collection('orders').find().toArray();
    const invalidOrders = fixedOrders.filter(o => 
      !o.serviceId || !o.buyerId || !o.sellerId || !o.status || o.price === undefined
    );
    console.log(`  - Orders: ${invalidOrders.length === 0 ? '✅ Tous valides' : `⚠️ ${invalidOrders.length} toujours invalides`}`);
    
    console.log('\n✅ Corrections terminées avec succès!');
    console.log('📊 Résumé:');
    console.log(`  - ${servicesMissingUserId?.length || 0} services corrigés`);
    console.log(`  - ${ordersToFix?.length || 0} commandes corrigées`);
    console.log(`  - 6 index créés (2 pour services, 4 pour orders)`);
    
  } catch (err) {
    console.error('❌ Erreur lors des corrections:', err);
  } finally {
    await client.close();
    console.log('\n🔚 Connexion MongoDB fermée');
  }
}

fixMongoDB().catch(console.error); 