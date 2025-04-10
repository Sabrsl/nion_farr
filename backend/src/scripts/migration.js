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
exports.MigrationService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MigrationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MigrationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MigrationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        connection;
        configService;
        logger = new common_1.Logger(MigrationService.name);
        migrationsDir;
        constructor(connection, configService) {
            this.connection = connection;
            this.configService = configService;
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
                    }
                    else {
                        this.logger.warn(`Migration ${migrationName} does not have an 'up' function, skipping`);
                    }
                }
                this.logger.log(`Migrations completed. ${migrationsApplied} migrations applied.`);
                return { success: true, migrationsApplied };
            }
            catch (error) {
                this.logger.error(`Migration failed: ${error.message}`, error.stack);
                return { success: false, error: error.message };
            }
        }
        async createMigration(name) {
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
            }
            catch (error) {
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
    };
    return MigrationService = _classThis;
})();
exports.MigrationService = MigrationService;
