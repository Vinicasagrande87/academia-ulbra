const connection = require('../database/connections');

module.exports = {

    async create (req, res){
    // dois casos possíveis:
    // 1) o próprio aluno sinaliza intenção de pagamento (fica "pendente")
    // 2) admin/professor já registra um pagamento direto, já confirmado
    //    (ex: aluno pagou na recepção e o funcionário lança na hora)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario === 'aluno') {
                const { plano_id, forma_pagamento } = req.body;
                const aluno_id = req.userId;
                // nunca confia no aluno_id vindo do corpo da requisição — o aluno
                // só pode criar solicitação pra si mesmo

                const plano = await connection('planos').where('id', plano_id).first();

                if (!plano) {
                    return res.status(404).json({ error: 'Plano não encontrado.' });
                }

                const [{ id }] = await connection('pagamentos').insert({
                    aluno_id,
                    plano_id,
                    valor: plano.valor,
                    // o valor vem do plano no banco, não do que o front mandar,
                    // pra ninguém conseguir manipular o preço
                    forma_pagamento,
                    data_pagamento: null,
                    valido_ate: null,
                    status: 'pendente'
                }).returning('id');

                return res.status(201).json({ id, message: 'Solicitação de pagamento registrada. Aguarde a confirmação.' });

            } else if (tipoUsuario === 'admin' || tipoUsuario === 'professor') {
                // aqui o "valor" continua vindo direto do body (decisão de negócio):
                // staff pode ajustar/dar desconto na hora de registrar o pagamento,
                // diferente do fluxo do aluno, que sempre usa o valor do plano
                const { aluno_id, plano_id, valor, forma_pagamento, data_pagamento, observacao } = req.body;

                if (!aluno_id || valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) <= 0) {
                    return res.status(400).json({ error: 'Informe o aluno e um valor válido para o pagamento.' });
                }

                const plano = await connection('planos').where('id', plano_id).first();

                if (!plano) {
                    return res.status(404).json({ error: 'Plano não encontrado.' });
                }

                const confirmado_por_nome = await buscarNomeStaff(tipoUsuario, req.userId);
                const dataPagamentoFinal = data_pagamento ? new Date(data_pagamento) : new Date();
                const validoAte = calcularValidade(dataPagamentoFinal, plano.duracao_dias);

                const [{ id }] = await connection('pagamentos').insert({
                    aluno_id,
                    plano_id,
                    valor,
                    forma_pagamento,
                    data_pagamento: dataPagamentoFinal,
                    valido_ate: validoAte,
                    status: 'confirmado',
                    confirmado_por_nome,
                    observacao
                }).returning('id');

                return res.status(201).json({ id, message: 'Pagamento registrado com sucesso!' });

            } else {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
        }
    },

    async index (req, res){
    // lista os pagamentos, já com o nome do aluno e do plano pra facilitar
    // a exibição na tela, sem o front precisar cruzar os dados sozinho
        try {
            const tipoUsuario = req.userType;
            const { aluno_id, status, page, limit } = req.query;

            const montarQueryBase = () => {
                let query = connection('pagamentos')
                    .join('alunos', 'alunos.id', '=', 'pagamentos.aluno_id')
                    .join('planos', 'planos.id', '=', 'pagamentos.plano_id');

                if (tipoUsuario === 'aluno') {
                // aluno só pode ver os próprios pagamentos, nunca de outro aluno
                    query = query.where('pagamentos.aluno_id', req.userId);
                } else if (tipoUsuario === 'admin' || tipoUsuario === 'professor') {
                    if (aluno_id) {
                        query = query.where('pagamentos.aluno_id', aluno_id);
                    }
                } else {
                    return null;
                }

                if (status) {
                // usado pela tela do staff pra filtrar só os pendentes, por exemplo
                    query = query.where('pagamentos.status', status);
                }

                return query;
            };

            const queryBase = montarQueryBase();

            if (!queryBase) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const colunas = [
                'pagamentos.id',
                'pagamentos.aluno_id',
                'alunos.nome as aluno_nome',
                'pagamentos.plano_id',
                'planos.nome as plano_nome',
                'pagamentos.valor',
                'pagamentos.forma_pagamento',
                'pagamentos.data_pagamento',
                'pagamentos.valido_ate',
                'pagamentos.status',
                'pagamentos.confirmado_por_nome',
                'pagamentos.observacao',
                'pagamentos.created_at as solicitado_em'
            ];

            if (!page && !limit) {
            // sem parâmetros de paginação: mantém o comportamento antigo,
            // devolve a lista inteira
                const pagamentos = await queryBase
                    .clone()
                    .select(colunas)
                    .orderBy('pagamentos.created_at', 'desc');
                return res.json(pagamentos);
            }

            const paginaAtual = Math.max(parseInt(page, 10) || 1, 1);
            const porPagina = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
            const offset = (paginaAtual - 1) * porPagina;

            const [{ total }] = await queryBase.clone().count('pagamentos.id as total');

            const pagamentos = await queryBase
                .clone()
                .select(colunas)
                .orderBy('pagamentos.created_at', 'desc')
                .limit(porPagina)
                .offset(offset);

            return res.json({
                data: pagamentos,
                pagina: paginaAtual,
                totalPaginas: Math.ceil(total / porPagina),
                totalRegistros: Number(total)
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar pagamentos.' });
        }
    },

    async update (req, res){
    // usado principalmente pelo staff pra confirmar (ou recusar) uma solicitação
    // pendente, mas também serve pra corrigir um pagamento já registrado
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem confirmar pagamentos.' });
            }

            const { id } = req.params;
            const { valor, forma_pagamento, data_pagamento, status, observacao } = req.body;

            const dadosParaAtualizar = { valor, forma_pagamento, observacao, updated_at: new Date() };

            if (status) {
                dadosParaAtualizar.status = status;
            }

            if (status === 'confirmado') {
                const pagamentoAtual = await connection('pagamentos')
                    .join('planos', 'planos.id', '=', 'pagamentos.plano_id')
                    .select('planos.duracao_dias')
                    .where('pagamentos.id', id)
                    .first();

                const dataPagamentoFinal = data_pagamento ? new Date(data_pagamento) : new Date();

                dadosParaAtualizar.data_pagamento = dataPagamentoFinal;
                dadosParaAtualizar.valido_ate = calcularValidade(dataPagamentoFinal, pagamentoAtual?.duracao_dias);
                dadosParaAtualizar.confirmado_por_nome = await buscarNomeStaff(tipoUsuario, req.userId);
            } else if (data_pagamento) {
                dadosParaAtualizar.data_pagamento = new Date(data_pagamento);
            }

            await connection('pagamentos')
                .where('id', id)
                .update(dadosParaAtualizar);

            return res.json({ message: 'Pagamento atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar pagamento.' });
        }
    },

    async delete (req, res){
    // remove um pagamento, somente admin ou professor
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem deletar pagamentos.' });
            }

            const { id } = req.params;

            await connection('pagamentos')
                .where('id', id)
                .delete();

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar pagamento.' });
        }
    }
};

async function buscarNomeStaff(tipoUsuario, userId) {
// busca o nome de quem está confirmando, direto no banco — o token só tem
// id e tipo, não o nome, então não dá pra confiar em nada vindo do front
    const tabela = tipoUsuario === 'admin' ? 'admins' : 'professores';
    const staff = await connection(tabela).select('nome').where('id', userId).first();
    return staff ? staff.nome : null;
}

function calcularValidade(dataPagamento, duracaoDias) {
// soma a duração do plano (em dias) à data do pagamento, pra saber até quando vale
    if (duracaoDias === null || duracaoDias === undefined) {
    // usa === pra não tratar 0 (plano sem duração fixa) como "sem duração"
        return null;
    }

    const validade = new Date(dataPagamento);
    validade.setDate(validade.getDate() + duracaoDias);
    return validade;
}