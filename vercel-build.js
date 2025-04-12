// Script de préparation pour le build Vercel
console.log('🚀 Préparation du build Vercel...');

const fs = require('fs');
const path = require('path');

// Vérifier l'environnement
console.log(`Environnement: ${process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'}`);
console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'Non définie'}`);

// S'assurer que .next existe pour les builds incrementiels
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  try {
    fs.mkdirSync(nextDir, { recursive: true });
    console.log('✅ Répertoire .next créé');
  } catch (error) {
    console.warn('⚠️ Impossible de créer le répertoire .next:', error.message);
  }
}

// Vérifier si le fichier .env.production existe
const envFile = path.join(__dirname, '.env.production');
if (!fs.existsSync(envFile)) {
  console.warn('⚠️ Fichier .env.production non trouvé, création avec des valeurs par défaut');
  const defaultEnv = 
`NEXT_PUBLIC_API_URL=${process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api'}
NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || 'https://nionfar.vercel.app'}
NEXT_PUBLIC_ENVIRONMENT=production`;

  try {
    fs.writeFileSync(envFile, defaultEnv);
    console.log('✅ Fichier .env.production créé');
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env.production:', error.message);
  }
}

console.log('✅ Préparation terminée, démarrage du build Next.js...'); 