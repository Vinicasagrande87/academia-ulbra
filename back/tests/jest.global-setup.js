// roda uma vez, antes de toda a suíte de testes: garante que o banco de
// teste está com o schema em dia (aplica migrations pendentes). Usa sua
// própria conexão knex, separada da que os testes/app usam depois.

require('dotenv').config();
const knex = require('knex');
const configuration = require('../knexfile');

module.exports = async () => {
    if (!process.env.TEST_DATABASE_URL) {
        throw new Error(
            'TEST_DATABASE_URL não configurada no .env — crie um projeto Supabase separado só pra testes e configure essa variável antes de rodar "npm test".'
        );
    }

    const connection = knex(configuration.test);
    await connection.migrate.latest();
    await connection.destroy();
};
