const connection = require('../database/connections');
const bcrypt = require('bcryptjs');
// biblioteca pra criptografar a senha do professor antes de salvar no banco

module.exports = {

    async index (req, res){
    // lista todos os professores cadastrados
        try {
            const professores = await connection('professores')
                .select('id', 'nome', 'email', 'cref', 'especialidade');
            // não retorna a senha, por segurança

            return res.json(professores);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar professores.' });
        }
    },

    async create (req, res){
    // cadastra um novo professor no sistema, somente o admin pode fazer isso
        try {
            const tipoUsuario = req.userType;
            // pega o tipo do usuário logado

            if (tipoUsuario !== 'admin') {
            // se não for admin, bloqueia a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode cadastrar professores.' });
            }

            const { nome, email, senha, cref, especialidade } = req.body;
            // dados enviados na requisição

            const senhaCriptografada = await bcrypt.hash(senha, 8);
            // criptografa a senha antes de guardar no banco

            const [{ id }] = await connection('professores').insert({
                nome,
                email,
                senha: senhaCriptografada,
                cref,
                especialidade
            }).returning('id');
            // no Postgres precisa do .returning('id') pra receber o ID de volta,
            // e ele volta dentro de um objeto: [{ id: 5 }], por isso o [{ id }]

            return res.status(201).json({ id, nome, email, cref, especialidade });
            // retorna os dados do professor recém-criado (sem a senha)

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao cadastrar professor.' });
        }
    },

    async update (req, res){
    // professor edita o próprio cadastro
        try {
            const id = req.userId;
            // faz com que a edição seja feita somente no professor que esta logado

            const { nome, email, cref, especialidade } = req.body;
            // pegando os novos dados enviados na requisição

            await connection('professores')
                .where('id', id)
                .update({
                    nome,
                    email,
                    cref,
                    especialidade
                });
                // atualiza os dados no banco

            return res.json({ message: 'Atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar professor.' });
        }
    },

    async delete (req, res){
    // remove o cadastro de um professor, somente o admin pode fazer isso
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode remover professores.' });
            }

            const { id } = req.params;
            // pegando o ID do professor que vem na URL da requisição

            await connection('professores')
                .where('id', id)
                .delete();
            // vai até a tabela professores, filtra pelo ID e apaga o registro

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar professor.' });
        }
    }
};