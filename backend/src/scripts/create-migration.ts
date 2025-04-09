import { MigrationService } from './migration';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as path from 'path';

async function createMigration() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const migrationService = app.get(MigrationService);
  const name = process.argv[2];

  if (!name) {
    console.error('Please provide a name for the migration');
    process.exit(1);
  }

  try {
    const result = await migrationService.createMigration(name);
    console.log(`Migration file created: ${result.fileName}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating migration:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

createMigration(); 