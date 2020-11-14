import { MigrationInterface, QueryRunner } from 'typeorm';

export class FTSList1601414366451 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      UPDATE task set searchDocument = setweight(to_tsvector(title), 'A') || setweight(to_tsvector(coalesce(description, '')), 'B'); 

      CREATE INDEX searchDocument_idx ON task USING GIN (searchDocument);

      CREATE FUNCTION task_searchDocument_trigger() RETURNS trigger AS $$
      begin
        new.searchDocument :=
        setweight(to_tsvector(new.title), 'A')
        || setweight(to_tsvector(coalesce(new.description, '')), 'B');
        return new;
      end
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER task_searchDocument_update BEFORE INSERT OR UPDATE
      ON task FOR EACH ROW EXECUTE PROCEDURE task_searchDocument_trigger();

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
