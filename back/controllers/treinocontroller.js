const connection = require('../database/connections');
// crio uma variavel que fara conexão com o arquivo connections que esta na pasta database

module.exports = {
// informando que as funções a seguir estão disponiveis a outros arquivos

    async create (req, res){
    // função para o professor ou admin cadastrar um novo treino para o aluno
        try {
            const tipoUsuario = req.userType;
            // pega o tipo do usuário logado (professor ou admin)
            const professor_id = req.userId;
            // pega o id do professor logado através do token para satisfazer a restrição do banco

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
            // se não for admin nem professor, bloqueia a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem montar treinos.' });
            }

            const { aluno_id, dia_semana, exercicios } = req.body;
            // desestruturando os dados enviados na requisição

            const [{ id }] = await connection('treinos').insert({
            // insere o cabeçalho do treino na tabela treinos informando aluno, professor e dia
                aluno_id,
                professor_id,
                dia_semana
            }).returning('id');

            // Se vierem exercícios no corpo da requisição, insere os itens do treino
            if (exercicios && exercicios.length > 0) {
                const itensParaInserir = exercicios.map(item => ({
                    treino_id: id,
                    exercicio_id: item.exercicio_id,
                    carga: item.carga,
                    repeticoes: item.repeticoes,
                    ordem: item.ordem
                }));

                await connection('treino_itens').insert(itensParaInserir);
            }

            return res.status(201).json({ message: 'Treino criado com sucesso!', treino_id: id });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao cadastrar treino.' });
        }
    },

    async index (req, res){
    // lista todos os treinos cadastrados
        try {
            const treinos = await connection('treinos').select('*');

            return res.json(treinos);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar treinos.' });
        }
    },

    async update (req, res){
    // edita um treino existente, permitido para admin ou professor
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem editar treinos.' });
            }

            const { id } = req.params;
            // pegando o ID do treino que vem na URL da requisição

            const { dia_semana } = req.body;
            // pegando os novos dados

            await connection('treinos')
                .where('id', id)
                .update({
                    dia_semana
                });

            return res.json({ message: 'Treino atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar treino.' });
        }
    },

    async delete (req, res){
    // remove um treino, permitido para admin ou professor
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem deletar treinos.' });
            }

            const { id } = req.params;

            // Deleta primeiro os itens vinculados para evitar erro de chave estrangeira
            await connection('treino_itens').where('treino_id', id).delete();

            // Depois deleta o treino principal
            await connection('treinos')
                .where('id', id)
                .delete();

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar treino.' });
        }
    }
};