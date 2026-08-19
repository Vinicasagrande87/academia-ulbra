const WORKOUTX_BASE = 'https://api.workoutxapp.com';
const WORKOUTX_KEY = process.env.WORKOUTX_API_KEY;
// a chave só existe aqui, no servidor — nunca é enviada pro navegador

module.exports = {

    async search(req, res) {
    // busca exercícios no catálogo do WorkoutX pelo nome (em inglês), usada
    // pelo admin na hora de cadastrar/editar um exercício
        try {
            const tipoUsuario = req.userType;

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode buscar no catálogo do WorkoutX.' });
            }

            const { name } = req.query;

            if (!name) {
                return res.status(400).json({ error: 'Informe o nome do exercício para buscar (em inglês, ex: "bench press").' });
            }

            const resposta = await fetch(`${WORKOUTX_BASE}/v1/exercises/name/${encodeURIComponent(name)}`, {
                headers: { 'X-WorkoutX-Key': WORKOUTX_KEY }
            });

            if (!resposta.ok) {
                return res.status(resposta.status).json({ error: 'Erro ao buscar no WorkoutX.' });
            }

            const dados = await resposta.json();

            // devolve só o que o front precisa pra exibir a lista de opções —
            // nunca a chave, nunca a URL crua do WorkoutX
            const resultado = (dados.data || []).map(ex => ({
                workoutx_id: ex.id,
                nome_original: ex.name,
                bodyPart: ex.bodyPart,
                target: ex.target,
                equipment: ex.equipment
            }));

            return res.json(resultado);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar exercícios no WorkoutX.' });
        }
    },

    async gif(req, res) {
    // funciona como um "espelho": o navegador pede o gif pra cá, este
    // endpoint busca no WorkoutX usando a chave escondida, e devolve a
    // imagem pronta — a chave nunca chega até o navegador do usuário final.
    // Público de propósito: uma tag <img src="..."> não consegue mandar
    // cabeçalho de autenticação, e o conteúdo (gif de um exercício) não é
    // um dado sensível — só a chave da API precisava ficar protegida.
        try {
            const { id } = req.params;

            const resposta = await fetch(`${WORKOUTX_BASE}/v1/gifs/${id}.gif?api-key=${WORKOUTX_KEY}`);

            if (!resposta.ok) {
                return res.status(resposta.status).send();
            }

            const buffer = Buffer.from(await resposta.arrayBuffer());

            res.set('Content-Type', 'image/gif');
            res.set('Cache-Control', 'public, max-age=604800');
            // fica em cache no navegador por 7 dias — o gif de um exercício não
            // muda, então isso evita gastar cota da API toda hora que alguém
            // reabre a mesma tela

            return res.send(buffer);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar o GIF.' });
        }
    }
};