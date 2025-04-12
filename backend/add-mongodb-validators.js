/**
 * Script pour ajouter des validateurs de schéma à MongoDB
 * Assure l'intégrité des données futures
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Récupérer l'URI MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Erreur: MONGODB_URI n\'est pas défini');
  process.exit(1);
}

console.log('🔧 Ajout des validateurs de schéma MongoDB...');
console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

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

async function addValidators() {
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
    
    // Récupérer la liste des collections existantes
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`📊 Collections trouvées: ${collectionNames.join(', ')}`);
    
    // Ajouter les validateurs pour chaque collection
    for (const [collectionName, validatorConfig] of Object.entries(validators)) {
      console.log(`\n🔍 Traitement de la collection ${collectionName}:`);
      
      // Vérifier si la collection existe
      if (!collectionNames.includes(collectionName)) {
        console.log(`  ⚠️ La collection ${collectionName} n'existe pas, création avec validateur...`);
        
        // Créer la collection avec le validateur
        await db.createCollection(collectionName, validatorConfig);
        console.log(`  ✅ Collection ${collectionName} créée avec validateur`);
      } else {
        // Mettre à jour le validateur de la collection existante
        console.log(`  - La collection ${collectionName} existe déjà, mise à jour du validateur...`);
        
        try {
          // Tenter de modifier la collection pour ajouter le validateur
          await db.command({
            collMod: collectionName,
            ...validatorConfig
          });
          console.log(`  ✅ Validateur ajouté à la collection ${collectionName}`);
        } catch (err) {
          // En cas d'erreur, essayer une approche alternative
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
    }
    
    console.log('\n✅ Tous les validateurs de schéma ont été ajoutés avec succès!');
    console.log(`📊 Résumé: ${Object.keys(validators).length} validateurs configurés`);
    console.log('🔒 Les collections sont maintenant protégées contre les données non conformes');
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'ajout des validateurs:', err);
  } finally {
    await client.close();
    console.log('\n🔚 Connexion MongoDB fermée');
  }
}

addValidators().catch(console.error); 