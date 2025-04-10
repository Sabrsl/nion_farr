"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migration_1 = require("./migration");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
async function runMigrations() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const migrationService = app.get(migration_1.MigrationService);
    try {
        const result = await migrationService.runMigrations();
        console.log(`Migrations completed successfully. Applied ${result.migrationsApplied} migrations.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
runMigrations();
