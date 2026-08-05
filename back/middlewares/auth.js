const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
// função middleware: fica no meio do caminho entre a requisição e o controller,
// checando se o usuário está autenticado antes de deixar passar

    const authHeader = req.headers.authorization;
    // pega o header "Authorization" enviado na requisição

    if (!authHeader) {
    // se não veio nenhum token, bloqueia direto
        return res.status(401).json({ error: 'Token não informado.' });
    }

    const parts = authHeader.split(' ');
    // o header vem no formato "Bearer <token>", então separamos os dois pedaços

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
    // confere se a primeira parte realmente é a palavra "Bearer"
        return res.status(401).json({ error: 'Token mal formatado.' });
    }

    jwt.verify(token, authConfig.secret, (error, decoded) => {
    // valida o token com o mesmo segredo usado pra criar ele no login

        if (error) {
        // token inválido, adulterado ou expirado
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        req.userId = decoded.id;
        req.userType = decoded.tipo;
        // aqui é onde req.userId e req.userType (que os controllers usam) são preenchidos

        return next();
        // libera a requisição pra seguir até o controller
    });
};