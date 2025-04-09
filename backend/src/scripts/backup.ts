import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;

  constructor(private configService: ConfigService) {
    this.backupDir = path.join(process.cwd(), 'backups');
    
    // Créer le répertoire de sauvegarde s'il n'existe pas
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
      
      // Créer le répertoire de sauvegarde avec timestamp
      fs.mkdirSync(backupPath, { recursive: true });
      
      // Récupérer l'URI MongoDB
      const mongoUri = this.configService.get<string>('MONGODB_URI');
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI not configured');
      }
      
      // Extraire les informations de connexion
      const uriParts = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
      
      if (!uriParts) {
        throw new Error('Invalid MongoDB URI format');
      }
      
      const [, username, password, host, database] = uriParts;
      
      // Commande mongodump
      const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;
      
      this.logger.log(`Starting backup to ${backupPath}`);
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        this.logger.warn(`Backup warnings: ${stderr}`);
      }
      
      this.logger.log(`Backup completed successfully: ${stdout}`);
      
      // Compression du backup
      const zipCommand = `cd "${this.backupDir}" && tar -czf "backup-${timestamp}.tar.gz" "backup-${timestamp}"`;
      await execAsync(zipCommand);
      
      // Suppression du dossier non compressé
      fs.rmSync(backupPath, { recursive: true, force: true });
      
      // Nettoyage des anciens backups (garder les 7 derniers jours)
      this.cleanOldBackups();
      
      this.logger.log(`Backup compressed to backup-${timestamp}.tar.gz`);
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);
    }
  }
  
  private cleanOldBackups() {
    const files = fs.readdirSync(this.backupDir);
    const backupFiles = files.filter(file => file.endsWith('.tar.gz'));
    
    // Trier par date (les plus récents en premier)
    backupFiles.sort((a, b) => {
      const dateA = new Date(a.replace('backup-', '').replace('.tar.gz', ''));
      const dateB = new Date(b.replace('backup-', '').replace('.tar.gz', ''));
      return dateB.getTime() - dateA.getTime();
    });
    
    // Supprimer les backups plus vieux que 7 jours
    if (backupFiles.length > 7) {
      for (let i = 7; i < backupFiles.length; i++) {
        const fileToDelete = path.join(this.backupDir, backupFiles[i]);
        fs.unlinkSync(fileToDelete);
        this.logger.log(`Deleted old backup: ${backupFiles[i]}`);
      }
    }
  }
} 