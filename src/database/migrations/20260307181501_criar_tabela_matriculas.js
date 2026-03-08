exports.up = function(knex) {
  return knex.schema.createTable('matriculas', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable()
      .references('id').inTable('usuarios').onDelete('CASCADE');
    table.integer('plano_id').unsigned().notNullable()
      .references('id').inTable('planos');
    table.date('data_inicio').notNullable();
    table.date('data_fim');
    table.string('status').defaultTo('ativa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('matriculas');
};