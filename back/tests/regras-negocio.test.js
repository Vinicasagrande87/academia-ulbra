// testes de integração das regras de negócio documentadas no README.
// Rodam contra um banco de testes separado (TEST_DATABASE_URL) -- nunca
// contra o banco de produção. Ver back/tests/helpers.js pros fixtures.

const request = require('supertest');
const app = require('../server');
const {
    token,
    criarAluno,
    criarProfessor,
    criarAdmin,
    criarPlano,
    criarPagamentoConfirmado,
    connection
} = require('./helpers');

afterAll(async () => {
    await connection.destroy();
});

describe('plano ativo controla o acesso aos treinos', () => {

    test('professor não consegue montar treino novo pra aluno sem plano ativo', async () => {
        const professorId = await criarProfessor();
        const alunoId = await criarAluno();

        const resposta = await request(app)
            .post('/treinos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, dia_semana: 'Segunda-feira' });

        expect(resposta.status).toBe(403);
    });

    test('professor consegue montar treino novo pra aluno com plano ativo', async () => {
        const professorId = await criarProfessor();
        const alunoId = await criarAluno();
        const planoId = await criarPlano();
        await criarPagamentoConfirmado(alunoId, planoId, 30);

        const resposta = await request(app)
            .post('/treinos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, dia_semana: 'Segunda-feira' });

        expect(resposta.status).toBe(201);
    });

    test('professor consegue editar um treino existente mesmo com o plano do aluno vencido', async () => {
        const professorId = await criarProfessor();
        const alunoId = await criarAluno();
        const planoId = await criarPlano();
        await criarPagamentoConfirmado(alunoId, planoId, 30);

        const criado = await request(app)
            .post('/treinos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, dia_semana: 'Terça-feira' });

        // agora o plano vence (simula o passar do tempo atualizando valido_ate direto)
        await connection('pagamentos').where('aluno_id', alunoId).update({
            valido_ate: '2000-01-01'
        });

        const resposta = await request(app)
            .put(`/treinos/${criado.body.treino_id}`)
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ dia_semana: 'Quarta-feira' });

        expect(resposta.status).toBe(200);
    });

    test('aluno não consegue ver os treinos quando o plano venceu', async () => {
        const alunoId = await criarAluno();
        const professorId = await criarProfessor();
        const planoId = await criarPlano();
        await criarPagamentoConfirmado(alunoId, planoId, 30);

        await request(app)
            .post('/treinos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, dia_semana: 'Quinta-feira' });

        await connection('pagamentos').where('aluno_id', alunoId).update({ valido_ate: '2000-01-01' });

        const resposta = await request(app)
            .get('/alunos/treino')
            .set('Authorization', `Bearer ${token(alunoId, 'aluno')}`);

        expect(resposta.status).toBe(403);
        expect(resposta.body.codigo).toBe('PLANO_INATIVO');
    });

    test('aluno consegue ver os treinos quando o plano está ativo', async () => {
        const alunoId = await criarAluno();
        const professorId = await criarProfessor();
        const planoId = await criarPlano();
        await criarPagamentoConfirmado(alunoId, planoId, 30);

        await request(app)
            .post('/treinos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({
                aluno_id: alunoId,
                dia_semana: 'Sexta-feira',
                exercicios: []
            });

        const resposta = await request(app)
            .get('/alunos/treino')
            .set('Authorization', `Bearer ${token(alunoId, 'aluno')}`);

        // sem exercícios vinculados, a rota responde 404 (nenhum treino COM
        // exercícios) -- o importante aqui é que NÃO seja o bloqueio 403
        expect(resposta.status).not.toBe(403);
    });
});

describe('plano sem duração fixa (duracao_dias = 0)', () => {

    test('confirmar pagamento de um plano com duracao_dias=0 não deixa valido_ate nulo', async () => {
        const alunoId = await criarAluno();
        const adminId = await criarAdmin();
        const planoId = await criarPlano({ duracao_dias: 0 });

        const [{ id: pagamentoId }] = await connection('pagamentos').insert({
            aluno_id: alunoId,
            plano_id: planoId,
            valor: 100,
            forma_pagamento: 'pix',
            status: 'pendente'
        }).returning('id');

        const resposta = await request(app)
            .put(`/pagamentos/${pagamentoId}`)
            .set('Authorization', `Bearer ${token(adminId, 'admin')}`)
            .send({ status: 'confirmado' });

        expect(resposta.status).toBe(200);

        const pagamento = await connection('pagamentos').where('id', pagamentoId).first();
        expect(pagamento.valido_ate).not.toBeNull();
    });
});

describe('valor do pagamento', () => {

    test('aluno solicitando plano usa sempre o valor cadastrado do plano, ignora valor enviado', async () => {
        const alunoId = await criarAluno();
        const planoId = await criarPlano({ valor: 150 });

        const resposta = await request(app)
            .post('/pagamentos')
            .set('Authorization', `Bearer ${token(alunoId, 'aluno')}`)
            .send({ plano_id: planoId, forma_pagamento: 'pix', valor: 1 });
        // "valor: 1" no body não deveria ter efeito nenhum

        expect(resposta.status).toBe(201);

        const pagamento = await connection('pagamentos').where('id', resposta.body.id).first();
        expect(Number(pagamento.valor)).toBe(150);
    });

    test('staff pode ajustar o valor manualmente (ex: desconto) ao registrar pagamento direto', async () => {
        const alunoId = await criarAluno();
        const professorId = await criarProfessor();
        const planoId = await criarPlano({ valor: 150 });

        const resposta = await request(app)
            .post('/pagamentos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, plano_id: planoId, valor: 90, forma_pagamento: 'dinheiro' });

        expect(resposta.status).toBe(201);

        const pagamento = await connection('pagamentos').where('id', resposta.body.id).first();
        expect(Number(pagamento.valor)).toBe(90);
    });

    test('staff não consegue registrar pagamento com valor zero ou negativo', async () => {
        const alunoId = await criarAluno();
        const professorId = await criarProfessor();
        const planoId = await criarPlano();

        const resposta = await request(app)
            .post('/pagamentos')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`)
            .send({ aluno_id: alunoId, plano_id: planoId, valor: -50, forma_pagamento: 'pix' });

        expect(resposta.status).toBe(400);
    });
});

describe('permissão isolada por papel', () => {

    test('professor não consegue listar outros professores (rota exclusiva de admin)', async () => {
        const professorId = await criarProfessor();

        const resposta = await request(app)
            .get('/professores')
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`);

        expect(resposta.status).toBe(403);
    });

    test('admin consegue listar professores', async () => {
        const adminId = await criarAdmin();

        const resposta = await request(app)
            .get('/professores')
            .set('Authorization', `Bearer ${token(adminId, 'admin')}`);

        expect(resposta.status).toBe(200);
    });

    test('sem token, qualquer rota protegida responde 401', async () => {
        const resposta = await request(app).get('/professores');
        expect(resposta.status).toBe(401);
    });
});

describe('anamnese é dado restrito', () => {

    test('aluno não consegue acessar a própria anamnese pela API', async () => {
        const alunoId = await criarAluno();

        const resposta = await request(app)
            .get(`/anamnese/${alunoId}`)
            .set('Authorization', `Bearer ${token(alunoId, 'aluno')}`);

        expect(resposta.status).toBe(403);
    });

    test('professor consegue ler a anamnese de um aluno', async () => {
        const alunoId = await criarAluno();
        const professorId = await criarProfessor();

        const resposta = await request(app)
            .get(`/anamnese/${alunoId}`)
            .set('Authorization', `Bearer ${token(professorId, 'professor')}`);

        expect(resposta.status).toBe(200);
    });
});
