"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migration_1 = require("./migration");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
async function checkMigrationStatus() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const connection = app.get((0, mongoose_1.getConnectionToken)());
    const migrationService = new migration_1.MigrationService(connection, configService);
    try {
        const status = await migrationService.getMigrationStatus();
        console.log('\nMigration Status:');
        console.log('----------------');
        status.forEach(migration => {
            console.log(`${migration.name}: ${migration.applied ? 'Applied' : 'Pending'}`);
            if (migration.appliedAt) {
                console.log(`  Applied at: ${migration.appliedAt}`);
            }
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Error checking migration status:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
checkMigrationStatus();
