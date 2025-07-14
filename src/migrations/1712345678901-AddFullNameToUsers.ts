import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullNameToUsers1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add nullable column
    await queryRunner.query(
      `ALTER TABLE "users" ADD "fullName" character varying(100)`,
    );

    // 2. Set values for existing records (example uses first+last name)
    await queryRunner.query(`
            UPDATE "users" 
            SET "fullName" = COALESCE("firstName" || ' ' || "lastName", 'Unknown User')
        `);

    // 3. Add NOT NULL constraint
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "fullName" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
  }
}
