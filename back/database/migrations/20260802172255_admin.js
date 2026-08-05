exports.up = function(knex) {
    return knex.schema.createTable('admins', function(table) {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('email').notNullable().unique();
        table.string('senha').notNullable();
        // senha sempre criptografada com bcrypt

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('admins');
};