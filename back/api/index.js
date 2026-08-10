module.exports = require('../server');
// um app Express já é, por natureza, uma função (req, res) => void — o
// próprio formato que o runtime Node do Vercel espera. Não precisa de
// nenhum "tradutor" no meio (o serverless-http era pra AWS Lambda, que
// tem um formato de função bem diferente, e estava travando as respostas)