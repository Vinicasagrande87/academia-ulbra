// funções auxiliares pra criar dados de teste diretamente no banco
// (mais rápido que passar pelas rotas HTTP quando o que se quer testar
// é outra coisa) e gerar tokens JWT válidos sem precisar logar de verdade

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const connection = require('../database/connections');

function sufixo() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function token(id, tipo) {
    return jwt.sign({ id, tipo }, authConfig.secret, { expiresIn: '1h' });
}

async function criarAluno(overrides = {}) {
    const s = sufixo();
    const [{ id }] = await connection('alunos').insert({
        nome: 'Teste Aluno ' + s,
        idade: 25,
        peso: 70,
        altura: 1.75,
        cpf: String(Math.floor(10000000000 + Math.random() * 89999999999)),
        telefone: '51999999999',
        email: `aluno.${s}@teste.com`,
        senha: await bcrypt.hash('senha123', 4),
        finalidade: 'hipertrofia',
        ...overrides
    }).returning('id');
    return id;
}

async function criarProfessor(overrides = {}) {
    const s = sufixo();
    const [{ id }] = await connection('professores').insert({
        nome: 'Teste Professor ' + s,
        email: `professor.${s}@teste.com`,
        senha: await bcrypt.hash('senha123', 4),
        ...overrides
    }).returning('id');
    return id;
}

async function criarAdmin(overrides = {}) {
    const s = sufixo();
    const [{ id }] = await connection('admins').insert({
        nome: 'Teste Admin ' + s,
        email: `admin.${s}@teste.com`,
        senha: await bcrypt.hash('senha123', 4),
        ...overrides
    }).returning('id');
    return id;
}

async function criarPlano(overrides = {}) {
    const [{ id }] = await connection('planos').insert({
        nome: 'Plano Teste ' + sufixo(),
        valor: 100,
        duracao_dias: 30,
        ...overrides
    }).returning('id');
    return id;
}

async function criarExercicio(overrides = {}) {
    const [{ id }] = await connection('exercicios').insert({
        nome: 'Exercício Teste ' + sufixo(),
        grupo_muscular: 'Peito',
        ...overrides
    }).returning('id');
    return id;
}

// cria um pagamento já confirmado, com valido_ate calculado a partir de
// quantos dias de validade a partir de hoje (negativo = já vencido)
async function criarPagamentoConfirmado(alunoId, planoId, diasValidade = 30) {
    const hoje = new Date();
    const validoAte = new Date(hoje);
    validoAte.setDate(validoAte.getDate() + diasValidade);

    const [{ id }] = await connection('pagamentos').insert({
        aluno_id: alunoId,
        plano_id: planoId,
        valor: 100,
        forma_pagamento: 'pix',
        data_pagamento: hoje,
        valido_ate: validoAte,
        status: 'confirmado',
        confirmado_por_nome: 'Teste'
    }).returning('id');
    return id;
}

module.exports = {
    token,
    criarAluno,
    criarProfessor,
    criarAdmin,
    criarPlano,
    criarExercicio,
    criarPagamentoConfirmado,
    connection
};
