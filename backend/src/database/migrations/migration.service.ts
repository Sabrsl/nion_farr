import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

interface MigrationMeta {
  name: string;
  appliedAt: Date;
}

@Injectable()
export class MigrationService implements OnModuleInit {
  private migrationsPath: string;
  private migrationCollection = 'migrations';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
  ) {
    this.logger.setContext('MigrationService');
    this.migrationsPath = path.join(process.cwd(), 'src/database/migrations/scripts');
  }

  async onModuleInit() {
    const runMigrations = this.configService.get<string>('RUN_MIGRATIONS') === 'true';
    
    if (!runMigrations) {
      this.logger.log('Migrations désactivées par configuration');
      return;
    }
    
    try {
      this.logger.log('Vérification des migrations...');
      const isMemoryConstrained = this.configService.get<string>('MEMORY_OPTIMIZED') === 'true';
      
      if (isMemoryConstrained) {
        this.logger.warn('Exécution des migrations en mode économie de mémoire');
      }
      
      await this.runMigrations();
    } catch (error) {
      this.logger.error(`Erreur lors de l'initialisation des migrations: ${error.message}`, error.stack);
    }
  }

  /**
   * Exécute les migrations nécessaires
   */
  async runMigrations(): Promise<void> {
    try {
      // Créer la collection de migrations si elle n'existe pas
      await this.ensureMigrationCollection();
      
      // Récupérer les migrations déjà appliquées
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedMigrationNames = appliedMigrations.map(m => m.name);
      
      // Trouver toutes les migrations disponibles
      const migrationFiles = this.findMigrationFiles();
      
      // Filtrer les migrations qui n'ont pas encore été appliquées
      const pendingMigrations = migrationFiles.filter(
        file => !appliedMigrationNames.includes(path.basename(file, '.js')),
      );
      
      if (pendingMigrations.length === 0) {
        this.logger.log('Aucune nouvelle migration à appliquer');
        return;
      }
      
      this.logger.log(`${pendingMigrations.length} migration(s) en attente d'application`);
      
      // Trier les migrations par nom (qui contient généralement un numéro de séquence)
      pendingMigrations.sort();
      
      // Appliquer chaque migration en séquence
      for (const migrationFile of pendingMigrations) {
        const migrationName = path.basename(migrationFile, '.js');
        this.logger.log(`Démarrage de la migration: ${migrationName}`);
        
        try {
          // Charger et exécuter la migration
          const migrationScript = await import(migrationFile);
          const session = await this.connection.startSession();
          
          try {
            session.startTransaction();
            
            if (typeof migrationScript.up === 'function') {
              await migrationScript.up(this.connection, session);
            } else if (typeof migrationScript.default === 'function') {
              await migrationScript.default(this.connection, session);
            } else {
              throw new Error(`La migration ${migrationName} ne contient pas de méthode 'up' ou 'default'`);
            }
            
            // Enregistrer la migration comme appliquée
            await this.connection.collection(this.migrationCollection).insertOne({
              name: migrationName,
              appliedAt: new Date(),
            }, { session });
            
            await session.commitTransaction();
            this.logger.log(`Migration ${migrationName} appliquée avec succès`);
          } catch (error) {
            await session.abortTransaction();
            throw error;
          } finally {
            session.endSession();
          }
        } catch (error) {
          this.logger.error(`Erreur lors de l'application de la migration ${migrationName}: ${error.message}`, error.stack);
          throw error; // Interrompre les migrations si une échoue
        }
      }
      
      this.logger.log('Toutes les migrations ont été appliquées avec succès');
    } catch (error) {
      this.logger.error(`Échec de l'application des migrations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Créer la collection de migrations si elle n'existe pas
   */
  private async ensureMigrationCollection(): Promise<void> {
    const collections = await this.connection.db.listCollections({ name: this.migrationCollection }).toArray();
    
    if (collections.length === 0) {
      this.logger.log(`Création de la collection ${this.migrationCollection}`);
      await this.connection.createCollection(this.migrationCollection);
    }
  }

  /**
   * Récupérer les migrations déjà appliquées
   */
  private async getAppliedMigrations(): Promise<MigrationMeta[]> {
    const result = await this.connection
      .collection(this.migrationCollection)
      .find({})
      .sort({ appliedAt: 1 })
      .toArray();
      
    // Transformation du résultat en MigrationMeta[]
    return result.map(doc => ({
      name: doc.name as string,
      appliedAt: doc.appliedAt as Date
    }));
  }

  /**
   * Trouver tous les fichiers de migration
   */
  private findMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      this.logger.warn(`Le dossier de migrations n'existe pas: ${this.migrationsPath}`);
      return [];
    }
    
    return glob.sync(path.join(this.migrationsPath, '*.js'));
  }
} 