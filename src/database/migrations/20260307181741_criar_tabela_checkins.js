exports.up = function(knex) {
  return knex.schema.createTable('checkins', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable()
      .references('id').inTable('usuarios').onDelete('CASCADE');
    table.timestamp('data_hora').defaultTo(knex.fn.now());
    table.text('observacao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('checkins');
};