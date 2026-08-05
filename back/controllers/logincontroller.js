const connection = require('../database/connections');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
// arquivo de configuração com o segredo (secret) usado pra assinar o token
// ajuste esse caminho se o seu arquivo de config estiver em outro lugar

module.exports = {

    async create (req, res){
    // função de login: recebe email e senha, descobre se é aluno, professor ou admin
    // e devolve o token de acesso
        try {
            const { email, senha } = req.body;
            // dados enviados na requisição

            let usuario = await connection('alunos').where('email', email).first();
            let tipoUsuario = 'aluno';
            // primeiro tenta achar o email na tabela de alunos

            if (!usuario) {
                usuario = await connection('professores').where('email', email).first();
                tipoUsuario = 'professor';
                // se não achou aluno, tenta na tabela de professores
            }

            if (!usuario) {
                usuario = await connection('admins').where('email', email).first();
                tipoUsuario = 'admin';
                // se não achou professor, tenta na tabela de admins
            }

            if (!usuario) {
            // se não encontrou o email em nenhuma das três tabelas
                return res.status(400).json({ error: 'Usuário não encontrado.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            // compara a senha enviada com a senha criptografada salva no banco

            if (!senhaValida) {
                return res.status(400).json({ error: 'Senha inválida.' });
            }

            const token = jwt.sign(
                { id: usuario.id, tipo: tipoUsuario },
                authConfig.secret,
                { expiresIn: authConfig.expiresIn }
            );
            // gera o token contendo o id do usuário e o tipo dele
            // é esse token que o middleware de autenticação vai ler pra
            // preencher o req.userId e o req.userType nos outros controllers

            return res.json({
                id: usuario.id,
                nome: usuario.nome,
                tipo: tipoUsuario,
                token
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao efetuar login.' });
        }
    }
};