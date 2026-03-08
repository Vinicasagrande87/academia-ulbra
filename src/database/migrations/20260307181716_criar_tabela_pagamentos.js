exports.up = function(knex) {
  return knex.schema.createTable('pagamentos', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable()
      .references('id').inTable('usuarios');
    table.integer('matricula_id').unsigned().notNullable()
      .references('id').inTable('matriculas');
    table.decimal('valor_pago', 10, 2).notNullable();
    table.timestamp('data_pagamento').defaultTo(knex.fn.now());
    table.string('metodo_pagamento');
    table.string('status_pagamento');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pagamentos');
};