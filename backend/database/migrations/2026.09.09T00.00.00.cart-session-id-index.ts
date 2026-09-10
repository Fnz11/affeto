import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('carts');
  if (hasTable) {
    const hasColumn = await knex.schema.hasColumn('carts', 'session_id');
    if (hasColumn) {
      await knex.schema.alterTable('carts', (table) => {
        table.index(['session_id'], 'carts_session_id_idx');
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('carts');
  if (hasTable) {
    await knex.schema.alterTable('carts', (table) => {
      table.dropIndex(['session_id'], 'carts_session_id_idx');
    });
  }
}
