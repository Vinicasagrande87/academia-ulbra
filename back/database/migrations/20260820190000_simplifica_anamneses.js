// simplifica a anamnese: cada pergunta vira uma única resposta em texto
// livre (em vez de boolean + campo "qual" separado). A tabela ainda não
// tinha dado real de nenhum aluno, então recriar é seguro.

exports.up = async function(knex) {
    await knex.schema.dropTable('anamneses');

    await knex.schema.createTable('anamneses', function(table) {
        table.increments('id').primary();

        table.integer('aluno_id').unsigned().notNullable().unique();
        table.foreign('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');

        table.text('pratica_atividade_atualmente');
        table.text('praticou_atividade_anteriormente');
        table.text('problema_osteoarticular');
        table.text('problema_neuromuscular');
        table.text('problema_coronario');
        table.text('problema_vascular');
        table.text('hospitalizado_5_anos');
        table.text('cirurgia_5_anos');

        table.string('contato_emergencia_nome');
        table.string('contato_emergencia_telefone');
        table.string('contato_emergencia_parentesco');

        table.timestamps(true, true);
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTable('anamneses');

    await knex.schema.createTable('anamneses', function(table) {
        table.increments('id').primary();
        table.integer('aluno_id').unsigned().notNullable().unique();
        table.foreign('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');
        table.boolean('pratica_atividade_atualmente');
        table.string('pratica_atividade_atualmente_qual');
        table.boolean('praticou_atividade_anteriormente');
        table.string('praticou_atividade_anteriormente_qual');
        table.boolean('problema_osteoarticular');
        table.string('problema_osteoarticular_qual');
        table.boolean('problema_neuromuscular');
        table.string('problema_neuromuscular_qual');
        table.boolean('problema_coronario');
        table.string('problema_coronario_qual');
        table.boolean('problema_vascular');
        table.boolean('hospitalizado_5_anos');
        table.boolean('cirurgia_5_anos');
        table.string('contato_emergencia_nome');
        table.string('contato_emergencia_telefone');
        table.string('contato_emergencia_parentesco');
        table.timestamps(true, true);
    });
};
