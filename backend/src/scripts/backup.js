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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _performBackup_decorators;
    var BackupService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _performBackup_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT)];
            __esDecorate(this, null, _performBackup_decorators, { kind: "method", name: "performBackup", static: false, private: false, access: { has: obj => "performBackup" in obj, get: obj => obj.performBackup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BackupService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(BackupService.name);
        backupDir;
        constructor(configService) {
            this.configService = configService;
            this.backupDir = path.join(process.cwd(), 'backups');
            // Créer le répertoire de sauvegarde s'il n'existe pas
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
            }
        }
        async performBackup() {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
                // Créer le répertoire de sauvegarde avec timestamp
                fs.mkdirSync(backupPath, { recursive: true });
                // Récupérer l'URI MongoDB
                const mongoUri = this.configService.get('MONGODB_URI');
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
            }
            catch (error) {
                this.logger.error(`Backup failed: ${error.message}`, error.stack);
            }
        }
        cleanOldBackups() {
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
    };
    return BackupService = _classThis;
})();
exports.BackupService = BackupService;
