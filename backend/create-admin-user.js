const axios = require('axios');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nionfar';
const adminUser = {
  email: 'admin@nionfar.sn',
  firstName: 'Admin',
  lastName: 'NionFar',
  password: 'AdminNionFar123!',
  role: 'admin',
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

async function createAdminUser() {
  console.log('Tentative de création d\'un utilisateur administrateur...');
  
  let client;
  try {
    // Connexion à MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connecté à MongoDB avec succès!');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await usersCollection.findOne({ email: adminUser.email });
    if (existingUser) {
      console.log(`L'utilisateur avec l'email ${adminUser.email} existe déjà.`);
      return;
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Créer l'utilisateur avec le mot de passe haché
    const newUser = {
      ...adminUser,
      password: hashedPassword
    };
    
    // Insérer l'utilisateur dans la base de données
    const result = await usersCollection.insertOne(newUser);
    console.log(`Utilisateur administrateur créé avec succès! ID: ${result.insertedId}`);
    console.log('Vous pouvez maintenant vous connecter avec:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Mot de passe: ${adminUser.password}`);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur administrateur:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Déconnecté de MongoDB.');
    }
  }
}

// Exécuter la fonction
createAdminUser(); 