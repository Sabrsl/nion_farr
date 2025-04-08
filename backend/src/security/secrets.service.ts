import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface SecretKey {
  _id?: any;
  id: string;
  key: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

@Injectable()
export class SecretsService implements OnModuleInit {
  private readonly logger = new Logger(SecretsService.name);
  private readonly JWT_KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  private readonly SECRETS_DIR = path.join(process.cwd(), 'secrets');
  private readonly SECRETS_FILE = path.join(this.SECRETS_DIR, 'secrets.json');
  private readonly JWT_KEYS_FILE = path.join(this.SECRETS_DIR, 'jwt-keys.json');
  private readonly VAULT_ENABLED = process.env.VAULT_ENABLED === 'true';
  private readonly VAULT_ADDR = process.env.VAULT_ADDR || 'http://localhost:8200';
  private readonly VAULT_TOKEN = process.env.VAULT_TOKEN;
  private readonly VAULT_PATH = process.env.VAULT_PATH || 'secret/data/nionfar';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Créer le répertoire des secrets s'il n'existe pas
    if (!fs.existsSync(this.SECRETS_DIR)) {
      fs.mkdirSync(this.SECRETS_DIR, { recursive: true });
    }

    // Initialiser les fichiers de secrets s'ils n'existent pas
    if (!fs.existsSync(this.SECRETS_FILE)) {
      fs.writeFileSync(this.SECRETS_FILE, JSON.stringify({}, null, 2));
    }

    if (!fs.existsSync(this.JWT_KEYS_FILE)) {
      fs.writeFileSync(this.JWT_KEYS_FILE, JSON.stringify({ keys: [] }, null, 2));
    }

    // Créer l'index TTL pour supprimer automatiquement les clés JWT expirées
    this.connection.collection('jwtKeys').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    // Vérifier si nous avons besoin de générer une nouvelle clé JWT
    await this.ensureActiveJwtKey();

    // Planifier la rotation des clés JWT
    setInterval(() => this.rotateJwtKey(), this.JWT_KEY_ROTATION_INTERVAL);
  }

  /**
   * Vérifie si une clé JWT active existe, sinon en génère une nouvelle
   */
  private async ensureActiveJwtKey(): Promise<void> {
    const activeKey = await this.connection.collection('jwtKeys').findOne({ isActive: true });
    
    if (!activeKey) {
      this.logger.log('No active JWT key found, generating a new one');
      await this.rotateJwtKey();
    } else {
      this.logger.log(`Active JWT key found, expires at ${activeKey.expiresAt}`);
    }
  }

  /**
   * Génère une nouvelle clé JWT et la rend active
   */
  async rotateJwtKey(): Promise<void> {
    try {
      // Désactiver toutes les clés existantes
      await this.connection.collection('jwtKeys').updateMany(
        { isActive: true },
        { $set: { isActive: false } }
      );

      // Générer une nouvelle clé
      const keyId = crypto.randomUUID();
      const key = crypto.randomBytes(64).toString('hex');
      const createdAt = new Date();
      const expiresAt = new Date(Date.now() + this.JWT_KEY_ROTATION_INTERVAL);

      // Enregistrer la nouvelle clé dans la base de données
      await this.connection.collection('jwtKeys').insertOne({
        id: keyId,
        key,
        createdAt,
        expiresAt,
        isActive: true,
      });

      // Mettre à jour le fichier local
      const jwtKeys = JSON.parse(fs.readFileSync(this.JWT_KEYS_FILE, 'utf8'));
      jwtKeys.keys.push({
        id: keyId,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
      });
      fs.writeFileSync(this.JWT_KEYS_FILE, JSON.stringify(jwtKeys, null, 2));

      this.logger.log(`New JWT key generated with ID: ${keyId}`);
    } catch (error) {
      this.logger.error(`Failed to rotate JWT key: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère la clé JWT active
   */
  async getActiveJwtKey(): Promise<string> {
    const activeKey = await this.connection.collection('jwtKeys').findOne({ isActive: true });
    
    if (!activeKey) {
      this.logger.warn('No active JWT key found, generating a new one');
      await this.rotateJwtKey();
      return this.getActiveJwtKey();
    }
    
    return activeKey.key;
  }

  /**
   * Récupère un secret depuis le stockage sécurisé
   */
  async getSecret(key: string): Promise<string> {
    try {
      if (this.VAULT_ENABLED) {
        return await this.getSecretFromVault(key);
      } else {
        return await this.getSecretFromFile(key);
      }
    } catch (error) {
      this.logger.error(`Failed to get secret ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère un secret depuis le fichier local
   */
  private async getSecretFromFile(key: string): Promise<string> {
    const secrets = JSON.parse(fs.readFileSync(this.SECRETS_FILE, 'utf8'));
    
    if (!secrets[key]) {
      this.logger.warn(`Secret ${key} not found in file`);
      return null;
    }
    
    return secrets[key];
  }

  /**
   * Récupère un secret depuis HashiCorp Vault
   */
  private async getSecretFromVault(key: string): Promise<string> {
    // Cette implémentation est un exemple et nécessiterait l'installation
    // du client Vault et une configuration appropriée
    this.logger.log(`Getting secret ${key} from Vault at ${this.VAULT_ADDR}`);
    
    // Exemple d'implémentation avec le client Vault
    // const vault = new Vault({
    //   apiVersion: 'v1',
    //   endpoint: this.VAULT_ADDR,
    //   token: this.VAULT_TOKEN,
    // });
    // 
    // const { data } = await vault.read(`${this.VAULT_PATH}/${key}`);
    // return data.data.value;
    
    // Pour l'instant, retournons une valeur factice
    return `vault:${key}`;
  }

  /**
   * Stocke un secret dans le stockage sécurisé
   */
  async setSecret(key: string, value: string): Promise<void> {
    try {
      if (this.VAULT_ENABLED) {
        await this.setSecretInVault(key, value);
      } else {
        await this.setSecretInFile(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set secret ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stocke un secret dans le fichier local
   */
  private async setSecretInFile(key: string, value: string): Promise<void> {
    const secrets = JSON.parse(fs.readFileSync(this.SECRETS_FILE, 'utf8'));
    secrets[key] = value;
    fs.writeFileSync(this.SECRETS_FILE, JSON.stringify(secrets, null, 2));
  }

  /**
   * Stocke un secret dans HashiCorp Vault
   */
  private async setSecretInVault(key: string, value: string): Promise<void> {
    // Cette implémentation est un exemple et nécessiterait l'installation
    // du client Vault et une configuration appropriée
    this.logger.log(`Setting secret ${key} in Vault at ${this.VAULT_ADDR}`);
    
    // Exemple d'implémentation avec le client Vault
    // const vault = new Vault({
    //   apiVersion: 'v1',
    //   endpoint: this.VAULT_ADDR,
    //   token: this.VAULT_TOKEN,
    // });
    // 
    // await vault.write(`${this.VAULT_PATH}/${key}`, {
    //   value,
    // });
  }

  /**
   * Génère un nouveau secret aléatoire
   */
  generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Récupère la liste des clés JWT
   */
  async getJwtKeys(): Promise<SecretKey[]> {
    const keys = await this.connection.collection('jwtKeys').find().toArray();
    return keys.map(key => ({
      id: key.id,
      key: key.key,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      isActive: key.isActive
    }));
  }
} 