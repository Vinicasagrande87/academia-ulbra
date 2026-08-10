const serverless = require('serverless-http');
const app = require('../server');
// reaproveita o mesmo app Express do server.js, sem duplicar nenhuma rota
// ou configuração — só embrulha ele no formato que o Vercel espera

module.exports = serverless(app);