exports.up = function(knex) {
    return knex.schema.createTable('exercicios', function(table) {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('video_url');
        // link do vídeo mostrando o movimento correto

        table.string('equipamento');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('exercicios');
};