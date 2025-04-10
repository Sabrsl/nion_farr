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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Charger les variables d'environnement
dotenv.config();
const REPORT_DIR = path.join(__dirname, '../../audit-reports');
// Fonction pour assurer que le répertoire de rapports existe
function ensureReportDirExists() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
}
// Générer un nom de fichier pour le rapport
function getReportFileName() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    return path.join(REPORT_DIR, `audit-${dateStr}-${timeStr}.json`);
}
async function runAudit() {
    // S'assurer que le répertoire pour les rapports existe
    ensureReportDirExists();
    try {
        console.log('Démarrage de l\'audit MongoDB...');
        // Récupérer l'URI de MongoDB depuis les variables d'environnement
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI non définie dans les variables d\'environnement');
        }
        console.log('Connexion à MongoDB...');
        const client = new mongodb_1.MongoClient(uri);
        await client.connect();
        console.log('Connexion établie avec succès');
        // Accéder à la base de données
        const db = client.db('nionfar');
        // 1. Lister et compter les documents dans chaque collection
        const collections = await db.listCollections().toArray();
        console.log(`Nombre de collections : ${collections.length}`);
        const collectionStats = {};
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            collectionStats[collection.name] = count;
        }
        // 2. Vérifier les erreurs dans les logs
        const errors = await db.collection('logs')
            .find({ level: 'error' })
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
        // 3. Vérifier les alertes actives
        const activeAlerts = await db.collection('alerts')
            .find({ resolved: false })
            .sort({ timestamp: -1 })
            .toArray();
        // 4. Analyser les tendances de croissance
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const newUsers = await db.collection('users')
            .countDocuments({ createdAt: { $gte: lastWeek } });
        const newOrders = await db.collection('orders')
            .countDocuments({ createdAt: { $gte: lastWeek } });
        // 5. Créer le rapport d'audit
        const auditReport = {
            timestamp: new Date().toISOString(),
            collectionStats,
            databaseHealth: {
                totalCollections: collections.length,
                totalDocuments: Object.values(collectionStats).reduce((a, b) => a + b, 0),
                recentErrors: errors.length,
                activeAlerts: activeAlerts.length
            },
            weeklyGrowth: {
                newUsers,
                newOrders
            },
            recentErrors: errors.map(err => ({
                message: err.message,
                timestamp: err.timestamp,
                service: err.service
            })),
            activeAlerts: activeAlerts.map(alert => ({
                level: alert.level,
                message: alert.message,
                timestamp: alert.timestamp,
                service: alert.service
            }))
        };
        // Enregistrer le rapport dans un fichier
        const reportFile = getReportFileName();
        fs.writeFileSync(reportFile, JSON.stringify(auditReport, null, 2));
        // Afficher un résumé du rapport
        console.log('\n=== Rapport d\'audit MongoDB ===');
        console.log(`Date: ${new Date().toISOString()}`);
        console.log('\nStatistiques des collections:');
        for (const [collection, count] of Object.entries(collectionStats)) {
            console.log(`- ${collection}: ${count} documents`);
        }
        console.log(`\nErreurs récentes: ${errors.length}`);
        console.log(`Alertes actives: ${activeAlerts.length}`);
        console.log(`\nCroissance hebdomadaire:`);
        console.log(`- Nouveaux utilisateurs: ${newUsers}`);
        console.log(`- Nouvelles commandes: ${newOrders}`);
        console.log(`\nRapport complet enregistré dans: ${reportFile}`);
        // Fermer la connexion
        await client.close();
        console.log('Audit terminé avec succès');
    }
    catch (error) {
        console.error('Erreur lors de l\'audit:', error);
    }
}
// Exécuter l'audit
runAudit();
