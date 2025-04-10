"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
// Charger les variables d'environnement
(0, dotenv_1.config)();
console.log('==== TEST JWT ====');
// Vérifier si les secrets JWT sont configurés
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
if (!jwtSecret || !jwtRefreshSecret) {
    console.error('ERREUR: JWT_SECRET ou JWT_REFRESH_SECRET n\'est pas défini.');
    process.exit(1);
}
console.log('JWT_SECRET défini:', jwtSecret ? 'Oui' : 'Non');
console.log('JWT_REFRESH_SECRET défini:', jwtRefreshSecret ? 'Oui' : 'Non');
console.log('Longueur JWT_SECRET:', jwtSecret?.length || 0);
console.log('Longueur JWT_REFRESH_SECRET:', jwtRefreshSecret?.length || 0);
// Utilisation de require au lieu d'import pour éviter les problèmes de typage
const jwt = require('jsonwebtoken');
// Générer des tokens de test
try {
    const testPayload = {
        sub: 'test-user-id',
        email: 'test@example.com',
        role: 'CLIENT'
    };
    const accessToken = jwt.sign(testPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
    const refreshToken = jwt.sign(testPayload, jwtRefreshSecret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
    console.log('Test de génération de tokens réussi!');
    // Vérifier les tokens
    const decodedAccess = jwt.verify(accessToken, jwtSecret);
    const decodedRefresh = jwt.verify(refreshToken, jwtRefreshSecret);
    console.log('Test de vérification de tokens réussi!');
    console.log('Access Token validé:', decodedAccess ? 'Oui' : 'Non');
    console.log('Refresh Token validé:', decodedRefresh ? 'Oui' : 'Non');
    console.log('==== SUCCÈS ====');
    process.exit(0);
}
catch (error) {
    console.error('ERREUR lors des tests JWT:', error);
    process.exit(1);
}
