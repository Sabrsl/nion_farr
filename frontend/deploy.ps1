# Script de déploiement pour Nionfar Frontend
# À exécuter en environnement PowerShell

# Définir les variables d'environnement
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = 1

# Nettoyer les répertoires de build (optionnel)
Write-Host "🧹 Nettoyage des répertoires de build..."
if (Test-Path -Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..."
npm install --production

# Lancer l'application en mode production
Write-Host "🚀 Lancement de l'application en mode production..."
Write-Host "ℹ️ L'application sera disponible à l'adresse: http://localhost:3000"
npm run prod

# Arrêt de l'application
# Pour arrêter, appuyez sur Ctrl+C 