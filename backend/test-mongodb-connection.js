/**
 * Script pour tester la connexion à MongoDB
 * Utilise l'URI MongoDB configuré dans .env
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

console.log('🔍 Test de connexion à MongoDB...');
console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Masquer les credentials pour la sécurité

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

// Fonction pour vérifier le type d'une valeur MongoDB
function getMongoType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) return 'array';
  if (value._bsontype === 'ObjectID' || value._bsontype === 'ObjectId') return 'objectId';
  
  return typeof value;
}

// Fonction pour vérifier la conformité d'un document avec un schéma
function validateDocumentAgainstSchema(doc, schema) {
  const results = {
    missingFields: [],
    wrongTypes: []
  };
  
  // Vérifier les champs requis
  for (const field of schema.required) {
    if (doc[field] === undefined) {
      results.missingFields.push(field);
    }
  }
  
  // Vérifier les types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (doc[field] !== undefined) {
      const actualType = getMongoType(doc[field]);
      if (actualType !== expectedType) {
        results.wrongTypes.push({
          field,
          expected: expectedType,
          actual: actualType,
          value: doc[field]
        });
      }
    }
  }
  
  return results;
}

async function testConnection() {
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
    
    // Lister les bases de données
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    console.log('\n📊 Bases de données disponibles:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB' : 'vide'})`);
    });
    
    // Afficher les informations sur la base de données nionfar
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`\n🔍 Vérification de la base de données '${dbName}'...`);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log(`⚠️ La base de données '${dbName}' n'a pas de collections`);
    } else {
      console.log(`✅ Base de données '${dbName}' trouvée avec ${collections.length} collections:`);
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Vérifier les documents dans les collections essentielles
      console.log('\n🔍 Vérification des collections essentielles:');
      const essentialCollections = Object.keys(expectedSchemas);
      
      for (const colName of essentialCollections) {
        if (collections.find(c => c.name === colName)) {
          const count = await db.collection(colName).countDocuments();
          console.log(`\n📑 Collection ${colName}: ${count} documents`);
          
          // Vérification du schéma sur un échantillon de documents
          if (count > 0) {
            const sampleSize = Math.min(count, 3);
            const samples = await db.collection(colName).find().limit(sampleSize).toArray();
            
            console.log(`  Analyse de ${sampleSize} document(s) pour validation de schéma:`);
            
            let schemaIssues = false;
            for (let i = 0; i < samples.length; i++) {
              const doc = samples[i];
              const validation = validateDocumentAgainstSchema(doc, expectedSchemas[colName]);
              
              if (validation.missingFields.length > 0 || validation.wrongTypes.length > 0) {
                schemaIssues = true;
                console.log(`  ⚠️ Document #${i+1} non conforme au schéma:`);
                
                if (validation.missingFields.length > 0) {
                  console.log(`    Champs requis manquants: ${validation.missingFields.join(', ')}`);
                }
                
                if (validation.wrongTypes.length > 0) {
                  console.log(`    Types incorrects:`);
                  validation.wrongTypes.forEach(issue => {
                    console.log(`      - ${issue.field}: attendu ${issue.expected}, reçu ${issue.actual}`);
                  });
                }
              }
            }
            
            if (!schemaIssues) {
              console.log(`  ✅ Les documents analysés sont conformes au schéma attendu`);
            }
            
            // Vérification des indexes
            console.log(`  📊 Vérification des indexes:`);
            const indexes = await db.collection(colName).indexes();
            
            console.log(`  Indexes trouvés (${indexes.length}):`);
            for (const index of indexes) {
              const keys = Object.keys(index.key).join(', ');
              console.log(`    - ${index.name}: ${keys} (${index.unique ? 'unique' : 'non-unique'})`);
            }
            
            // Vérifier que tous les indexes attendus existent
            const expectedIndexes = expectedSchemas[colName].indexes || [];
            if (expectedIndexes.length > 0) {
              const missingIndexes = [];
              
              for (const expectedIndex of expectedIndexes) {
                const found = indexes.some(index => 
                  index.key && Object.keys(index.key).includes(expectedIndex)
                );
                
                if (!found) {
                  missingIndexes.push(expectedIndex);
                }
              }
              
              if (missingIndexes.length > 0) {
                console.log(`  ⚠️ Indexes attendus manquants: ${missingIndexes.join(', ')}`);
              } else {
                console.log(`  ✅ Tous les indexes attendus sont présents`);
              }
            }
          }
        } else {
          console.log(`⚠️ Collection '${colName}' non trouvée dans la base de données`);
        }
      }
    }
    
    // Vérifier les autorisations
    try {
      console.log('\n🔐 Test des autorisations...');
      // Test écriture
      const testCollection = db.collection('connection_test');
      await testCollection.insertOne({ test: true, timestamp: new Date() });
      console.log('✅ Autorisations d\'écriture : OK');
      
      // Test lecture
      await testCollection.findOne({ test: true });
      console.log('✅ Autorisations de lecture : OK');
      
      // Test suppression
      await testCollection.deleteMany({ test: true });
      console.log('✅ Autorisations de suppression : OK');
    } catch (err) {
      console.error('❌ Problème avec les autorisations:', err.message);
    }
    
    console.log('\n✅ Tests MongoDB réussis! La connexion fonctionne correctement.');
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error); 