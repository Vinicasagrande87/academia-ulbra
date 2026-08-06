exports.up = function(knex) {
  return knex.schema.table('exercicios', function(table) {
    table.string('grupo_muscular').defaultTo('Geral');
  });
};

exports.down = function(knex) {
  return knex.schema.table('exercicios', function(table) {
    table.dropColumn('grupo_muscular');
  });
};