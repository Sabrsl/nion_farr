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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.SecretsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SecretsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SecretsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SecretsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        configService;
        jwtService;
        logger = new common_1.Logger(SecretsService.name);
        JWT_KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
        SECRETS_DIR = path.join(process.cwd(), 'secrets');
        SECRETS_FILE = path.join(this.SECRETS_DIR, 'secrets.json');
        JWT_KEYS_FILE = path.join(this.SECRETS_DIR, 'jwt-keys.json');
        VAULT_ENABLED = process.env.VAULT_ENABLED === 'true';
        VAULT_ADDR = process.env.VAULT_ADDR || 'http://localhost:8200';
        VAULT_TOKEN = process.env.VAULT_TOKEN;
        VAULT_PATH = process.env.VAULT_PATH || 'secret/data/nionfar';
        constructor(connection, configService, jwtService) {
            this.connection = connection;
            this.configService = configService;
            this.jwtService = jwtService;
        }
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
            this.connection.collection('jwtKeys').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            // Vérifier si nous avons besoin de générer une nouvelle clé JWT
            await this.ensureActiveJwtKey();
            // Planifier la rotation des clés JWT
            setInterval(() => this.rotateJwtKey(), this.JWT_KEY_ROTATION_INTERVAL);
        }
        /**
         * Vérifie si une clé JWT active existe, sinon en génère une nouvelle
         */
        async ensureActiveJwtKey() {
            const activeKey = await this.connection.collection('jwtKeys').findOne({ isActive: true });
            if (!activeKey) {
                this.logger.log('No active JWT key found, generating a new one');
                await this.rotateJwtKey();
            }
            else {
                this.logger.log(`Active JWT key found, expires at ${activeKey.expiresAt}`);
            }
        }
        /**
         * Génère une nouvelle clé JWT et la rend active
         */
        async rotateJwtKey() {
            try {
                // Désactiver toutes les clés existantes
                await this.connection.collection('jwtKeys').updateMany({ isActive: true }, { $set: { isActive: false } });
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
            }
            catch (error) {
                this.logger.error(`Failed to rotate JWT key: ${error.message}`);
                throw error;
            }
        }
        /**
         * Récupère la clé JWT active
         */
        async getActiveJwtKey() {
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
        async getSecret(key) {
            try {
                if (this.VAULT_ENABLED) {
                    return await this.getSecretFromVault(key);
                }
                else {
                    return await this.getSecretFromFile(key);
                }
            }
            catch (error) {
                this.logger.error(`Failed to get secret ${key}: ${error.message}`);
                throw error;
            }
        }
        /**
         * Récupère un secret depuis le fichier local
         */
        async getSecretFromFile(key) {
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
        async getSecretFromVault(key) {
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
        async setSecret(key, value) {
            try {
                if (this.VAULT_ENABLED) {
                    await this.setSecretInVault(key, value);
                }
                else {
                    await this.setSecretInFile(key, value);
                }
            }
            catch (error) {
                this.logger.error(`Failed to set secret ${key}: ${error.message}`);
                throw error;
            }
        }
        /**
         * Stocke un secret dans le fichier local
         */
        async setSecretInFile(key, value) {
            const secrets = JSON.parse(fs.readFileSync(this.SECRETS_FILE, 'utf8'));
            secrets[key] = value;
            fs.writeFileSync(this.SECRETS_FILE, JSON.stringify(secrets, null, 2));
        }
        /**
         * Stocke un secret dans HashiCorp Vault
         */
        async setSecretInVault(key, value) {
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
        generateSecret(length = 32) {
            return crypto.randomBytes(length).toString('hex');
        }
        /**
         * Récupère la liste des clés JWT
         */
        async getJwtKeys() {
            const keys = await this.connection.collection('jwtKeys').find().toArray();
            return keys.map(key => ({
                id: key.id,
                key: key.key,
                createdAt: key.createdAt,
                expiresAt: key.expiresAt,
                isActive: key.isActive
            }));
        }
    };
    return SecretsService = _classThis;
})();
exports.SecretsService = SecretsService;
