require('dotenv').config();
// estou deixando a chave do .env disponivel neste arquivo

const express = require('express');
// estou atribuindo a variavel express as funcionalidades do framework express
const cors = require('cors');
// estou atribuindo as funcionalidades da biblioteca cors na variavel cors, responsavel por
// permitir o acesso do front end
const helmet = require('helmet');
// adiciona uma série de headers HTTP de segurança de forma automática
const rateLimit = require('express-rate-limit');
// limita quantas requisições um mesmo IP pode fazer, protege contra força bruta

const routes = require('./routes');
// agora importando o arquivo de rotas de verdade, com todos os endpoints do sistema

const app = express();
//estou atribuindo as funcionalidade do framework express na variavel app

app.use(helmet());
// aplica os headers de segurança em todas as respostas

const origensPermitidas = (process.env.FRONT_URL || '')
    .split(',')
    .map(origem => origem.trim())
    .filter(Boolean);
// FRONT_URL agora aceita várias origens separadas por vírgula (ex: front local +
// front publicado no Vercel + o app nativo), já que em produção o front não
// roda mais só em um lugar único como no desenvolvimento

app.use(cors({
    origin: function (origin, callback) {
        // requisições sem "origin" (como chamadas vindas do app nativo em
        // alguns casos, ou ferramentas tipo Thunder Client) são liberadas
        if (!origin || origensPermitidas.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Não permitido pelo CORS'));
    }
}));

app.use(express.json());
// aqui pus em uso o midware que fara a tradução do json para o express

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    // janela de 15 minutos
    max: 10,
    // no máximo 10 tentativas de login por IP dentro dessa janela
    message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

// reativado: só fica DESLIGADO quando NODE_ENV é "development" (rodando
// local com "node server.js" / "npm run dev"), pra não atrapalhar seus
// testes manuais de login. Em produção (Vercel seta NODE_ENV=production
// automaticamente) o limite fica sempre ativo.
if (process.env.NODE_ENV !== 'development') {
    app.use('/login', loginLimiter);
}

app.use(routes);
// aqui pus com o comando app.use(routes), as funcionalidade da ferramenta Router para
// rodar a resposta de quando meu servidor estiver online e tambem para usar futuramenta
//para meu arquivo de rotas

// handler de erro global — pega qualquer erro que escape dos try/catch dos
// controllers (ex: o erro de CORS lançado no callback acima) e responde de
// forma padronizada, sem vazar stack trace pro cliente
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro interno no servidor.' });
});

if (require.main === module) {
    // só sobe o servidor "tradicional" (app.listen) quando este arquivo é
    // executado diretamente (ex: "node server.js" no seu computador). No
    // Vercel, quem chama esse app é o arquivo api/index.js, de outro jeito
    // (sem app.listen, porque lá funciona como função serverless)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
// exporta o app pra poder ser reaproveitado pelo Vercel (api/index.js)