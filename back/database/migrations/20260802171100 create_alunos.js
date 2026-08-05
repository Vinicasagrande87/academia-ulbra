exports.up = function(knex) {
    return knex.schema.createTable('alunos', function(table) {
        table.increments('id').primary();

        table.string('nome').notNullable();
        table.integer('idade');
        table.decimal('peso', 5, 2);
        table.decimal('altura', 4, 2);
        table.string('cpf').notNullable().unique();
        table.string('telefone');
        table.string('email').notNullable().unique();
        // email também é usado no login, por isso é único

        table.string('finalidade');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('alunos');
};