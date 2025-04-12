// Script de nettoyage des variables d'environnement pour Vercel
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des variables d\'environnement et configuration Vercel...');

// Détection de l'environnement Vercel
const isVercel = process.env.VERCEL === '1';
console.log(`Environnement Vercel: ${isVercel ? 'Oui' : 'Non'}`);

// Chemin vers les fichiers de configuration
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const envLocalPath = path.join(process.cwd(), '.env.local');
const envProductionPath = path.join(process.cwd(), '.env.production');

// Vérifier si nous sommes sur Vercel
if (isVercel) {
  console.log('✅ Exécution sur Vercel - Nettoyage des variables d\'environnement...');
  
  // 1. Forcer les variables d'environnement
  process.env.NEXT_PUBLIC_API_URL = 'https://nion-farr-backend.vercel.app/api';
  process.env.NEXT_PUBLIC_APP_URL = 'https://nion-farr.vercel.app';
  process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
  
  console.log('✅ Variables d\'environnement définies:');
  console.log(`- NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`- NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
  console.log(`- NEXT_PUBLIC_ENVIRONMENT: ${process.env.NEXT_PUBLIC_ENVIRONMENT}`);
  
  // 2. Créer ou mettre à jour .env.production
  const envContent = `NEXT_PUBLIC_API_URL=https://nion-farr-backend.vercel.app/api
NEXT_PUBLIC_APP_URL=https://nion-farr.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_CORS_ALLOWED_ORIGINS=https://nion-farr.vercel.app,https://nion-farr-backend.vercel.app
`;

  try {
    fs.writeFileSync(envProductionPath, envContent);
    console.log('✅ Fichier .env.production créé/mis à jour');
  } catch (error) {
    console.error('❌ Erreur lors de la création de .env.production:', error);
  }
  
  // 3. Supprimer .env.local s'il existe (pour éviter les conflits)
  if (fs.existsSync(envLocalPath)) {
    try {
      fs.unlinkSync(envLocalPath);
      console.log('✅ Fichier .env.local supprimé');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de .env.local:', error);
    }
  }

  // 4. Remplacer les références Railway dans next.config.js si elles existent
  if (fs.existsSync(nextConfigPath)) {
    try {
      let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Vérifier si des URLs Railway sont présentes
      if (nextConfigContent.includes('railway.app')) {
        console.log('⚠️ URLs Railway détectées dans next.config.js, remplacement...');
        
        // Remplacer toutes les références à Railway
        nextConfigContent = nextConfigContent.replace(/https:\/\/[^/]*railway\.app[^'"]*/g, 'https://nion-farr-backend.vercel.app/api');
        
        // Écrire le fichier mis à jour
        fs.writeFileSync(nextConfigPath, nextConfigContent);
        console.log('✅ URLs Railway remplacées dans next.config.js');
      } else {
        console.log('✅ Aucune URL Railway détectée dans next.config.js');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de next.config.js:', error);
    }
  }

  console.log('✅ Nettoyage terminé - Configuration prête pour Vercel');
} else {
  console.log('ℹ️ Non exécuté sur Vercel - Aucune action nécessaire');
} 