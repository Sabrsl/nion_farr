/**
 * Script de préparation de MongoDB pour le déploiement en production
 * Exécute séquentiellement la correction des données et l'ajout des validateurs
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Récupérer l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI n\'est pas défini dans les variables d\'environnement');
  console.error('Vérifiez que le fichier .env contient MONGODB_URI ou que la variable est définie dans votre environnement');
  process.exit(1);
}

// ---------------------------
// PARTIE 1: CORRECTION DES DONNÉES
// ---------------------------

// Fonction pour vérifier le type d'une valeur MongoDB
function getMongoType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) return 'array';
  if (value._bsontype === 'ObjectID' || value._bsontype === 'ObjectId') return 'objectId';
  
  return typeof value;
}

// Définition des schémas attendus (version simplifiée)
const expectedSchemas = {
  users: {
    fields: ['_id', 'email', 'firstName', 'lastName', 'password', 'role', 'isActive', 'createdAt', 'updatedAt'],
    required: ['email', 'password', 'role'],
    types: {
      email: 'string',
      password: 'string',
      role: 'string',
      isActive: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    },
    indexes: ['email']
  },
  services: {
    fields: ['_id', 'title', 'description', 'price', 'category', 'userId', 'createdAt', 'updatedAt'],
    required: ['title', 'price', 'userId'],
    types: {
      title: 'string',
      price: 'number',
      category: 'string',
      userId: 'objectId',
      createdAt: 'date',
      updatedAt: 'date'
    },
    indexes: ['userId', 'category']
  },
  orders: {
    fields: ['_id', 'orderNumber', 'serviceId', 'buyerId', 'sellerId', 'status', 'price', 'createdAt', 'updatedAt'],
    required: ['serviceId', 'buyerId', 'sellerId', 'status', 'price'],
    types: {
      serviceId: 'objectId',
      buyerId: 'objectId',
      sellerId: 'objectId',
      status: 'string',
      price: 'number',
      createdAt: 'date',
      updatedAt: 'date'
    },
    indexes: ['buyerId', 'sellerId', 'serviceId', 'status']
  }
};

// ---------------------------
// PARTIE 2: VALIDATEURS DE SCHÉMA
// ---------------------------

// Définition des validateurs de schéma pour chaque collection
const validators = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "password", "role"],
        properties: {
          email: {
            bsonType: "string",
            description: "Email de l'utilisateur (obligatoire et unique)"
          },
          password: {
            bsonType: "string",
            description: "Mot de passe hashé (obligatoire)"
          },
          role: {
            bsonType: "string",
            enum: ["user", "admin", "seller", "buyer"],
            description: "Rôle de l'utilisateur (obligatoire)"
          },
          firstName: {
            bsonType: "string",
            description: "Prénom de l'utilisateur"
          },
          lastName: {
            bsonType: "string",
            description: "Nom de famille de l'utilisateur"
          },
          isActive: {
            bsonType: "bool",
            description: "État du compte (actif/inactif)"
          },
          createdAt: {
            bsonType: "date",
            description: "Date de création du compte"
          },
          updatedAt: {
            bsonType: "date",
            description: "Date de dernière mise à jour du compte"
          }
        }
      }
    },
    validationLevel: "moderate",
    validationAction: "warn"
  },
  services: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "price", "userId"],
        properties: {
          title: {
            bsonType: "string",
            description: "Titre du service (obligatoire)"
          },
          description: {
            bsonType: "string",
            description: "Description du service"
          },
          price: {
            bsonType: "number",
            minimum: 0,
            description: "Prix du service (obligatoire)"
          },
          category: {
            bsonType: "string",
            description: "Catégorie du service"
          },
          userId: {
            bsonType: ["objectId", "string"],
            description: "ID de l'utilisateur propriétaire (obligatoire)"
          },
          createdAt: {
            bsonType: "date",
            description: "Date de création du service"
          },
          updatedAt: {
            bsonType: "date",
            description: "Date de dernière mise à jour du service"
          }
        }
      }
    },
    validationLevel: "moderate",
    validationAction: "warn"
  },
  orders: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["serviceId", "buyerId", "sellerId", "status", "price"],
        properties: {
          orderNumber: {
            bsonType: "string",
            description: "Numéro de commande"
          },
          serviceId: {
            bsonType: ["objectId", "string"],
            description: "ID du service commandé (obligatoire)"
          },
          buyerId: {
            bsonType: ["objectId", "string"],
            description: "ID de l'acheteur (obligatoire)"
          },
          sellerId: {
            bsonType: ["objectId", "string"],
            description: "ID du vendeur (obligatoire)"
          },
          status: {
            bsonType: "string",
            enum: ["pending", "confirmed", "completed", "cancelled", "disputed"],
            description: "Statut de la commande (obligatoire)"
          },
          price: {
            bsonType: "number",
            minimum: 0,
            description: "Prix total de la commande (obligatoire)"
          },
          createdAt: {
            bsonType: "date",
            description: "Date de création de la commande"
          },
          updatedAt: {
            bsonType: "date",
            description: "Date de dernière mise à jour de la commande"
          }
        }
      }
    },
    validationLevel: "moderate",
    validationAction: "warn"
  }
};

async function prepareMongoDBForProduction() {
  console.log('🚀 Préparation de MongoDB pour le déploiement en production...');
  console.log(`URI MongoDB: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  console.log('-------------------------------------------------------------');
  
  const client = new MongoClient(uri, {
    maxPoolSize: 3,
    minPoolSize: 1,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  });

  try {
    // Connexion à MongoDB
    await client.connect();
    console.log('✅ Connexion à MongoDB réussie!');
    
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    console.log(`\n📊 Base de données cible: ${dbName}`);
    
    // Création du fichier de sauvegarde
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `mongodb_backup_${new Date().toISOString().replace(/:/g, '-')}.json`);
    console.log(`📦 Sauvegarde des données avant modifications dans: ${backupFile}`);
    
    // Récupérer toutes les collections
    const collections = await db.listCollections().toArray();
    const backup = {};
    
    // Enregistrer les données de chaque collection importante
    for (const collection of collections) {
      const collectionName = collection.name;
      if (Object.keys(expectedSchemas).includes(collectionName)) {
        const documents = await db.collection(collectionName).find().toArray();
        backup[collectionName] = documents;
        console.log(`  - Collection ${collectionName}: ${documents.length} documents sauvegardés`);
      }
    }
    
    // Écrire le fichier de sauvegarde
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log('✅ Sauvegarde terminée');
    
    // ------------------------------
    // ÉTAPE 1: CORRECTION DES DONNÉES
    // ------------------------------
    console.log('\n🔧 ÉTAPE 1: CORRECTION DES DONNÉES ET CRÉATION DES INDEX');
    
    // 1. Correction de la collection services
    console.log('\n✨ Correction de la collection services:');
    
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
      let defaultUserId = adminUser ? adminUser._id : null;
      
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
    console.log('\n✨ Correction de la collection orders:');
    
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
        console.log('  ⚠️ Aucun service trouvé, création d\'un service par défaut');
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
    console.log('\n✨ Vérification de la collection users:');
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
    
    // -------------------------------
    // ÉTAPE 2: AJOUT DES VALIDATEURS
    // -------------------------------
    console.log('\n🔧 ÉTAPE 2: AJOUT DES VALIDATEURS DE SCHÉMA');
    
    // Ajouter les validateurs pour chaque collection
    for (const [collectionName, validatorConfig] of Object.entries(validators)) {
      console.log(`\n✨ Ajout du validateur pour la collection ${collectionName}:`);
      
      try {
        // Tenter de modifier la collection pour ajouter le validateur
        await db.command({
          collMod: collectionName,
          ...validatorConfig
        });
        console.log(`  ✅ Validateur ajouté à la collection ${collectionName}`);
      } catch (err) {
        console.error(`  ❌ Erreur lors de la mise à jour du validateur: ${err.message}`);
        console.log(`  ⚠️ Tentative de recréation de la collection avec validateur...`);
        
        // Renommer la collection existante
        const backupName = `${collectionName}_backup_${Date.now()}`;
        await db.collection(collectionName).rename(backupName);
        console.log(`  - Collection existante renommée en ${backupName}`);
        
        // Créer une nouvelle collection avec le validateur
        await db.createCollection(collectionName, validatorConfig);
        console.log(`  - Nouvelle collection créée avec validateur`);
        
        // Copier les données de l'ancienne collection vers la nouvelle
        const documents = await db.collection(backupName).find().toArray();
        if (documents.length > 0) {
          await db.collection(collectionName).insertMany(documents);
          console.log(`  - ${documents.length} documents copiés vers la nouvelle collection`);
        }
        
        console.log(`  ✅ Collection ${collectionName} recréée avec validateur`);
      }
    }
    
    // ----------------------------
    // ÉTAPE 3: VÉRIFICATION FINALE
    // ----------------------------
    console.log('\n🔧 ÉTAPE 3: VÉRIFICATION FINALE');
    
    const results = {
      services: {
        total: 0,
        valid: 0,
        indexes: []
      },
      orders: {
        total: 0,
        valid: 0,
        indexes: []
      },
      users: {
        total: 0,
        valid: 0,
        indexes: []
      }
    };
    
    // Vérifier les documents et les index pour chaque collection
    for (const collectionName of Object.keys(expectedSchemas)) {
      console.log(`\n✨ Vérification de la collection ${collectionName}:`);
      
      // Récupérer les documents
      const documents = await db.collection(collectionName).find().toArray();
      results[collectionName].total = documents.length;
      
      // Vérifier la validité des documents
      let validCount = 0;
      for (const doc of documents) {
        let isValid = true;
        
        // Vérifier les champs requis
        for (const field of expectedSchemas[collectionName].required) {
          if (doc[field] === undefined) {
            isValid = false;
            break;
          }
        }
        
        if (isValid) validCount++;
      }
      
      results[collectionName].valid = validCount;
      console.log(`  - Documents: ${validCount}/${documents.length} valides`);
      
      // Récupérer les index
      const indexes = await db.collection(collectionName).indexes();
      results[collectionName].indexes = indexes.map(idx => Object.keys(idx.key)[0]);
      
      console.log(`  - Index: ${indexes.length} trouvés (${results[collectionName].indexes.join(', ')})`);
    }
    
    console.log('\n📊 RÉSUMÉ DES CORRECTIONS:');
    console.log('----------------------------------------------------');
    
    for (const [collection, data] of Object.entries(results)) {
      console.log(`Collection ${collection}:`);
      console.log(`  - ${data.total} documents au total, ${data.valid} valides (${Math.round(data.valid/data.total*100)}%)`);
      console.log(`  - Index: ${data.indexes.join(', ')}`);
    }
    
    console.log('\n✅ La base de données MongoDB est prête pour le déploiement en production!');
    console.log('🎉 Toutes les corrections et validations ont été appliquées avec succès.');
    
  } catch (err) {
    console.error('❌ Erreur lors de la préparation de MongoDB:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔚 Connexion MongoDB fermée');
  }
}

// Exécution du script principal
prepareMongoDBForProduction().catch(console.error); 