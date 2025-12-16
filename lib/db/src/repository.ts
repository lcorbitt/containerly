import { DataSource, Repository } from 'typeorm';
import { User, Lookup, Organization } from './entities';

export class DatabaseRepository {
  public userRepository: Repository<User>;
  public lookupRepository: Repository<Lookup>;
  public organizationRepository: Repository<Organization>;

  constructor(private dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.lookupRepository = dataSource.getRepository(Lookup);
    this.organizationRepository = dataSource.getRepository(Organization);
  }
}

export function createDataSource(databaseUrl: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Lookup, Organization],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    migrations: ['../../lib/db/src/migrations/*.ts'],
    extra: {
      max: 10,
      connectionTimeoutMillis: 5000,
    },
  });
}
