const connection = require ('../database/connections');

// criei uma variavel e atribuia ela o caminho ate a conexão com o banco 

module.exports={
// estou deixando as função prontas para serem exportadas aos arquivos que precisarem dela
  async create (req, res){
  // estou criando uma função assincrona para cria aulas

    try{
    // caso de tudo certo faça isso

       const tipoUsuario = req.userType; 
            // criei uma constante que guarda o tipo de usuário logado (aluno ou professor)

            if (tipoUsuario !== 'professor') {
            // se o usuário logado NÃO for professor, bloqueie a ação
                return res.status(403).json({ error: 'Acesso negado. Apenas professores podem criar aulas.' });
            }
        
        const {nome, equipamento, carga} = req.body
        // onde o professor cria o treino do aluno
         
        const [id] = await connection('aulas').insert({
        // estou crinado um id para a aula e ja estou fazendo a conexão com a tabela do banco informando que irei inserir
        // os seguintes atributos 
            nome,
            equipamento,
            carga
        });

          return res.status(201).json({id, nome, equipamento,carga});
          // retornando os dados da requisição do cliente
  }catch(error){
    //caso de algo errado
    return res.status(500).json({erro:'Erro ao cadastrar aula'})
  }
},

   async update(req, res){
    // criando uma função para editar as aulas

       try{
            const tipoUsuario = req.userType;
            // me certificando que o usuario que quer editar seja o professor

            if(tipoUsuario !== 'professor'){
            // se o usuario não for professor mande essa resposta
                return res.status(403).json({ error: 'Acesso negado. Apenas professores podem editar aulas.' });
            }

            const { id } = req.params;
            // pegando o ID da aula que vem lá na URL da requisição

            const { nome, equipamento, carga } = req.body;
            // mandando os atributos a serem editados

            await connection('aulas')
                .where('id', id)
                .update({
                    nome,
                    equipamento,
                    carga
                });
            // vai até a tabela aulas, filtra pelo ID específico da aula e atualiza os dados no banco

            return res.json({ message: 'Atualizado com sucesso!' });

       } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
       }
    },

async index (req, res){
        try{
        // se tudo der certo
          const tipoUsuario = req.userType;
          // pegando o tipo de usuario logado(aluno ou professor)
          const id = req.userId;
         //pegando o id do usuario que esta fazendo a requisição
          let aulas;
          // criando uma variavel para guardar o resultado da busca

          if(tipoUsuario === 'professor'){
          // condicional se usuario for igual a professor ele tera acesso

            const {aluno_id} = req.query
            // aqui estamos desestruturando a query e pegando somente a informação do id do aluno

            aulas = await connection ('aulas')
            // aqui estou atribuindo a variavel aulas o caminho até a tabela aulas 

            .join('alunos', 'alunos.aulas_id', '=' , 'aulas.id')
            // aqui estou juntando as tabelas alunos e a tabelas aulas e buscando quais aulas esse aluno tem 

            .select(
            // selecionar as seguintes colunas para dar a resposta 
              'alunos.id as alunos_id',
              'alunos.nome as alunos_nome',
              'aulas.id as aulas_id',
              'aulas.nome as aulas_nome',
              'aulas.equipamentos',
              'aulas.carga'
            )
            .where('alunos.id', aluno_id)
            // é a requisição do professor, onde ele diz qual aluno ele quer saber as informações que o select esta pedindo

          } else {
          // se não for professor, é o próprio aluno vendo suas aulas

            aulas = await connection('aulas')
            .join('alunos', 'alunos.aulas_id', '=', 'aulas.id')
            .select(
              'aulas.id as aulas_id',
              'aulas.nome as aulas_nome',
              'aulas.equipamentos',
              'aulas.carga'
            )
            .where('alunos.id', id)
            // busca somente as aulas do próprio aluno logado
          }

          return res.json(aulas);
          // retornando o resultado da busca pro cliente

        }catch(error){
         return res.status(500).json({error:'Erro ao buscar'});
        }
      },

      async delete (req, res){
      try {
        const tipoUsuario = req.userType;
        // me certificando que o usuario que quer deletar seja o professor

        if(tipoUsuario === 'professor'){

          const { id } = req.params;
          // pegando o ID da aula que vem lá na URL da requisição

          await connection('aulas')
            .where('id', id)
            .del();
          // vai até a tabela aulas, filtra pelo ID específico da aula e deleta do banco

          return res.status(200).json({mensagem:'Aula deletada com sucesso'});

        } else {
          return res.status(403).json({ error: 'Acesso negado. Apenas professores podem deletar aulas.' });
        }

        } catch(error){
          return res.status(500).json({error:'Error ao deletar'})
        }
      }
};