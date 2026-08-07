exports.up = function(knex) {
  return knex.schema.alterTable('pagamentos', function(table) {
    table.date('valido_ate');
    // calculado automaticamente quando o pagamento é confirmado:
    // data_pagamento + duracao_dias do plano
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('pagamentos', function(table) {
    table.dropColumn('valido_ate');
  });
};