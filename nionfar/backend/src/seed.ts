import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Charger les variables d'environnement
dotenv.config();

async function seed() {
  try {
    console.log('Démarrage du script de seed pour MongoDB seulement...');

    // Se connecter à MongoDB
    const uri = process.env.MONGODB_URI;
    console.log('Connexion à MongoDB avec l\'URI :', uri);

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion à MongoDB établie');

    // Accéder à la base de données
    const db = client.db('nionfar');

    // Supprimer les collections existantes si nécessaires
    console.log('Nettoyage des collections existantes...');
    try {
      await db.collection('users').drop();
      console.log('Collection users supprimée');
    } catch (error) {
      console.log('Aucune collection users à supprimer');
    }

    try {
      await db.collection('services').drop();
      console.log('Collection services supprimée');
    } catch (error) {
      console.log('Aucune collection services à supprimer');
    }

    // Créer de nouveaux documents
    console.log('Création des utilisateurs...');
    const usersCollection = db.collection('users');
    await usersCollection.insertMany([
      {
        email: 'admin@nionfar.com',
        firstName: 'Admin',
        lastName: 'Nionfar',
        role: 'admin',
        password: '$2b$10$8hxnWVF8v2aElFqJ8vP4h.xGcnVfJ4nbwCxG6hW9HBZ6JA/P.3X3m', // Admin123!
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'client1@nionfar.com',
        firstName: 'Client',
        lastName: 'Un',
        role: 'client',
        password: '$2b$10$8hxnWVF8v2aElFqJ8vP4h.xGcnVfJ4nbwCxG6hW9HBZ6JA/P.3X3m', // Admin123!
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'freelancer1@nionfar.com',
        firstName: 'Freelancer',
        lastName: 'Un',
        role: 'freelancer',
        password: '$2b$10$8hxnWVF8v2aElFqJ8vP4h.xGcnVfJ4nbwCxG6hW9HBZ6JA/P.3X3m', // Admin123!
        isActive: true,
        providerProfile: {
          title: 'Expert Développeur Web',
          description: 'Plus de 5 ans d\'expérience en développement web',
          hourlyRate: 25,
          languages: ['Français', 'Anglais']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Utilisateurs créés');

    console.log('Création des services...');
    const servicesCollection = db.collection('services');
    await servicesCollection.insertMany([
      {
        title: 'Développement de site web',
        description: 'Création de site web professionnel et responsive',
        category: 'Développement Web',
        price: 500,
        deliveryTime: 5,
        providerId: 'freelancer1@nionfar.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Logo design',
        description: 'Création de logo professionnel pour votre entreprise',
        category: 'Design Graphique',
        price: 200,
        deliveryTime: 3,
        providerId: 'freelancer1@nionfar.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Services créés');

    console.log('Seed terminé avec succès!');
    console.log('Fermeture de la connexion MongoDB');
    await client.close();
    
  } catch (error) {
    console.error('Erreur lors du seed:', error);
  }
}

// Exécuter la fonction de seed
seed()
  .then(() => {
    console.log('=== Fin du seed ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  }); 