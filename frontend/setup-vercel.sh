#!/bin/bash

# Script de configuration pour le déploiement Vercel
echo "🔧 Configuration de l'environnement Vercel..."

# Vérifier si nous sommes sur Vercel
if [ "$VERCEL" == "1" ]; then
  echo "✅ Exécution sur l'environnement Vercel"
  
  # Corriger les problèmes connus de Vercel
  echo "🔧 Application des correctifs pour Vercel..."
  
  # 1. Vérifier et mettre à jour les variables d'environnement
  if [ -f ".env.production" ]; then
    echo "✅ Fichier .env.production trouvé"
  else
    echo "📝 Création du fichier .env.production..."
    echo "NEXT_PUBLIC_API_URL=https://nion-farr-backend.vercel.app/api" > .env.production
    echo "NEXT_PUBLIC_APP_URL=https://nion-farr.vercel.app" >> .env.production
    echo "NEXT_PUBLIC_ENVIRONMENT=production" >> .env.production
    echo "NEXT_PUBLIC_CORS_ALLOWED_ORIGINS=https://nion-farr.vercel.app,https://nion-farr-backend.vercel.app" >> .env.production
  fi
  
  # 2. Vérifier les redirections d'API dans vercel.json
  if [ -f "vercel.json" ]; then
    echo "✅ Fichier vercel.json trouvé"
    # La vérification détaillée serait faite ici dans un script plus complet
  else
    echo "📝 Création du fichier vercel.json..."
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "framework": "nextjs",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "routes": [
    { 
      "src": "/api/(.*)", 
      "dest": "https://nion-farr-backend.vercel.app/api/$1" 
    },
    { 
      "src": "/(.*)", 
      "dest": "/$1" 
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://nion-farr-backend.vercel.app/api/:path*"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://nion-farr-backend.vercel.app/api",
    "NEXT_PUBLIC_APP_URL": "https://nion-farr.vercel.app",
    "NEXT_PUBLIC_ENVIRONMENT": "production",
    "NEXT_DISABLE_ESLINT": "1",
    "NODE_ENV": "production",
    "TAILWIND_MODE": "watch"
  }
}
EOF
  fi
  
  # 3. S'assurer que package.json a le bon script de construction
  if grep -q '"vercel-build"' package.json; then
    echo "✅ Script vercel-build trouvé dans package.json"
  else
    echo "🔧 Ajout du script vercel-build à package.json..."
    # Cette modification nécessiterait un outil comme jq pour modifier correctement le JSON
    # Pour un script shell simple, nous aviserons l'utilisateur
    echo "⚠️ Veuillez ajouter manuellement le script 'vercel-build' à package.json si nécessaire"
  fi
  
  # 4. Remplacer next.config.js par la version optimisée pour Vercel
  if [ -f "next.config.js.vercel" ]; then
    echo "🔧 Remplacement de next.config.js par la version optimisée pour Vercel..."
    cp next.config.js next.config.js.backup
    cp next.config.js.vercel next.config.js
    echo "✅ next.config.js remplacé par la version optimisée"
  fi
  
  # 5. Vérifier les configurations expérimentales problématiques
  if grep -q "esmExternals" next.config.js; then
    echo "⚠️ Configuration 'esmExternals' détectée dans next.config.js, cela peut causer des problèmes sur Vercel"
    
    # Si une modification automatique est nécessaire, elle serait ici
    # Pour ce script, nous allons simplement alerter
    echo "ℹ️ Considérez supprimer ou modifier cette configuration si des problèmes de build surviennent"
  fi
  
  echo "✅ Configuration Vercel terminée"
else
  echo "ℹ️ Ce script est conçu pour être exécuté dans l'environnement Vercel"
  echo "ℹ️ Pour tester localement, vous pouvez définir VERCEL=1 puis exécuter ce script"
fi

# Copier le fichier de configuration temporaire
cp next.config.js.temp next.config.js

echo "Configuration Next.js mise à jour pour le déploiement Vercel" 