require ('dotenv').config();
// estou deixando a chave do .env disponivel neste arquivo

const express = require('express');
// estou atribuindo a variavel express as funcionalidades do framework express
const cors = require ('cors');
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

const PORT = process.env.PORT || 3000;
// estou atribuindo a variavel PORT a porta logica que tenho no .env caso ela não
// funcione deixei a chave 3000 de reserva

app.use(helmet());
// aplica os headers de segurança em todas as respostas

app.use(cors({
    origin: process.env.FRONT_URL
    // libera acesso só pro domínio do seu front, configurado no .env
    // em desenvolvimento, coloque algo como http://localhost:4200 (porta padrão do Angular)
}));
// aqui peguei as funcionalidades do framework express contidas na variavel app e com o
//comando use, iniciei os cors, agora restrito só ao front autorizado

app.use(express.json());
// aqui pus em uso o midware que fara a tradução do json para o express

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    // janela de 15 minutos
    max: 10,
    // no máximo 10 tentativas de login por IP dentro dessa janela
    message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

app.use('/login', loginLimiter);
// aplica o limite só na rota de login, que é o alvo mais comum de ataque de força bruta

app.use(routes);
// aqui pus com o comando app.use(routes), as funcionalidade da ferramenta Router para
// rodar a resposta de quando meu servidor estiver online e tambem para usar futuramenta
//para meu arquivo de rotas

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// aqui estou informando qual a porta logica meu servidor vai funcionar e com o comando
// app.listen eu deixo ele rodando, caso não tivesse esse comando meu servidor não se
// ficaria ligado