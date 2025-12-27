import { DataSource } from 'typeorm';
import { User, Lookup, Organization } from './entities';

// Load .env file from apps/api directory (where migrations are typically run from)
const path = require('path');
const envPath = path.resolve(__dirname, '../../../apps/api/.env');
const result = require('dotenv').config({ path: envPath });

// Also try loading from root .env as fallback if apps/api/.env doesn't exist
if (result.error) {
  const rootEnvPath = path.resolve(__dirname, '../../../.env');
  require('dotenv').config({ path: rootEnvPath });
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/containerly',
  entities: [User, Lookup, Organization],
  migrations: ['../../lib/db/src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

