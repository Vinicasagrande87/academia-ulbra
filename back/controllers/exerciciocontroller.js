const connection = require('../database/connections');
// crio uma variavel que fara conexão com o arquivo connections que esta na pasta database

module.exports = {
// informando que as funções a seguir estão disponiveis a outros arquivos

    async create (req, res){
    // função para o admin cadastrar um novo exercício no catálogo
        try {
        // se der tudo certo faça isso
            const tipoUsuario = req.userType;
            // pega o tipo do usuário logado (aluno, professor ou admin)

            if (tipoUsuario !== 'admin') {
            // se não for admin, bloqueia a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode cadastrar exercícios.' });
            }

            const { nome, grupo_muscular, video_url, equipamento } = req.body;
            // desestruturando os dados enviados na requisição

            const [{ id }] = await connection('exercicios').insert({
            // insere o novo exercício na tabela exercicios
                nome,
                grupo_muscular,
                video_url,
                equipamento
            }).returning('id');
            // no Postgres precisa do .returning('id') pra receber o ID de volta,
            // e ele volta dentro de um objeto: [{ id: 5 }], por isso o [{ id }]

            return res.status(201).json({ id, nome, grupo_muscular, video_url, equipamento });
            // retorna o exercício recém-criado

        } catch (error) {
        // caso de algo errado
            console.error(error);
            return res.status(500).json({ error: 'Erro ao cadastrar exercício.' });
        }
    },

    async index (req, res){
    // lista todos os exercícios do catálogo
    // usado pelo professor pra escolher o que vai entrar no treino do aluno
        try {
            const { page, limit } = req.query;

            if (!page && !limit) {
            // sem parâmetros de paginação: mantém o comportamento antigo,
            // devolve a lista inteira
                const exercicios = await connection('exercicios').select('*').orderBy('nome');
                return res.json(exercicios);
            }

            const paginaAtual = Math.max(parseInt(page, 10) || 1, 1);
            const porPagina = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
            const offset = (paginaAtual - 1) * porPagina;

            const [{ total }] = await connection('exercicios').count('id as total');

            const exercicios = await connection('exercicios')
                .select('*')
                .orderBy('nome')
                .limit(porPagina)
                .offset(offset);

            return res.json({
                data: exercicios,
                pagina: paginaAtual,
                totalPaginas: Math.ceil(total / porPagina),
                totalRegistros: Number(total)
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar exercícios.' });
        }
    },

    async update (req, res){
    // edita um exercício existente do catálogo, somente admin
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode editar exercícios.' });
            }

            const { id } = req.params;
            // pegando o ID do exercício que vem na URL da requisição

            const { nome, grupo_muscular, video_url, equipamento } = req.body;
            // pegando os novos dados enviados na requisição

            await connection('exercicios')
                .where('id', id)
                .update({
                    nome,
                    grupo_muscular,
                    video_url,
                    equipamento
                });
            // atualiza os dados no banco

            return res.json({ message: 'Exercício atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar exercício.' });
        }
    },

    async delete (req, res){
    // remove um exercício do catálogo, somente admin
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode deletar exercícios.' });
            }

            const { id } = req.params;

            await connection('exercicios')
                .where('id', id)
                .delete();
            // vai até a tabela exercicios, filtra pelo ID e apaga o registro

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar exercício.' });
        }
    }
};