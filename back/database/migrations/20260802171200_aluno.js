exports.up = function(knex) {
    // adiciona a coluna senha na tabela alunos que já existe
    return knex.schema.alterTable('alunos', function(table) {
        table.string('senha').notNullable();
        // senha vai sempre chegar aqui já criptografada pelo controller (bcrypt)
    });
};

exports.down = function(knex) {
    // reverte a alteração, removendo a coluna
    return knex.schema.alterTable('alunos', function(table) {
        table.dropColumn('senha');
    });
};