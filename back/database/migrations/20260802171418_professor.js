exports.up = function(knex) {
    return knex.schema.createTable('professores', function(table) {
        table.increments('id').primary();
        // id auto incrementado

        table.string('nome').notNullable();
        table.string('email').notNullable().unique();
        // email não pode se repetir, é usado no login

        table.string('senha').notNullable();
        // senha sempre criptografada com bcrypt

        table.string('cref');
        // registro profissional do professor

        table.string('especialidade');

        table.timestamps(true, true);
        // created_at e updated_at automáticos
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('professores');
};