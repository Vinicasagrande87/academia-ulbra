exports.up = function(knex) {
  return knex.schema.alterTable('pagamentos', function(table) {
    table.text('observacao');
    // campo livre pro staff anotar algo tipo "pago em 3x na maquininha"

    table.string('confirmado_por_nome');
    // nome de quem confirmou o pagamento, salvo como texto (não FK) —
    // admin e professor são tabelas separadas com ids independentes,
    // então uma FK aqui teria o mesmo problema que já corrigimos em treinos.professor_id

    table.date('data_pagamento').nullable().alter();
    // quando o aluno sinaliza intenção de pagamento (status "pendente"), ainda
    // não existe uma data de pagamento real — só quando o staff confirma
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('pagamentos', function(table) {
    table.dropColumn('observacao');
    table.dropColumn('confirmado_por_nome');
    table.date('data_pagamento').notNullable().alter();
  });
};