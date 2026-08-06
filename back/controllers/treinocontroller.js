const connection = require('../database/connections');
// crio uma variavel que fara conexão com o arquivo connections que esta na pasta database

module.exports = {

    async create (req, res){
    // função para o professor ou admin cadastrar um novo treino para o aluno
        try {
            const tipoUsuario = req.userType;
            const professor_id = req.userId;
            // pega o tipo e o id de quem está logado

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem montar treinos.' });
            }

            const { aluno_id, dia_semana, exercicios } = req.body;
            // desestruturando os dados enviados na requisição

            const [{ id }] = await connection('treinos').insert({
                aluno_id,
                professor_id,
                dia_semana
            }).returning('id');
            // no Postgres precisa do .returning('id') pra receber o ID de volta

            if (exercicios && exercicios.length > 0) {
            // se vierem exercícios no corpo da requisição, insere os itens do treino
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
    // lista os treinos: se vier aluno_id na query, filtra só os desse aluno
    // (usado na ficha de treino clicada a partir da lista de alunos);
    // sem aluno_id, lista os treinos de todos
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem visualizar dessa forma.' });
            }

            const { aluno_id } = req.query;

            let query = connection('treinos').select('id', 'aluno_id', 'professor_id', 'dia_semana');

            if (aluno_id) {
            // se veio um aluno específico na query, filtra só os treinos dele
                query = query.where('aluno_id', aluno_id);
            }

            const treinos = await query;

            for (const treino of treinos) {
            // pra cada treino, busca os exercícios com carga, repetição e vídeo
                treino.exercicios = await connection('treino_itens')
                    .join('exercicios', 'exercicios.id', '=', 'treino_itens.exercicio_id')
                    .select(
                        'exercicios.nome as exercicio_nome',
                        'exercicios.video_url',
                        'exercicios.equipamento',
                        'treino_itens.carga',
                        'treino_itens.repeticoes',
                        'treino_itens.ordem'
                    )
                    .where('treino_itens.treino_id', treino.id)
                    .orderBy('treino_itens.ordem');
            }

            return res.json(treinos);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar treinos.' });
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
            const { dia_semana } = req.body;

            await connection('treinos')
                .where('id', id)
                .update({ dia_semana });

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

            await connection('treino_itens').where('treino_id', id).delete();
            // apaga primeiro os itens, pra não ficar registro órfão no banco

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