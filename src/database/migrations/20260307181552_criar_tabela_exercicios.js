exports.up = function(knex) {
  return knex.schema.createTable('exercicios', (table) => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('grupo_muscular');
    table.text('descricao');
    table.string('video_url');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('exercicios');
};