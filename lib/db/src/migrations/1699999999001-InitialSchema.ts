import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class InitialSchema1699999999001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'orgId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            default: "'MEMBER'",
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create lookups table
    await queryRunner.createTable(
      new Table({
        name: 'lookups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'orgId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'query',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'result',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['orgId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'lookups',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'lookups',
      new TableForeignKey({
        columnNames: ['orgId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      })
    );

    // Create check constraints
    await queryRunner.query(
      `ALTER TABLE users ADD CONSTRAINT check_users_role CHECK (role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'MEMBER'))`
    );

    await queryRunner.query(
      `ALTER TABLE lookups ADD CONSTRAINT check_lookups_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))`
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_org_id',
        columnNames: ['orgId'],
      })
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
      })
    );

    await queryRunner.createIndex(
      'lookups',
      new TableIndex({
        name: 'idx_lookups_user_id',
        columnNames: ['userId'],
      })
    );

    await queryRunner.createIndex(
      'lookups',
      new TableIndex({
        name: 'idx_lookups_org_id',
        columnNames: ['orgId'],
      })
    );

    await queryRunner.createIndex(
      'lookups',
      new TableIndex({
        name: 'idx_lookups_status',
        columnNames: ['status'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('lookups', 'idx_lookups_status');
    await queryRunner.dropIndex('lookups', 'idx_lookups_org_id');
    await queryRunner.dropIndex('lookups', 'idx_lookups_user_id');
    await queryRunner.dropIndex('users', 'idx_users_email');
    await queryRunner.dropIndex('users', 'idx_users_org_id');

    // Drop check constraints
    await queryRunner.query(`ALTER TABLE lookups DROP CONSTRAINT check_lookups_status`);
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT check_users_role`);

    // Drop foreign keys
    const lookupsTable = await queryRunner.getTable('lookups');
    if (lookupsTable) {
      const orgIdForeignKey = lookupsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('orgId') !== -1
      );
      if (orgIdForeignKey) {
        await queryRunner.dropForeignKey('lookups', orgIdForeignKey);
      }
      const userIdForeignKey = lookupsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1
      );
      if (userIdForeignKey) {
        await queryRunner.dropForeignKey('lookups', userIdForeignKey);
      }
    }

    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const orgIdForeignKey = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('orgId') !== -1
      );
      if (orgIdForeignKey) {
        await queryRunner.dropForeignKey('users', orgIdForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('lookups');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('organizations');
  }
}

