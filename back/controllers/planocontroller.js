const connection = require('../database/connections');

module.exports = {

    async create (req, res){
    // admin cadastra um novo plano de assinatura da academia (ex: mensal, trimestral)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
            // se não for admin, bloqueia a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode cadastrar planos.' });
            }

            const { nome, descricao, valor, duracao_dias } = req.body;
            // dados do plano enviados na requisição

            const [{ id }] = await connection('planos').insert({
                nome,
                descricao,
                valor,
                duracao_dias
            }).returning('id');
            // no Postgres precisa do .returning('id') pra receber o ID de volta,
            // e ele volta dentro de um objeto: [{ id: 5 }], por isso o [{ id }]

            return res.status(201).json({ id, nome, descricao, valor, duracao_dias });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao cadastrar plano.' });
        }
    },

    async index (req, res){
    // lista todos os planos disponíveis, usado pelo aluno pra escolher o dele
        try {
            const planos = await connection('planos').select('*');

            return res.json(planos);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar planos.' });
        }
    },

    async update (req, res){
    // admin edita um plano existente
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode editar planos.' });
            }

            const { id } = req.params;
            // pegando o ID do plano que vem na URL da requisição

            const { nome, descricao, valor, duracao_dias } = req.body;

            await connection('planos')
                .where('id', id)
                .update({
                    nome,
                    descricao,
                    valor,
                    duracao_dias
                });

            return res.json({ message: 'Plano atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar plano.' });
        }
    },

    async delete (req, res){
    // admin remove um plano do sistema
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode deletar planos.' });
            }

            const { id } = req.params;

            await connection('planos')
                .where('id', id)
                .delete();
            // vai até a tabela planos, filtra pelo ID e apaga o registro

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar plano.' });
        }
    }
};