const express = require('express');
const routes = express.Router();

const authMiddleware = require('./middlewares/auth');
// middleware que confere o token e preenche req.userId / req.userType

const { validarCampos } = require('./middlewares/validacao');
// middleware que confere os campos do body antes de chegar no controller

const alunoController = require('./controllers/alunocontroller');
const professorController = require('./controllers/professorcontroller');
const exercicioController = require('./controllers/exerciciocontroller');
const treinoController = require('./controllers/treinocontroller');
const loginController = require('./controllers/logincontroller');
const planoController = require('./controllers/planocontroller');
const pagamentoController = require('./controllers/pagamentocontroller');
const workoutxController = require('./controllers/workoutxcontroller');
// NOVO: integração com o catálogo de gifs do WorkoutX
const anamneseController = require('./controllers/anamnesecontroller');

routes.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor Funcionando..🚀' });
});

// login (pública, é ela que gera o token)
routes.post('/login', validarCampos({
    email: { obrigatorio: true, tipo: 'email' },
    senha: { obrigatorio: true }
}), loginController.create);

// aluno
routes.post('/alunos', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    idade: { obrigatorio: true, tipo: 'numero' },
    peso: { obrigatorio: true, tipo: 'numero' },
    altura: { obrigatorio: true, tipo: 'numero' },
    cpf: { obrigatorio: true, tipo: 'cpf' },
    telefone: { obrigatorio: true },
    email: { obrigatorio: true, tipo: 'email' },
    senha: { obrigatorio: true, minLength: 6 },
    finalidade: { obrigatorio: true }
}), alunoController.create);
// exige token: só admin/professor cadastram aluno (checagem dentro do controller)
routes.get('/alunos', authMiddleware, alunoController.index);
// lista todos os alunos, só admin/professor (checagem dentro do controller)
routes.get('/alunos/perfil', authMiddleware, alunoController.perfil);
// aluno vê os próprios dados cadastrais (tela "Meu Perfil")
routes.get('/alunos/treino', authMiddleware, alunoController.treino);
routes.put('/alunos', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    email: { obrigatorio: true, tipo: 'email' },
    cpf: { obrigatorio: true, tipo: 'cpf' }
}), alunoController.update);
routes.delete('/alunos', authMiddleware, alunoController.delete);

// professor
routes.post('/professores', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    email: { obrigatorio: true, tipo: 'email' },
    senha: { obrigatorio: true, minLength: 6 }
}), professorController.create);
// só o admin consegue passar (checagem de tipoUsuario dentro do controller)
routes.get('/professores', authMiddleware, professorController.index);
routes.put('/professores', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    email: { obrigatorio: true, tipo: 'email' }
}), professorController.update);
// professor edita a si mesmo (sem :id)
routes.put('/professores/:id', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    email: { obrigatorio: true, tipo: 'email' }
}), professorController.update);
// admin edita qualquer professor pelo id (checagem dentro do controller)
routes.delete('/professores/:id', authMiddleware, professorController.delete);

// exercícios (catálogo do admin)
routes.post('/exercicios', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    grupo_muscular: { obrigatorio: true }
}), exercicioController.create);
routes.get('/exercicios', authMiddleware, exercicioController.index);
routes.put('/exercicios/:id', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    grupo_muscular: { obrigatorio: true }
}), exercicioController.update);
routes.delete('/exercicios/:id', authMiddleware, exercicioController.delete);

// treinos (montados pelo professor)
routes.post('/treinos', authMiddleware, validarCampos({
    aluno_id: { obrigatorio: true, tipo: 'numero' },
    dia_semana: { obrigatorio: true }
}), treinoController.create);
routes.get('/treinos', authMiddleware, treinoController.index);
routes.put('/treinos/:id', authMiddleware, validarCampos({
    dia_semana: { obrigatorio: true }
}), treinoController.update);
routes.delete('/treinos/:id', authMiddleware, treinoController.delete);

// planos
routes.post('/planos', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    valor: { obrigatorio: true, tipo: 'numero' },
    duracao_dias: { obrigatorio: true, tipo: 'numero' }
}), planoController.create);
routes.get('/planos', planoController.index);
// listagem de planos é pública, pra um futuro aluno ver preços antes de se cadastrar
routes.put('/planos/:id', authMiddleware, validarCampos({
    nome: { obrigatorio: true },
    valor: { obrigatorio: true, tipo: 'numero' },
    duracao_dias: { obrigatorio: true, tipo: 'numero' }
}), planoController.update);
routes.delete('/planos/:id', authMiddleware, planoController.delete);

// pagamentos
routes.post('/pagamentos', authMiddleware, validarCampos({
    plano_id: { obrigatorio: true, tipo: 'numero' }
}), pagamentoController.create);
// os demais campos (aluno_id, valor, forma_pagamento, etc) variam conforme
// quem está criando (aluno vs staff) — essa checagem mais fina continua
// dentro do próprio pagamentocontroller, só o plano_id é comum aos dois casos
routes.get('/pagamentos', authMiddleware, pagamentoController.index);
routes.put('/pagamentos/:id', authMiddleware, pagamentoController.update);
routes.delete('/pagamentos/:id', authMiddleware, pagamentoController.delete);

// integração WorkoutX (catálogo de gifs de exercícios) — a chave de API
// fica só no backend, nunca é exposta ao navegador
routes.get('/workoutx/search', authMiddleware, workoutxController.search);
// admin busca no catálogo do WorkoutX pelo nome, pra achar o gif certo
routes.get('/workoutx/gif/:id', workoutxController.gif);
// espelha o gif do WorkoutX sem expor a chave — usado direto no <img> do front

// anamnese (ficha de saúde do aluno) — só professor/admin, nunca o próprio aluno
routes.get('/anamnese/:alunoId', authMiddleware, anamneseController.mostrar);
routes.put('/anamnese/:alunoId', authMiddleware, anamneseController.salvar);

module.exports = routes;