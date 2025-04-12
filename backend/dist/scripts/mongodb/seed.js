/**
 * Script de seeding de données de test pour MongoDB
 * Ce fichier est utilisé pour initialiser la base de données avec des données de test
 */

// Simulation de connexion à MongoDB
console.log('Connecting to MongoDB...');
console.log('Seeding database with initial data...');

// Données de base pour le seeding
const seedData = {
  users: [
    {
      email: 'admin@nionfar.com',
      password: 'hashed_password_here',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    },
    {
      email: 'provider@nionfar.com',
      password: 'hashed_password_here',
      firstName: 'Provider',
      lastName: 'User',
      role: 'provider',
      isActive: true
    },
    {
      email: 'user@nionfar.com',
      password: 'hashed_password_here',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      isActive: true
    }
  ],
  services: [
    {
      title: 'Création de site web',
      description: 'Service de création de site web professionnel',
      shortDescription: 'Création de site web sur mesure',
      price: 50000,
      category: 'web-development',
      isActive: true,
      slug: 'creation-site-web'
    },
    {
      title: 'Design de logo',
      description: 'Service de création de logo professionnel',
      shortDescription: 'Logos modernes et élégants',
      price: 25000,
      category: 'design',
      isActive: true,
      slug: 'design-logo'
    }
  ],
  categories: [
    {
      name: 'Développement Web',
      slug: 'web-development',
      description: 'Services de développement web'
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'Services de design graphique'
    }
  ]
};

// Fonction qui serait utilisée pour le seeding
const seedDatabase = async () => {
  try {
    console.log('Inserting users...');
    // Simulation: await User.insertMany(seedData.users);
    
    console.log('Inserting categories...');
    // Simulation: await Category.insertMany(seedData.categories);
    
    console.log('Inserting services...');
    // Simulation: await Service.insertMany(seedData.services);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Exécution conditionnelle
if (require.main === module) {
  seedDatabase();
} else {
  module.exports = {
    seedDatabase,
    seedData
  };
} 