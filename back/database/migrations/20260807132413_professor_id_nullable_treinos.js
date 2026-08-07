exports.up = function(knex) {
  return knex.schema.alterTable('treinos', function(table) {
    table.integer('professor_id').nullable().alter();
    // permite treino sem professor vinculado, usado quando quem monta é admin
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('treinos', function(table) {
    table.integer('professor_id').notNullable().alter();
  });
};