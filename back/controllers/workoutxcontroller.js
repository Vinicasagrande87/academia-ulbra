const { traduzirTermoBusca } = require('../utils/traducaoExercicios');

const WORKOUTX_BASE = 'https://api.workoutxapp.com';
const WORKOUTX_KEY = process.env.WORKOUTX_API_KEY;
// a chave só existe aqui, no servidor — nunca é enviada pro navegador

module.exports = {

    async search(req, res) {
    // busca exercícios no catálogo do WorkoutX; o admin digita em português,
    // aqui a gente traduz pros termos mais próximos em inglês antes de buscar
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode buscar no catálogo do WorkoutX.' });
            }

            const { name } = req.query;

            if (!name) {
                return res.status(400).json({ error: 'Informe o nome do exercício para buscar.' });
            }

            const termoTraduzido = traduzirTermoBusca(name);

            const resposta = await fetch(`${WORKOUTX_BASE}/v1/exercises/name/${encodeURIComponent(termoTraduzido)}`, {
                headers: { 'X-WorkoutX-Key': WORKOUTX_KEY }
            });

            if (!resposta.ok) {
                return res.status(resposta.status).json({ error: 'Erro ao buscar no WorkoutX.' });
            }

            const dados = await resposta.json();

            const resultado = (dados.data || []).map(ex => ({
                workoutx_id: ex.id,
                nome_original: ex.name,
                bodyPart: ex.bodyPart,
                target: ex.target,
                equipment: ex.equipment
            }));

            return res.json({ termo_buscado: name, termo_traduzido: termoTraduzido, resultados: resultado });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar exercícios no WorkoutX.' });
        }
    },

    async gif(req, res) {
    // funciona como um "espelho": o navegador pede o gif pra cá, este
    // endpoint busca no WorkoutX usando a chave escondida, e devolve a
    // imagem pronta — a chave nunca chega até o navegador do usuário final.
        try {
            const { id } = req.params;

            if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
            // o id do WorkoutX é sempre alfanumérico; barra isso aqui pra
            // ninguém injetar '?', '#' ou '/' e alterar a URL/chave enviada
                return res.status(400).json({ error: 'Id de gif inválido.' });
            }

            const resposta = await fetch(`${WORKOUTX_BASE}/v1/gifs/${encodeURIComponent(id)}.gif?api-key=${WORKOUTX_KEY}`);

            if (!resposta.ok) {
                return res.status(resposta.status).send();
            }

            const buffer = Buffer.from(await resposta.arrayBuffer());

            res.set('Content-Type', 'image/gif');
            res.set('Cache-Control', 'public, max-age=86400');
            // 24 horas (86400 segundos) — respeita o limite de cache de curto
            // prazo dos termos de uso do WorkoutX (máx. 24h); nunca guarda
            // permanente, sempre busca de novo no dia seguinte
            res.set('Cross-Origin-Resource-Policy', 'cross-origin');
            // o helmet() no server.js bloqueia por padrão imagens carregadas de
            // um domínio diferente (front e back são domínios separados no
            // Vercel); aqui liberamos especificamente essa rota, já que o
            // conteúdo é público (gif de demonstração de exercício, sem
            // dado sensível) e precisa ser exibido no <img> do front

            return res.send(buffer);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar o GIF.' });
        }
    }
};