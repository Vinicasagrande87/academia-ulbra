const knex = require('knex');
const configuration = require('../knexfile');

// como development e production agora apontam pro mesmo lugar (Supabase),
// não precisa mais escolher ambiente — sempre usa "development" mesmo,
// simples como sempre foi
const connection = knex(configuration.development);

module.exports = connection;