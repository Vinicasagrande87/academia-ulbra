const connection = require('../database/connections');
// crio uma variavel que fara conexão com o arquivo connections que esta na pasta database
const { dataDeHoje } = require('../utils/data');

module.exports = {

    async create (req, res){
    // função para o professor ou admin cadastrar um novo treino para o aluno
        try {
            const tipoUsuario = req.userType;
            // só grava professor_id quando quem está logado é de fato um professor;
            // se for admin, o id dele não existe na tabela "professores" (são
            // tabelas separadas), então salvamos null pra não violar a FK
            const professor_id = tipoUsuario === 'professor' ? req.userId : null;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem montar treinos.' });
            }

            const { aluno_id, dia_semana, exercicios } = req.body;
            // desestruturando os dados enviados na requisição

            const alunoComPlanoAtivo = await connection('pagamentos')
                .where('aluno_id', aluno_id)
                .andWhere('status', 'confirmado')
                .andWhere('valido_ate', '>=', dataDeHoje())
                // compara com a data (sem hora) de hoje: valido_ate é uma
                // coluna "date"; comparar com um Date/timestamp completo faz
                // o Postgres tratar valido_ate como meia-noite e a trava
                // passava a falhar a partir de qualquer horário depois das 00h
                .first();
            // trava: só deixa montar treino novo se o aluno tiver um pagamento
            // confirmado cuja validade ainda não passou. Isso não afeta a edição
            // de um treino já existente, só a criação de um novo.

            if (!alunoComPlanoAtivo) {
                return res.status(403).json({ error: 'Este aluno não tem um plano ativo. Confirme o pagamento na tela financeira antes de montar o treino.' });
            }

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
    // (usado na ficha de treino clicada a partir da lista de alunos, e também
    // pela tela de edição, que filtra o dia certo a partir desses dados);
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

            if (treinos.length > 0) {
            // busca os itens de todos os treinos numa query só (evita N+1:
            // uma query por treino ficava lento com muitos treinos)
                const treinoIds = treinos.map(treino => treino.id);

                const itens = await connection('treino_itens')
                    .join('exercicios', 'exercicios.id', '=', 'treino_itens.exercicio_id')
                    .select(
                        'treino_itens.treino_id',
                        'treino_itens.exercicio_id',
                        'exercicios.nome as exercicio_nome',
                        'exercicios.video_url',
                        'exercicios.workoutx_id',
                        'exercicios.equipamento',
                        'treino_itens.carga',
                        'treino_itens.repeticoes',
                        'treino_itens.ordem'
                    )
                    .whereIn('treino_itens.treino_id', treinoIds)
                    .orderBy('treino_itens.ordem');

                for (const treino of treinos) {
                    treino.exercicios = itens
                        .filter(item => item.treino_id === treino.id)
                        .map(({ treino_id, ...resto }) => resto);
                }
            }

            return res.json(treinos);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar treinos.' });
        }
    },

    async update (req, res){
    // edita um treino existente, permitido para admin ou professor
    // agora também substitui os itens (exercícios) do treino quando enviados
    // (sem checagem de plano ativo aqui — a trava é só na criação, editar um
    // treino que já existe continua liberado)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem editar treinos.' });
            }

            const { id } = req.params;
            const { dia_semana, exercicios } = req.body;

            await connection('treinos')
                .where('id', id)
                .update({ dia_semana });

            if (exercicios) {
            // se vier a lista de exercícios, substitui os itens antigos pelos novos
            // (apaga tudo e reinsere, mais simples do que comparar item a item)
                await connection('treino_itens').where('treino_id', id).delete();

                if (exercicios.length > 0) {
                    const itensParaInserir = exercicios.map(item => ({
                        treino_id: id,
                        exercicio_id: item.exercicio_id,
                        carga: item.carga,
                        repeticoes: item.repeticoes,
                        ordem: item.ordem
                    }));

                    await connection('treino_itens').insert(itensParaInserir);
                }
            }

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