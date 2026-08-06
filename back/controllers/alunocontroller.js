const connection = require('../database/connections');
const bcrypt = require('bcryptjs');
// biblioteca pra criptografar a senha do aluno antes de salvar no banco

module.exports = {
// informando que as funções a seguir estão disponiveis a outros arquivos

    async create (req, res){
    // função para o professor ou admin cadastrar um novo aluno
        try {
            const tipoUsuario = req.userType;
            // pega o tipo do usuário logado através do token

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
            // se não for admin nem professor, bloqueia a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem cadastrar alunos.' });
            }

            const {nome, idade, peso, altura, cpf, telefone, email, senha, finalidade} = req.body;
            // estou criando uma desestruturalçao com os atributos a serem preenchidos

            const senhaCriptografada = await bcrypt.hash(senha, 8);
            // criptografa a senha antes de guardar no banco, nunca salvamos ela pura

            const [{ id }] = await connection('alunos').insert({
            // estou criando vetor e conectando as informações nele contidas nos atributos
            // abaixo
                nome,
                idade,
                peso,
                altura,
                cpf,
                telefone,
                email,
                senha: senhaCriptografada,
                finalidade
            }).returning('id');
            // no Postgres precisa do .returning('id') pra receber o ID de volta,
            // e ele volta dentro de um objeto: [{ id: 5 }], por isso o [{ id }]

            return res.status(201).json({id, nome, idade, peso, altura, cpf, telefone, email, finalidade});
            // aqui retorna os status ok e me manda todos os atributos listados (sem a senha)
        } catch (error) {
          // mas caso de algo errado ele retorna a mensagem abaixo
            console.error(error);
            return res.status(500).json({error: 'Erro ao cadastrar aluno'});
        }
    }, // Fechamento correto para separar as funções do objeto

    async index (req, res){
    // lista todos os alunos cadastrados, usado pelo professor/admin (tela de alunos matriculados)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem listar alunos.' });
            }

            const alunos = await connection('alunos')
                .select('id', 'nome', 'idade', 'peso', 'altura', 'cpf', 'telefone', 'email', 'finalidade');
            // nunca selecionamos a coluna senha, por segurança

            return res.json(alunos);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar alunos.' });
        }
    },

    async perfil (req, res){
    // aluno vê os próprios dados cadastrais (tela "Meu Perfil")
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'aluno') {
            // só o próprio aluno acessa essa rota
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode ver esse perfil.' });
            }

            const id = req.userId;

            const aluno = await connection('alunos')
                .select('id', 'nome', 'idade', 'peso', 'altura', 'cpf', 'telefone', 'email', 'finalidade')
                .where('id', id)
                .first();
            // nunca selecionamos a coluna senha, por segurança

            if (!aluno) {
                return res.status(404).json({ error: 'Aluno não encontrado.' });
            }

            return res.json(aluno);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar perfil do aluno.' });
        }
    },

    async treino (req, res){
    // aluno vê os treinos disponíveis pra ele (segunda a sexta, com exercício, carga,
    // repetição e vídeo de cada um)
        try {
        // caso de tudo certo
            const id = req.userId;
            // criei uma variavel que guarda o usuario que esta online

            const treinos = await connection('treinos')
            // busca o cabeçalho de todos os treinos desse aluno
                .where('aluno_id', id)
                .select('id', 'dia_semana');

            if (!treinos || treinos.length === 0) {
            // se não houver nenhum treino montado ainda pra esse aluno
                return res.status(404).json({ error: 'Nenhum treino encontrado para este aluno.' });
            }

            for (const treino of treinos) {
            // pra cada dia de treino, busca os exercícios com carga, repetição e vídeo
                treino.exercicios = await connection('treino_itens')
                    .join('exercicios', 'exercicios.id', '=', 'treino_itens.exercicio_id')
                    .select(
                        'exercicios.nome as exercicio_nome',
                        'exercicios.video_url',
                        'treino_itens.carga',
                        'treino_itens.repeticoes'
                    )
                    .where('treino_itens.treino_id', treino.id)
                    .orderBy('treino_itens.ordem');
                    // ordena pela sequência que o professor definiu
            }

            // Filtra para manter apenas os treinos que possuem exercícios cadastrados
            const treinosComExercicios = treinos.filter(treino => treino.exercicios.length > 0);

            if (treinosComExercicios.length === 0) {
                return res.status(404).json({ error: 'Nenhum treino com exercícios encontrados para este aluno.' });
            }

            // Retorna apenas a lista de treinos que possuem exercícios
            return res.json(treinosComExercicios);
            // mas se tudo der certo mande ao usuario os seus treinos
        } catch (error) {
        // caso algo de errado, mande essa mensagem
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar treinos do aluno.' });
        }

},

    async update (req, res){
    // edita o próprio cadastro, somente o aluno logado pode fazer isso
         try{
        // caso de tudo certo faça o codigo abaixo

            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'aluno') {
            // se não for aluno (professor ou admin tentando usar essa rota), bloqueia
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode editar seu cadastro.' });
            }

            const id = req.userId
            //faz com que a dição seja feita somente no usuario que esta logado

            const {nome, peso, altura, cpf, telefone, email, finalidade} = req.body;
            // pegando os novos dados enviados na requisição

            const alunos = await connection('alunos')
            //guardando a conexão na variavel alunos ate a tabela alunos
            .where('id', id)
                // filtra para alterar apenas o aluno logado
                .update({
                    nome,
                    peso,
                    altura,
                    cpf,
                    telefone,
                    email,
                    finalidade
                });
                // atualiza os dados no banco

            return res.json({ message: 'Atualizado com sucesso!' });

         } catch (error) {
             console.error(error);
             return res.status(500).json({ error: 'Erro ao atualizar' });
         }
        },

        async delete(req, res){
            // craindo função assincrona para caso o aluno queira deletar seu cadastro
            try{
            // caso de tudo certo
            const id = req.userId;
            // certificando que o aluno que esta online esta deletando seu proprio cadastro

            await connection('alunos')
            // guardando o caminho ate a tabela alunos na variavel conexão
            .where('id', id)
            // onde o aluno que esta logado ('id') tera acesso a deletar somente o seu cadastro
            .delete();
            // vai até a tabela alunos, filtra pelo ID do usuário logado e apaga o registro

            return res.status(204).send();
            // retorna status 204 (sucesso sem conteúdo para retornar) indicando que foi deletado

            } catch (error) {
            // caso dê algo errado
                console.error(error);
                return res.status(500).json({ error: 'Erro ao deletar cadastro.' });
            }
    }
}