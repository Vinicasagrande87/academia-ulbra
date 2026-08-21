require('dotenv').config();

// agora só existe um banco de verdade: o do Supabase. Tanto rodando local
// quanto em produção, sempre usa a mesma conexão — sem confusão de qual
// ambiente está apontando pra onde
const conexaoSupabase = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
    // Supabase exige conexão criptografada; rejectUnauthorized: false
    // evita erro de certificado autoassinado
  },
  migrations: {
    directory: './database/migrations'
  }
};

const conexaoTeste = {
  client: 'pg',
  connection: {
    connectionString: process.env.TEST_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  },
  migrations: {
    directory: './database/migrations'
  }
};
// banco separado (outro projeto Supabase) usado só pelos testes
// automatizados, pra nunca escrever/apagar dado real de aluno

module.exports = {
  development: conexaoSupabase,
  production: conexaoSupabase,
  test: conexaoTeste
};