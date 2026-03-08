/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').notNullable().unique();
    table.string('senha').notNullable();
    table.date('data_nascimento');
    table.string('cpf', 11).unique();
    table.string('telefone');
    table.string('tipo_usuario'); // Ex: 'aluno', 'instrutor', 'admin'
    table.boolean('status').defaultTo(true);
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('usuarios');
};