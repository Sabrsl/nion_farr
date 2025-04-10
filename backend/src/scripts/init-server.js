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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
// Fonctions utilitaires
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur d'exécution: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`Avertissement: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}
async function initServer() {
    try {
        console.log('🚀 Initialisation du serveur Nionfar...');
        // 1. Vérifier si la base de données existe déjà
        const dbConfigFile = path.join(__dirname, '../../.data/db-initialized.json');
        const dbDir = path.join(__dirname, '../../.data');
        // Créer le répertoire .data s'il n'existe pas
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        const dbInitialized = fs.existsSync(dbConfigFile);
        if (dbInitialized) {
            console.log('✅ Base de données déjà initialisée');
        }
        else {
            console.log('🔄 Initialisation de la base de données...');
            // 2. Exécuter les migrations
            try {
                console.log('📊 Exécution des migrations...');
                await executeCommand('npm run typeorm:migration:run');
                console.log('✅ Migrations exécutées avec succès');
            }
            catch (error) {
                console.error('❌ Erreur lors de l\'exécution des migrations:', error);
                // Essayer de générer la structure de la base de données
                try {
                    console.log('🔄 Génération de la structure de la base de données...');
                    await executeCommand('ts-node src/generate-database-structure.ts');
                    console.log('✅ Structure de la base de données générée avec succès');
                }
                catch (seedError) {
                    console.error('❌ Erreur lors de la génération de la structure:', seedError);
                }
            }
            // 3. Seed (si les migrations ont réussi)
            try {
                console.log('🌱 Seed de la base de données...');
                await executeCommand('npm run seed');
                console.log('✅ Seed exécuté avec succès');
            }
            catch (error) {
                console.error('❌ Erreur lors du seed:', error);
            }
            // 4. Marquer comme initialisé
            fs.writeFileSync(dbConfigFile, JSON.stringify({
                initialized: true,
                date: new Date().toISOString(),
            }), 'utf8');
            console.log('✅ Base de données initialisée');
        }
        // 5. Démarrer le serveur
        console.log('🚀 Démarrage du serveur NestJS...');
        await executeCommand('npm run start:dev');
    }
    catch (error) {
        console.error('❌ Erreur d\'initialisation du serveur:', error);
        process.exit(1);
    }
}
// Exécution du script
initServer().catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
});
