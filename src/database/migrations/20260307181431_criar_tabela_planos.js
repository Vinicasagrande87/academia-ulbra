exports.up = function(knex) {
  return knex.schema.createTable('planos', (table) => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.text('descricao');
    table.decimal('preco', 10, 2).notNullable();
    table.integer('duracao_meses').notNullable();
    table.boolean('status').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('planos');
};