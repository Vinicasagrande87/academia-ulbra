exports.up = function(knex) {
  return knex.schema.createTable('treinos', (table) => {
    table.increments('id').primary();
    table.integer('aluno_id').unsigned().notNullable()
      .references('id').inTable('usuarios').onDelete('CASCADE');
    table.integer('instrutor_id').unsigned().notNullable()
      .references('id').inTable('usuarios');
    table.string('nome').notNullable();
    table.string('objetivo');
    table.timestamp('data_criacao').defaultTo(knex.fn.now());
    table.boolean('status').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('treinos');
};