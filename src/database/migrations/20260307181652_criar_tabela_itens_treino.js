exports.up = function(knex) {
  return knex.schema.createTable('itens_treino', (table) => {
    table.increments('id').primary();
    table.integer('treino_id').unsigned().notNullable()
      .references('id').inTable('treinos').onDelete('CASCADE');
    table.integer('exercicio_id').unsigned().notNullable()
      .references('id').inTable('exercicios');
    table.integer('series').notNullable();
    table.string('repeticoes');
    table.string('carga');
    table.integer('descanso_segundos');
    table.integer('ordem_execucao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('itens_treino');
};