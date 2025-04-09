import * as crypto from 'crypto';

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