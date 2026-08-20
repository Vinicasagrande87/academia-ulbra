const connection = require('../database/connections');

const CAMPOS_EDITAVEIS = [
    'pratica_atividade_atualmente',
    'praticou_atividade_anteriormente',
    'problema_osteoarticular',
    'problema_neuromuscular',
    'problema_coronario',
    'problema_vascular',
    'hospitalizado_5_anos',
    'cirurgia_5_anos',
    'contato_emergencia_nome',
    'contato_emergencia_telefone',
    'contato_emergencia_parentesco'
];

module.exports = {

    async mostrar (req, res){
    // devolve a anamnese de um aluno específico — dado sensível de saúde,
    // só professor/admin podem ver (nem o próprio aluno acessa essa rota)
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem ver a anamnese.' });
            }

            const { alunoId } = req.params;

            const anamnese = await connection('anamneses').where('aluno_id', alunoId).first();

            return res.json(anamnese || null);
            // null quando o aluno ainda não tem anamnese preenchida

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar anamnese.' });
        }
    },

    async salvar (req, res){
    // cria ou atualiza a anamnese do aluno (upsert) — só professor/admin
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin' && tipoUsuario !== 'professor') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e professores podem editar a anamnese.' });
            }

            const { alunoId } = req.params;

            const dados = {};
            for (const campo of CAMPOS_EDITAVEIS) {
                if (req.body[campo] !== undefined) {
                    dados[campo] = req.body[campo];
                }
            }
            // só copia os campos conhecidos do body, ignora qualquer coisa extra

            const existente = await connection('anamneses').where('aluno_id', alunoId).first();

            if (existente) {
                await connection('anamneses')
                    .where('aluno_id', alunoId)
                    .update({ ...dados, updated_at: new Date() });
            } else {
                await connection('anamneses').insert({ aluno_id: alunoId, ...dados });
            }

            return res.json({ message: 'Anamnese salva com sucesso!' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao salvar anamnese.' });
        }
    }
};
