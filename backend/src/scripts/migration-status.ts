import { MigrationService } from './migration';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getConnectionToken } from '@nestjs/mongoose';

async function checkMigrationStatus() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const connection = app.get(getConnectionToken());
  const migrationService = new MigrationService(connection, configService);

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
  } catch (error) {
    console.error('Error checking migration status:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

checkMigrationStatus(); 