const connection = require('../database/connections');
const bcrypt = require('bcryptjs');
// biblioteca pra criptografar a senha do aluno antes de salvar no banco
const { enviarEmailCadastroAluno } = require('../services/mailer');
// serviço de envio de e-mail com as credenciais do aluno recém-cadastrado

module.exports = {

    async create (req, res){
    // função para o professor ou admin cadastrar um novo aluno
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem cadastrar alunos.' });
            }

            const { nome, idade, peso, altura, cpf, telefone, email, senha, finalidade } = req.body;

            const senhaCriptografada = await bcrypt.hash(senha, 10);
            // criptografa a senha antes de guardar no banco, nunca salvamos ela pura
            // custo 10 (era 8): padrão mais recomendado atualmente, ainda roda rápido

            const [{ id }] = await connection('alunos').insert({
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
            // no Postgres precisa do .returning('id') pra receber o ID de volta

            // dispara o e-mail com a senha em texto puro (a que veio do formulário,
            // não a criptografada — a criptografada não daria pra reverter mesmo).
            // não usamos "await" aqui de propósito: se o e-mail demorar ou falhar,
            // isso não pode travar nem derrubar a resposta do cadastro
            enviarEmailCadastroAluno({ nome, email, senha }).catch(err => {
                console.error('Erro ao enviar e-mail de cadastro:', err);
            });

            return res.status(201).json({ id, nome, idade, peso, altura, cpf, telefone, email, finalidade });

        } catch (error) {
            console.error(error);

            if (error.code === '23505') {
            // violação de UNIQUE no Postgres — email ou cpf já cadastrado.
            // error.detail costuma vir tipo: 'Key (email)=(x@x.com) already exists.'
                if (error.detail?.includes('email')) {
                    return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
                }
                if (error.detail?.includes('cpf')) {
                    return res.status(409).json({ error: 'Este CPF já está cadastrado.' });
                }
                return res.status(409).json({ error: 'Aluno já cadastrado com esses dados.' });
            }

            return res.status(500).json({ error: 'Erro ao cadastrar aluno.' });
        }
    },

    async index (req, res){
    // lista todos os alunos cadastrados, usado pelo professor/admin (tela de alunos matriculados)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem listar alunos.' });
            }

            const colunas = ['id', 'nome', 'idade', 'peso', 'altura', 'cpf', 'telefone', 'email', 'finalidade'];
            // nunca selecionamos a coluna senha, por segurança

            const { page, limit } = req.query;

            if (!page && !limit) {
            // sem parâmetros de paginação: mantém o comportamento antigo,
            // devolve a lista inteira. Preserva compatibilidade com quem
            // ainda chama /alunos sem paginar (ex: front atual)
                const alunos = await connection('alunos').select(colunas).orderBy('nome');
                return res.json(alunos);
            }

            const paginaAtual = Math.max(parseInt(page, 10) || 1, 1);
            const porPagina = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
            // limite de 100 por página, pra ninguém pedir uma página absurda
            // e sobrecarregar o banco/servidor de propósito ou por engano
            const offset = (paginaAtual - 1) * porPagina;

            const [{ total }] = await connection('alunos').count('id as total');

            const alunos = await connection('alunos')
                .select(colunas)
                .orderBy('nome')
                .limit(porPagina)
                .offset(offset);

            return res.json({
                data: alunos,
                pagina: paginaAtual,
                totalPaginas: Math.ceil(total / porPagina),
                totalRegistros: Number(total)
            });

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
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode ver esse perfil.' });
            }

            const id = req.userId;

            const aluno = await connection('alunos')
                .select('id', 'nome', 'idade', 'peso', 'altura', 'cpf', 'telefone', 'email', 'finalidade')
                .where('id', id)
                .first();

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
    // aluno vê os treinos disponíveis pra ele (dia, exercício, carga, repetição e vídeo)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'aluno') {
            // sem essa checagem, um professor ou admin logado veria os treinos do
            // aluno que por coincidência tem o mesmo id que ele, já que alunos,
            // professores e admins são tabelas separadas com ids independentes
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode ver seus treinos.' });
            }

            const id = req.userId;

            const treinos = await connection('treinos')
                .where('aluno_id', id)
                .select('id', 'dia_semana');

            if (!treinos || treinos.length === 0) {
                return res.status(404).json({ error: 'Nenhum treino encontrado para este aluno.' });
            }

            // busca os itens de todos os treinos numa query só (evita N+1:
            // uma query por treino ficava lento com muitos treinos)
            const treinoIds = treinos.map(treino => treino.id);

            const itens = await connection('treino_itens')
                .join('exercicios', 'exercicios.id', '=', 'treino_itens.exercicio_id')
                .select(
                    'treino_itens.treino_id',
                    'exercicios.id as exercicio_id',
                    'exercicios.nome as exercicio_nome',
                    'exercicios.video_url',
                    'exercicios.workoutx_id',
                    'treino_itens.carga',
                    'treino_itens.repeticoes'
                )
                .whereIn('treino_itens.treino_id', treinoIds)
                .orderBy('treino_itens.ordem');

            for (const treino of treinos) {
                treino.exercicios = itens
                    .filter(item => item.treino_id === treino.id)
                    .map(({ treino_id, ...resto }) => resto);
            }

            const treinosComExercicios = treinos.filter(treino => treino.exercicios.length > 0);

            if (treinosComExercicios.length === 0) {
                return res.status(404).json({ error: 'Nenhum treino com exercícios encontrados para este aluno.' });
            }

            return res.json(treinosComExercicios);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar treinos do aluno.' });
        }
    },

    async update (req, res){
    // edita o próprio cadastro, somente o aluno logado pode fazer isso
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'aluno') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode editar seu cadastro.' });
            }

            const id = req.userId;

            const { nome, peso, altura, cpf, telefone, email, finalidade } = req.body;

            await connection('alunos')
                .where('id', id)
                .update({ nome, peso, altura, cpf, telefone, email, finalidade });

            return res.json({ message: 'Atualizado com sucesso!' });

        } catch (error) {
            console.error(error);

            if (error.code === '23505') {
                if (error.detail?.includes('email')) {
                    return res.status(409).json({ error: 'Este e-mail já está em uso por outro cadastro.' });
                }
                if (error.detail?.includes('cpf')) {
                    return res.status(409).json({ error: 'Este CPF já está em uso por outro cadastro.' });
                }
                return res.status(409).json({ error: 'Dados em conflito com outro cadastro existente.' });
            }

            return res.status(500).json({ error: 'Erro ao atualizar.' });
        }
    },

    async delete (req, res){
    // remove o próprio cadastro, somente o aluno logado pode fazer isso
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'aluno') {
            // sem essa checagem, um professor ou admin logado apagaria por engano
            // o aluno que por coincidência tem o mesmo id que ele, já que alunos,
            // professores e admins são tabelas separadas com ids independentes
                return res.status(403).json({ error: 'Acesso negado. Apenas o próprio aluno pode deletar seu cadastro.' });
            }

            const id = req.userId;

            await connection('alunos')
                .where('id', id)
                .delete();

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar cadastro.' });
        }
    }
};