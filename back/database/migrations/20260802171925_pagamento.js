exports.up = function(knex) {
    return knex.schema.createTable('pagamentos', function(table) {
        table.increments('id').primary();

        table.integer('aluno_id').unsigned().notNullable();
        table.foreign('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');
        // se o aluno for deletado, os pagamentos dele somem junto

        table.integer('plano_id').unsigned().notNullable();
        table.foreign('plano_id').references('id').inTable('planos');
        // não deixa deletar um plano que já tem pagamento vinculado (padrão RESTRICT)

        table.decimal('valor', 10, 2).notNullable();
        table.string('forma_pagamento');
        // ex: pix, cartão, dinheiro

        table.date('data_pagamento').notNullable();
        table.string('status').notNullable().defaultTo('confirmado');
        // ex: confirmado, pendente, estornado

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pagamentos');
};