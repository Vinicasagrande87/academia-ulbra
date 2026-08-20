exports.up = function(knex) {
    return knex.schema.createTable('anamneses', function(table) {
        table.increments('id').primary();

        table.integer('aluno_id').unsigned().notNullable().unique();
        table.foreign('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');
        // um aluno tem no máximo uma anamnese (upsert no controller)

        // GRUPO II - Atividade física
        table.boolean('pratica_atividade_atualmente');
        table.string('pratica_atividade_atualmente_qual');
        table.boolean('praticou_atividade_anteriormente');
        table.string('praticou_atividade_anteriormente_qual');

        // GRUPO III - Avaliação diagnóstica de doenças
        table.boolean('problema_osteoarticular');
        table.string('problema_osteoarticular_qual');
        table.boolean('problema_neuromuscular');
        table.string('problema_neuromuscular_qual');
        table.boolean('problema_coronario');
        table.string('problema_coronario_qual');
        table.boolean('problema_vascular');
        table.boolean('hospitalizado_5_anos');
        table.boolean('cirurgia_5_anos');

        // Contato de emergência (pedido à parte pelos professores)
        table.string('contato_emergencia_nome');
        table.string('contato_emergencia_telefone');
        table.string('contato_emergencia_parentesco');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('anamneses');
};
