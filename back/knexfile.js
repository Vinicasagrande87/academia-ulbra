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

module.exports = {
  development: conexaoSupabase,
  production: conexaoSupabase
};