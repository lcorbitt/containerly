// Load reflect-metadata FIRST (required for TypeORM decorators)
// Using require() to ensure it loads before any imports
require('reflect-metadata');

// Load .env file
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

// Register tsconfig-paths for @containerly/* imports
require('tsconfig-paths/register');

// Now import TypeORM entities and other modules
import { createDataSource, DatabaseRepository } from '@containerly/db';
import { LookupStatus, UserRole } from '@containerly/common';
import * as bcrypt from 'bcrypt';

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please set it in apps/api/.env');
  }
  const dataSource = createDataSource(process.env.DATABASE_URL);
  await dataSource.initialize();
  const repository = new DatabaseRepository(dataSource);

  console.log('Seeding database...\n');

  // Create organization
  let organization = await repository.organizationRepository.findOne({
    where: { name: 'JBS' },
  });

  if (!organization) {
    organization = repository.organizationRepository.create({
      name: 'JBS',
    });
    organization = await repository.organizationRepository.save(organization);
    console.log('✓ Created organization:', organization.name);
  } else {
    console.log('✓ Organization already exists:', organization.name);
  }

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create superadmin user
  let superadmin = await repository.userRepository.findOne({
    where: { email: 'superadmin@containerly.com' },
  });

  if (!superadmin) {
    superadmin = repository.userRepository.create({
      email: 'superadmin@containerly.com',
      password: hashedPassword,
      orgId: organization.id,
      role: UserRole.SUPER_ADMIN,
    });
    superadmin = await repository.userRepository.save(superadmin);
    console.log('✓ Created superadmin user:', superadmin.email);
  } else {
    console.log('✓ Superadmin user already exists:', superadmin.email);
  }

  // Create org admin user
  let orgAdmin = await repository.userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!orgAdmin) {
    orgAdmin = repository.userRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      orgId: organization.id,
      role: UserRole.ORG_ADMIN,
    });
    orgAdmin = await repository.userRepository.save(orgAdmin);
    console.log('✓ Created org admin user:', orgAdmin.email);
  } else {
    console.log('✓ Org admin user already exists:', orgAdmin.email);
  }

  // Create member user
  let member = await repository.userRepository.findOne({
    where: { email: 'member@example.com' },
  });

  if (!member) {
    member = repository.userRepository.create({
      email: 'member@example.com',
      password: hashedPassword,
      orgId: organization.id,
      role: UserRole.MEMBER,
    });
    member = await repository.userRepository.save(member);
    console.log('✓ Created member user:', member.email);
  } else {
    console.log('✓ Member user already exists:', member.email);
  }

  // Create 5 lookups for the organization (assigned to org admin)
  const mockQueries = [
    'container ABC123',
    'shipment XYZ789',
    'cargo DEF456',
    'vessel GHI012',
    'freight JKL345',
  ];

  let lookupCount = 0;
  for (const query of mockQueries) {
    const existingLookup = await repository.lookupRepository.findOne({
      where: { query, userId: orgAdmin.id },
    });

    if (!existingLookup) {
      const lookup = repository.lookupRepository.create({
        query,
        userId: orgAdmin.id,
        orgId: organization.id,
        status: LookupStatus.COMPLETED,
        result: {
          data: {
            containerId: query.split(' ')[1],
            status: 'delivered',
            location: 'Port of Los Angeles',
            estimatedArrival: new Date().toISOString(),
          },
          metadata: {
            source: 'seed',
            timestamp: new Date().toISOString(),
            processed: true,
          },
        },
        completedAt: new Date(),
      });

      await repository.lookupRepository.save(lookup);
      lookupCount++;
      console.log(`✓ Created lookup: ${query}`);
    }
  }

  if (lookupCount === 0) {
    console.log('✓ All lookups already exist');
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nLogin Credentials:');
  console.log('─'.repeat(60));
  console.log('Superadmin:');
  console.log('  Email:    superadmin@containerly.com');
  console.log('  Password: password123');
  console.log('\nOrg Admin:');
  console.log('  Email:    admin@example.com');
  console.log('  Password: password123');
  console.log('\nMember:');
  console.log('  Email:    member@example.com');
  console.log('  Password: password123');
  console.log('─'.repeat(60));
  console.log(`\nOrganization: ${organization.name}`);
  console.log(`Lookups created: ${lookupCount} of ${mockQueries.length}`);
  console.log('='.repeat(60) + '\n');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

