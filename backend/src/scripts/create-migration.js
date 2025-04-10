"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migration_1 = require("./migration");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
async function createMigration() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const migrationService = app.get(migration_1.MigrationService);
    const name = process.argv[2];
    if (!name) {
        console.error('Please provide a name for the migration');
        process.exit(1);
    }
    try {
        const result = await migrationService.createMigration(name);
        console.log(`Migration file created: ${result.fileName}`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating migration:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
createMigration();
