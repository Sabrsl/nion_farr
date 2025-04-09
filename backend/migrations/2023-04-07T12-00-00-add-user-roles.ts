import { Connection } from 'mongoose';

/**
 * Migration: add-user-roles
 * Created: 2023-04-07T12:00:00.000Z
 * 
 * Cette migration ajoute un champ 'role' à tous les utilisateurs existants
 * qui n'en ont pas encore un, avec la valeur par défaut 'user'.
 */
export async function up(connection: Connection) {
  // Ajouter le champ 'role' à tous les utilisateurs qui n'en ont pas
  const result = await connection.collection('users').updateMany(
    { role: { $exists: false } },
    { $set: { role: 'user' } }
  );
  
  console.log(`Migration 'add-user-roles' applied: ${result.modifiedCount} users updated`);
}

/**
 * Cette fonction permet de revenir en arrière si nécessaire
 */
export async function down(connection: Connection) {
  // Supprimer le champ 'role' de tous les utilisateurs
  const result = await connection.collection('users').updateMany(
    { role: 'user' },
    { $unset: { role: 1 } }
  );
  
  console.log(`Migration 'add-user-roles' rolled back: ${result.modifiedCount} users updated`);
} 