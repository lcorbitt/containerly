import { createDataSource, DatabaseRepository, User, Lookup, Organization } from '@containerly/db';
import { LookupStatus, UserRole } from '@containerly/common';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = createDataSource(process.env.DATABASE_URL!);
  await dataSource.initialize();
  const repository = new DatabaseRepository(dataSource);

  console.log('Seeding database...');

  // Create or get test organization
  let organization = await repository.organizationRepository.findOne({
    where: { name: 'Test Organization' },
  });

  if (!organization) {
    organization = repository.organizationRepository.create({
      name: 'Test Organization',
    });
    organization = await repository.organizationRepository.save(organization);
    console.log('Created test organization:', organization.name);
  } else {
    console.log('Test organization already exists:', organization.name);
  }

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  let user = await repository.userRepository.findOne({
    where: { email: 'test@example.com' },
  });

  if (!user) {
    user = repository.userRepository.create({
      email: 'test@example.com',
      password: hashedPassword,
      orgId: organization.id,
      role: UserRole.ORG_ADMIN,
    });
    user = await repository.userRepository.save(user);
    console.log('Created test user:', user.email, 'with role:', user.role);
  } else {
    console.log('Test user already exists:', user.email);
  }

  // Create some mock lookups
  const mockQueries = [
    'container ABC123',
    'shipment XYZ789',
    'cargo DEF456',
    'vessel GHI012',
  ];

  for (const query of mockQueries) {
    const existingLookup = await repository.lookupRepository.findOne({
      where: { query, userId: user.id },
    });

    if (!existingLookup) {
      const lookup = repository.lookupRepository.create({
        query,
        userId: user.id,
        orgId: organization.id,
        status: LookupStatus.COMPLETED,
        result: {
          result: `Mock result for: ${query}`,
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'seed',
            processed: true,
          },
        },
        completedAt: new Date(),
      });

      await repository.lookupRepository.save(lookup);
      console.log(`Created lookup: ${query}`);
    }
  }

  console.log('Seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

