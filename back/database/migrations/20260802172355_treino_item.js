exports.up = function(knex) {
    return knex.schema.createTable('treino_itens', function(table) {
        table.increments('id').primary();

        table.integer('treino_id').unsigned().notNullable();
        table.foreign('treino_id').references('id').inTable('treinos').onDelete('CASCADE');
        // se o treino for deletado, os itens dele somem junto (é o que o
        // treinocontroller.delete já faz manualmente, mas deixamos o cascade
        // como segurança extra do banco)

        table.integer('exercicio_id').unsigned().notNullable();
        table.foreign('exercicio_id').references('id').inTable('exercicios');
        // não deixa deletar um exercício que já está sendo usado em algum treino

        table.integer('carga');
        // carga específica daquele aluno naquele treino (não é fixa no exercício)

        table.integer('repeticoes');
        table.integer('ordem');
        // ordem de execução dentro do treino do dia

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('treino_itens');
};