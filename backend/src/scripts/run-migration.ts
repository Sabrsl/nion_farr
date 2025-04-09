import { MigrationService } from './migration';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const migrationService = app.get(MigrationService);

  try {
    const result = await migrationService.runMigrations();
    console.log(`Migrations completed successfully. Applied ${result.migrationsApplied} migrations.`);
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runMigrations(); 