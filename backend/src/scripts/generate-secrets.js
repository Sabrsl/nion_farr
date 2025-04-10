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
const crypto = __importStar(require("crypto"));
/**
 * Script pour générer des secrets JWT sécurisés
 * Exécutez avec: npm run generate:secrets
 */
// Générer un secret aléatoire de 64 octets (très sécurisé)
const generateSecret = () => crypto.randomBytes(64).toString('hex');
// Générer les secrets
const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();
console.log('\n===== SECRETS GÉNÉRÉS AVEC SUCCÈS =====\n');
console.log('Copiez ces secrets et mettez-les à jour dans les variables d\'environnement de Render:\n');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\nJWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);
console.log('\n======================================\n');
console.log('Instructions:');
console.log('1. Allez sur le tableau de bord Render');
console.log('2. Sélectionnez votre service "nion-farr-backend"');
console.log('3. Cliquez sur "Environment" dans le menu');
console.log('4. Mettez à jour les variables JWT_SECRET et JWT_REFRESH_SECRET avec ces nouvelles valeurs');
console.log('5. Cliquez sur "Save Changes" et redéployez votre application');
console.log('\nRemarque: ces secrets doivent rester confidentiels et ne pas être partagés\n');
