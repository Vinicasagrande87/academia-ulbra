const path = require('path');

// Agora o .env está uma pasta acima (em /src), então usamos '..'
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      // Como o knexfile está em /database, as migrations estão na pasta ao lado
      directory: path.resolve(__dirname, 'migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, 'seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: path.resolve(__dirname, 'migrations')
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};