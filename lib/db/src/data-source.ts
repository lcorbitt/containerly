import { DataSource } from 'typeorm';
import { User, Lookup, Organization } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/containerly',
  entities: [User, Lookup, Organization],
  migrations: ['../../lib/db/src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

