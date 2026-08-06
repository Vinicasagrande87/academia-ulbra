const express = require('express');
const routes = express.Router();

const authMiddleware = require('./middlewares/auth');
// middleware que confere o token e preenche req.userId / req.userType

const alunoController = require('./controllers/alunocontroller');
const professorController = require('./controllers/professorcontroller');
const exercicioController = require('./controllers/exerciciocontroller');
const treinoController = require('./controllers/treinocontroller');
const loginController = require('./controllers/logincontroller');
const planoController = require('./controllers/planocontroller');
const pagamentoController = require('./controllers/pagamentocontroller');

routes.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor Funcionando..🚀' });
});

// login (pública, é ela que gera o token)
routes.post('/login', loginController.create);

// aluno
routes.post('/alunos', authMiddleware, alunoController.create);
// exige token: só admin/professor cadastram aluno (checagem dentro do controller)
routes.get('/alunos', authMiddleware, alunoController.index);
// lista todos os alunos, só admin/professor (checagem dentro do controller)
routes.get('/alunos/perfil', authMiddleware, alunoController.perfil);
// aluno vê os próprios dados cadastrais (tela "Meu Perfil")
routes.get('/alunos/treino', authMiddleware, alunoController.treino);
routes.put('/alunos', authMiddleware, alunoController.update);
routes.delete('/alunos', authMiddleware, alunoController.delete);

// professor
routes.post('/professores', authMiddleware, professorController.create);
// só o admin consegue passar (checagem de tipoUsuario dentro do controller)
routes.get('/professores', authMiddleware, professorController.index);
routes.put('/professores', authMiddleware, professorController.update);
routes.delete('/professores/:id', authMiddleware, professorController.delete);

// exercícios (catálogo do admin)
routes.post('/exercicios', authMiddleware, exercicioController.create);
routes.get('/exercicios', authMiddleware, exercicioController.index);
routes.put('/exercicios/:id', authMiddleware, exercicioController.update);
routes.delete('/exercicios/:id', authMiddleware, exercicioController.delete);

// treinos (montados pelo professor)
routes.post('/treinos', authMiddleware, treinoController.create);
routes.get('/treinos', authMiddleware, treinoController.index);
routes.put('/treinos/:id', authMiddleware, treinoController.update);
routes.delete('/treinos/:id', authMiddleware, treinoController.delete);

// planos
routes.post('/planos', authMiddleware, planoController.create);
routes.get('/planos', planoController.index);
// listagem de planos é pública, pra um futuro aluno ver preços antes de se cadastrar
routes.put('/planos/:id', authMiddleware, planoController.update);
routes.delete('/planos/:id', authMiddleware, planoController.delete);

// pagamentos
routes.post('/pagamentos', authMiddleware, pagamentoController.create);
routes.get('/pagamentos', authMiddleware, pagamentoController.index);
routes.put('/pagamentos/:id', authMiddleware, pagamentoController.update);
routes.delete('/pagamentos/:id', authMiddleware, pagamentoController.delete);

module.exports = routes;