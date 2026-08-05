exports.up = function(knex) {
    return knex.schema.createTable('planos', function(table) {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.text('descricao');
        table.decimal('valor', 10, 2).notNullable();
        // valor com 2 casas decimais, ex: 129.90

        table.integer('duracao_dias').notNullable();
        // ex: 30 (mensal), 90 (trimestral), 365 (anual)

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('planos');
};