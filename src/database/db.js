// src/db.js
const knex = require('knex');
const config = require('./knexfile'); // Importa o arquivo que está na mesma pasta (src)

// Define o ambiente, buscando do seu .env ou assumindo 'development'
const environment = process.env.NODE_ENV || 'development';

// Inicializa a conexão com o PostgreSQL
const connection = knex(config[environment]);

/**
 * Exporta a conexão para realizar operações como:
 * await connection('alunos').insert({ nome: 'Vinícius' });
 */
module.exports = connection;