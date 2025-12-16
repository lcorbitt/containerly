import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUpdatedAtTrigger1699999999002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create function to update updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for users table
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for organizations table
    await queryRunner.query(`
      CREATE TRIGGER update_organizations_updated_at 
      BEFORE UPDATE ON organizations
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for lookups table
    await queryRunner.query(`
      CREATE TRIGGER update_lookups_updated_at 
      BEFORE UPDATE ON lookups
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_lookups_updated_at ON lookups;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users;`);

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
  }
}

