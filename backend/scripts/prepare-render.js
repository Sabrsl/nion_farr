const createRenderYaml = () => {
  const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
  const renderYamlContent = `services:
  - type: web
    name: nionfar-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: APP_URL
        value: https://nionfar-backend.onrender.com
      - key: FRONTEND_URL
        value: https://nion-farr.vercel.app
      - key: PORT
        value: 3001
      - key: IS_RENDER
        value: true
    autoDeploy: true
    plan: free
`;
  
  if (!fileExists(renderYamlPath)) {
    console.log(`${colors.blue}Création du fichier render.yaml...${colors.reset}`);
    fs.writeFileSync(renderYamlPath, renderYamlContent);
    console.log(`${colors.green}✅ Fichier render.yaml créé${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Fichier render.yaml existe déjà${colors.reset}`);
  }
};

// Créer un fichier .env-sample pour Render
const createEnvSample = () => {
  const envSamplePath = path.join(__dirname, '..', '.env-sample');
  const envSampleContent = `# Variables d'environnement requises pour Render
NODE_ENV=production
PORT=3001
IS_RENDER=true

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# URL de l'application
APP_URL=https://nionfar-backend.onrender.com
FRONTEND_URL=https://nion-farr.vercel.app

# CORS
CORS_ALLOWED_ORIGINS=https://nion-farr.vercel.app,http://localhost:3000

# JWT
JWT_SECRET=votre_jwt_secret_ultra_securise
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=votre_jwt_refresh_secret_ultra_securise
JWT_REFRESH_EXPIRES_IN=7d

# Email
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM=noreply@nionfar.com

# Mémoire
MEMORY_OPTIMIZED=true
`;
  
  if (!fileExists(envSamplePath)) {
    console.log(`${colors.blue}Création du fichier .env-sample...${colors.reset}`);
    fs.writeFileSync(envSamplePath, envSampleContent);
    console.log(`${colors.green}✅ Fichier .env-sample créé${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Fichier .env-sample existe déjà${colors.reset}`);
  }
};
