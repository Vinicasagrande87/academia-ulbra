exports.up = function(knex) {
    return knex.schema.createTable('treinos', function(table) {
        table.increments('id').primary();

        table.integer('aluno_id').unsigned().notNullable();
        table.foreign('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');
        // se o aluno for deletado, os treinos dele somem junto

        table.integer('professor_id').unsigned().notNullable();
        table.foreign('professor_id').references('id').inTable('professores');
        // não deixa deletar um professor que já montou treino (padrão RESTRICT)

        table.string('dia_semana').notNullable();
        // ex: segunda, terca, quarta, quinta, sexta

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('treinos');
};