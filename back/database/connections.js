const knex = require('knex');
const configuration = require('../knexfile');

// development e production apontam pro mesmo Supabase (simples como sempre
// foi); só quando os testes automatizados rodam (NODE_ENV=test) é que a
// conexão troca pro banco de teste separado, pra nunca escrever em dado real
const ambiente = process.env.NODE_ENV === 'test' ? 'test' : 'development';
const connection = knex(configuration[ambiente]);

module.exports = connection;