exports.up = function(knex) {
  return knex.schema.alterTable('treino_itens', function(table) {
    table.string('repeticoes').alter();
    // repeticoes vira texto porque o formato usado é "séries x repetições",
    // tipo "3x12", que não é um número puro
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('treino_itens', function(table) {
    table.integer('repeticoes').alter();
  });
};