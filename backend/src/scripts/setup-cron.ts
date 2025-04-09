import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

// Chemin vers le projet
const rootDir = path.resolve(__dirname, '../../');

// Contenu du fichier crontab
const cronContent = `
# Exécuter l'audit MongoDB tous les jours à 3h du matin
0 3 * * * cd ${rootDir} && npm run audit >> ${rootDir}/logs/audit-cron.log 2>&1

# Exécuter l'audit MongoDB tous les lundis à midi pour un rapport hebdomadaire
0 12 * * 1 cd ${rootDir} && npm run audit >> ${rootDir}/logs/audit-weekly.log 2>&1
`;

// Fonction pour configurer le cron job
function setupCronJob() {
  // S'assurer que le dossier de logs existe
  const logsDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Créer un fichier temporaire pour le crontab
  const tempFile = path.join(rootDir, 'temp-crontab');
  
  // Écrire le contenu dans le fichier temporaire
  fs.writeFileSync(tempFile, cronContent);
  
  // Commande pour ajouter le crontab
  const command = `crontab ${tempFile}`;
  
  // Exécuter la commande
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur lors de la configuration du cron job: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erreur: ${stderr}`);
      return;
    }
    console.log('Cron job configuré avec succès !');
    console.log(stdout);
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(tempFile);
  });
}

// Instructions d'utilisation si crontab n'est pas disponible
function showManualInstructions() {
  console.log(`
=== Instructions pour configurer manuellement l'audit automatique ===

1. Ouvrez le planificateur de tâches de votre système :
   - Linux/Mac : Exécutez 'crontab -e' dans un terminal
   - Windows : Ouvrez "Planificateur de tâches" depuis le menu Démarrer

2. Ajoutez les tâches suivantes :

===== Pour Linux/Mac (crontab) =====
# Exécuter l'audit MongoDB tous les jours à 3h du matin
0 3 * * * cd ${rootDir} && npm run audit >> ${rootDir}/logs/audit-cron.log 2>&1

# Exécuter l'audit MongoDB tous les lundis à midi pour un rapport hebdomadaire
0 12 * * 1 cd ${rootDir} && npm run audit >> ${rootDir}/logs/audit-weekly.log 2>&1

===== Pour Windows (tâches planifiées) =====
- Créez une nouvelle tâche qui s'exécute quotidiennement à 3h00
  Programme/script: ${rootDir}\\node_modules\\.bin\\ts-node.cmd
  Arguments: -r tsconfig-paths/register ${rootDir}\\src\\scripts\\audit.ts
  Démarrer dans: ${rootDir}

- Créez une autre tâche qui s'exécute tous les lundis à 12h00
  Avec les mêmes paramètres que ci-dessus
`);
}

// Selon l'environnement, configurer automatiquement ou afficher des instructions
if (process.platform === 'win32') {
  console.log('Environnement Windows détecté.');
  showManualInstructions();
} else {
  try {
    setupCronJob();
  } catch (error) {
    console.error('Erreur lors de la configuration automatique:', error);
    showManualInstructions();
  }
} 