const connection = require('../database/connections');
const bcrypt = require('bcryptjs');
// biblioteca pra criptografar a senha do professor antes de salvar no banco

module.exports = {

    async index (req, res){
    // lista todos os professores cadastrados — só o admin gerencia professores,
    // então essa listagem fica restrita a ele (antes não tinha checagem nenhuma)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode listar professores.' });
            }

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

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode cadastrar professores.' });
            }

            const { nome, email, senha, cref, especialidade } = req.body;

            const senhaCriptografada = await bcrypt.hash(senha, 8);

            const [{ id }] = await connection('professores').insert({
                nome,
                email,
                senha: senhaCriptografada,
                cref,
                especialidade
            }).returning('id');

            return res.status(201).json({ id, nome, email, cref, especialidade });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao cadastrar professor.' });
        }
    },

    async update (req, res){
    // dois caminhos possíveis:
    // 1) o próprio professor edita a si mesmo, via PUT /professores (sem :id)
    // 2) o admin edita qualquer professor, via PUT /professores/:id
        try {
            const tipoUsuario = req.userType;
            const idParam = req.params.id;

            let idAlvo;

            if (tipoUsuario === 'professor' && !idParam) {
                idAlvo = req.userId;
            } else if (tipoUsuario === 'admin' && idParam) {
                idAlvo = idParam;
            } else {
            // cobre: professor tentando editar outro (via /professores/:id),
            // admin chamando sem id, ou aluno tentando qualquer uma das duas
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { nome, email, cref, especialidade } = req.body;

            await connection('professores')
                .where('id', idAlvo)
                .update({ nome, email, cref, especialidade });

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

            await connection('professores')
                .where('id', id)
                .delete();

            return res.status(204).send();

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar professor.' });
        }
    }
};