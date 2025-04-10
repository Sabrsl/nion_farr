"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const mongodb_1 = require("mongodb");
// Charger les variables d'environnement
dotenv.config();
async function seed() {
    try {
        console.log('Démarrage du script de seed pour MongoDB seulement...');
        // Se connecter à MongoDB
        const uri = process.env.MONGODB_URI;
        console.log('Connexion à MongoDB avec l\'URI :', uri);
        const client = new mongodb_1.MongoClient(uri);
        await client.connect();
        console.log('Connexion à MongoDB établie');
        // Accéder à la base de données
        const db = client.db('nionfar');
        // Supprimer les collections existantes si nécessaires
        console.log('Nettoyage des collections existantes...');
        try {
            await db.collection('users').drop();
            console.log('Collection users supprimée');
        }
        catch (error) {
            console.log('Aucune collection users à supprimer');
        }
        try {
            await db.collection('services').drop();
            console.log('Collection services supprimée');
        }
        catch (error) {
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
    }
    catch (error) {
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
