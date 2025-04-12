#!/usr/bin/env node

/**
 * Script de planification d'audit MongoDB
 * Exécute périodiquement les audits et peut corriger automatiquement certains problèmes
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuration
const AUDIT_INTERVAL_HOURS = 24; // Exécuter l'audit une fois par jour
const AUTO_FIX = true; // Activer la correction automatique
const AUDIT_SCRIPT = path.join(__dirname, 'audit-mongodb-data.js');
const AUTO_FIX_INDEXES = true; // Corriger automatiquement les index manquants
const AUTO_FIX_DOCS = false; // Corriger automatiquement les documents (plus risqué)

// URI MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Erreur: Variable d\'environnement MONGODB_URI non définie');
  process.exit(1);
}

// Schémas attendus pour chaque collection (utilisés pour la correction automatique)
const expectedSchemas = {
  users: {
    required: ['email', 'password', 'role'],
    indexes: ['email'],
    defaultValues: {
      isActive: true,
      role: 'user',
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  },
  services: {
    required: ['title', 'price', 'userId'],
    indexes: ['userId', 'category'],
    defaultValues: {
      category: 'Autre',
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  },
  orders: {
    required: ['serviceId', 'buyerId', 'sellerId', 'status', 'price'],
    indexes: ['buyerId', 'sellerId', 'serviceId', 'status'],
    defaultValues: {
      status: 'pending',
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  }
};

// Fonction pour exécuter l'audit
function runAudit() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Exécution de l\'audit MongoDB...');
    
    const audit = spawn('node', [AUDIT_SCRIPT]);
    
    let output = '';
    let errorOutput = '';
    
    audit.stdout.on('data', (data) => {
      const stdout = data.toString();
      output += stdout;
      process.stdout.write(stdout);
    });
    
    audit.stderr.on('data', (data) => {
      const stderr = data.toString();
      errorOutput += stderr;
      process.stderr.write(stderr);
    });
    
    audit.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Audit terminé avec succès');
        resolve({ success: true, output });
      } else {
        console.error(`❌ Audit terminé avec le code d'erreur: ${code}`);
        
        // Déterminer si on a trouvé des problèmes qui nécessitent une correction
        const needsFixes = output.includes('Des problèmes importants ont été détectés');
        
        if (needsFixes && AUTO_FIX) {
          console.log('🔧 Des problèmes ont été détectés, tentative de correction automatique...');
          resolve({ success: false, needsFixes: true, output });
        } else {
          reject(new Error(`Audit échoué avec le code ${code}: ${errorOutput}`));
        }
      }
    });
  });
}

// Fonction pour analyser le dernier rapport d'audit
function parseLatestAuditReport() {
  const auditDir = path.join(__dirname, '..', 'audit-reports');
  if (!fs.existsSync(auditDir)) {
    return null;
  }
  
  const auditFiles = fs.readdirSync(auditDir)
    .filter(file => file.startsWith('mongodb-audit-'))
    .sort()
    .reverse();
  
  if (auditFiles.length === 0) {
    return null;
  }
  
  const latestAuditFile = path.join(auditDir, auditFiles[0]);
  try {
    const reportData = fs.readFileSync(latestAuditFile, 'utf8');
    return JSON.parse(reportData);
  } catch (err) {
    console.error('Erreur lors de la lecture du rapport d\'audit:', err);
    return null;
  }
}

// Fonction pour corriger automatiquement les problèmes
async function autoFixIssues(auditReport) {
  if (!auditReport || !auditReport.collections) {
    console.error('❌ Rapport d\'audit invalide ou manquant');
    return;
  }
  
  console.log('🔧 Démarrage des corrections automatiques...');
  
  const client = new MongoClient(uri, {
    maxPoolSize: 3,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log('✅ Connexion à MongoDB réussie');
    
    const db = client.db(auditReport.database);
    
    // Pour chaque collection
    for (const [collectionName, collectionData] of Object.entries(auditReport.collections)) {
      console.log(`\n🔧 Corrections pour la collection ${collectionName}:`);
      
      // 1. Corriger les index manquants si activé
      if (AUTO_FIX_INDEXES && collectionData.indexes.missing.length > 0) {
        console.log(`- Création de ${collectionData.indexes.missing.length} index(s) manquant(s)...`);
        
        for (const indexName of collectionData.indexes.missing) {
          try {
            const indexOptions = indexName === 'email' ? { unique: true } : {};
            await db.collection(collectionName).createIndex({ [indexName]: 1 }, indexOptions);
            console.log(`  ✅ Index ${indexName} créé avec succès`);
          } catch (err) {
            console.error(`  ❌ Erreur lors de la création de l'index ${indexName}:`, err);
          }
        }
      }
      
      // 2. Corriger les documents invalides si activé
      if (AUTO_FIX_DOCS && collectionData.documents.invalid > 0) {
        console.log(`- Tentative de correction de ${collectionData.documents.invalid} document(s) invalide(s)...`);
        
        // Pour chaque document invalide
        for (const docIssue of collectionData.documents.issues) {
          try {
            const docId = docIssue.docId;
            const updates = {};
            
            // Corriger les problèmes spécifiques
            for (const issue of docIssue.issues) {
              if (issue.type === 'missingField' && expectedSchemas[collectionName].defaultValues[issue.field]) {
                // Utiliser une valeur par défaut pour les champs manquants
                const defaultValue = expectedSchemas[collectionName].defaultValues[issue.field];
                updates[issue.field] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
              }
              
              if (issue.type === 'invalidValue' && issue.field === 'status') {
                // Corriger les statuts invalides
                updates[issue.field] = 'pending';
              }
              
              if (issue.type === 'invalidValue' && issue.field === 'role') {
                // Corriger les rôles invalides
                updates[issue.field] = 'user';
              }
            }
            
            // Appliquer les corrections si des mises à jour sont nécessaires
            if (Object.keys(updates).length > 0) {
              const result = await db.collection(collectionName).updateOne(
                { _id: docId },
                { $set: updates }
              );
              
              if (result.modifiedCount > 0) {
                console.log(`  ✅ Document ${docId} corrigé avec succès`);
              } else {
                console.warn(`  ⚠️ Aucune modification appliquée pour le document ${docId}`);
              }
            }
          } catch (err) {
            console.error(`  ❌ Erreur lors de la correction du document ${docIssue.docId}:`, err);
          }
        }
      }
    }
    
    console.log('\n✅ Corrections automatiques terminées');
    
  } catch (err) {
    console.error('❌ Erreur lors des corrections automatiques:', err);
  } finally {
    await client.close();
  }
}

// Fonction principale pour exécuter l'audit périodiquement
async function scheduleAudit() {
  try {
    // Exécuter l'audit immédiatement au démarrage
    const auditResult = await runAudit();
    
    // Si l'audit a échoué et que des corrections sont nécessaires
    if (!auditResult.success && auditResult.needsFixes && AUTO_FIX) {
      // Analyser le rapport d'audit pour identifier les problèmes
      const auditReport = parseLatestAuditReport();
      
      // Appliquer les corrections automatiques
      if (auditReport) {
        await autoFixIssues(auditReport);
        
        // Relancer l'audit après les corrections
        console.log('\n🔄 Relance de l\'audit après corrections...');
        await runAudit();
      }
    }
    
    // Planifier l'audit suivant
    const intervalMs = AUDIT_INTERVAL_HOURS * 60 * 60 * 1000;
    console.log(`\n⏱️ Prochain audit planifié dans ${AUDIT_INTERVAL_HOURS} heure(s)`);
    
    setTimeout(scheduleAudit, intervalMs);
    
  } catch (err) {
    console.error('Erreur lors de l\'exécution planifiée de l\'audit:', err);
    
    // En cas d'échec, réessayer après un délai plus court
    const retryMs = 1 * 60 * 60 * 1000; // 1 heure
    console.log(`⚠️ Nouvelle tentative d'audit dans 1 heure...`);
    
    setTimeout(scheduleAudit, retryMs);
  }
}

// Démarrer la planification
console.log(`🚀 Démarrage du planificateur d'audit MongoDB`);
console.log(`🔄 Intervalle d'audit: ${AUDIT_INTERVAL_HOURS} heure(s)`);
console.log(`🔧 Correction automatique: ${AUTO_FIX ? 'Activée' : 'Désactivée'}`);

scheduleAudit().catch(err => {
  console.error('Erreur critique lors du démarrage du planificateur:', err);
  process.exit(1);
}); 