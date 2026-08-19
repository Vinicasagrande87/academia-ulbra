exports.up = function(knex) {
  return knex.schema.table('exercicios', function(table) {
    table.string('workoutx_id');
    // guarda só o ID do exercício no catálogo do WorkoutX (ex: "0289"),
    // nunca a URL com a chave de API dentro
  });
};

exports.down = function(knex) {
  return knex.schema.table('exercicios', function(table) {
    table.dropColumn('workoutx_id');
  });
};