import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrationsDir: string;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    this.migrationsDir = path.join(process.cwd(), 'migrations');
    
    // Créer le répertoire de migrations s'il n'existe pas
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }
  }

  async runMigrations() {
    try {
      this.logger.log('Starting database migrations');
      
      // Vérifier si la collection de migrations existe
      const migrationsCollection = this.connection.collection('migrations');
      const appliedMigrations = await migrationsCollection.find({}).toArray();
      const appliedMigrationNames = appliedMigrations.map(m => m.name);
      
      // Lire tous les fichiers de migration
      const migrationFiles = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
        .sort(); // Assurer l'ordre d'exécution
      
      let migrationsApplied = 0;
      
      for (const migrationFile of migrationFiles) {
        const migrationName = path.basename(migrationFile, path.extname(migrationFile));
        
        // Vérifier si la migration a déjà été appliquée
        if (appliedMigrationNames.includes(migrationName)) {
          this.logger.log(`Migration ${migrationName} already applied, skipping`);
          continue;
        }
        
        this.logger.log(`Applying migration: ${migrationName}`);
        
        // Importer et exécuter la migration
        const migrationPath = path.join(this.migrationsDir, migrationFile);
        const migration = require(migrationPath);
        
        if (typeof migration.up === 'function') {
          await migration.up(this.connection);
          
          // Enregistrer la migration comme appliquée
          await migrationsCollection.insertOne({
            name: migrationName,
            appliedAt: new Date(),
          });
          
          migrationsApplied++;
          this.logger.log(`Migration ${migrationName} applied successfully`);
        } else {
          this.logger.warn(`Migration ${migrationName} does not have an 'up' function, skipping`);
        }
      }
      
      this.logger.log(`Migrations completed. ${migrationsApplied} migrations applied.`);
      return { success: true, migrationsApplied };
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async createMigration(name: string) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}-${name}.ts`;
      const filePath = path.join(this.migrationsDir, fileName);
      
      const template = `import { Connection } from 'mongoose';

/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */
export async function up(connection: Connection) {
  // TODO: Implement migration logic
  // Example:
  // await connection.collection('users').updateMany(
  //   { role: { $exists: false } },
  //   { $set: { role: 'user' } }
  // );
}

export async function down(connection: Connection) {
  // TODO: Implement rollback logic
  // Example:
  // await connection.collection('users').updateMany(
  //   { role: 'user' },
  //   { $unset: { role: 1 } }
  // );
}
`;
      
      fs.writeFileSync(filePath, template);
      this.logger.log(`Migration file created: ${fileName}`);
      return { success: true, fileName };
    } catch (error) {
      this.logger.error(`Failed to create migration: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async getMigrationStatus() {
    const appliedMigrations = await this.connection.collection('migrations').find().toArray();
    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    return migrationFiles.map(file => {
      const migration = appliedMigrations.find(m => m.name === file);
      return {
        name: file,
        applied: !!migration,
        appliedAt: migration?.appliedAt
      };
    });
  }
} 