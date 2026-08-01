require ('dotenv').config();
// estou deixando a chave do .env disponivel neste arquivo

const express = require('express');
// estou atribuindo a variavel express as funcionalidades do framework express
const cors = require ('cors');
// estou atribuindo as funcionalidades da biblioteca cors na variavel cors, responsavel por
// permitir o acesso do front end
const routes = express.Router();
// estou atribuindo a variavel routes as funcionalidades da ferramenta Router que se encontra
//no framework express
const app = express();
//estou atribuindo as funcionalidade do framework express na variavel app

const PORT = process.env.PORT || 3000;
// estou atribuindo a variavel PORT a porta logica que tenho no .env caso ela não
// funcione deixei a chave 3000 de reserva

app.use(cors());
// aqui peguei as funcionalidades do framework express contidas na variavel app e com o 
//comando use, iniciei os cors
app.use(express.json());
// aqui pus em uso o midware que fara a tradução do json para o express
app.use(routes);
// aqui pus com o comando app.use(routes), as funcionalidade da ferramenta Router para 
// rodar a resposta de quando meu servidor estiver online e tambem para usar futuramenta 
//para meu arquivo de rotas 

routes.get('/', (req,res)=>{
    res.json({mensagem: 'Servidor Funcionando..🚀' })
});
// aqui estou usando o routes par ler (GET) a mensagem Servidor Funcionando 🚀

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// aqui estou informando qual a porta logica meu servidor vai funcionar e com o comando 
// app.listen eu deixo ele rodando, caso não tivesse esse comando meu servidor não se 
// ficaria ligado 