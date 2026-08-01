const connection = require ('../database/connection');

module.exports={
async index(req, res){
    // criei uma função assincrona para buscar todos os alunos 
        try {
        // caso de tudo certo faça isso 
        const aluno = await connection ('alunos').select('*');
        // criei uma variavel aluno que com a ajuda o await fará a viagem até o banco com o 
        // auxilio do arquivo connection e vai buscar a tabela aluno e mandrá todos 
        // cadastrados 

        return res.json(aluno);
        // aqui vem a resposta com os alunos ou o alino em especifico 
        }catch(error){
        // caso de alguma problema e esse seja o motivo de não enviar a resposta ao usuario 
        // vem esta mensagem 

        return res.status (500).json ({error: 'erro ao listar alunos'})
        }
    },

      async create(req,res){
        
      } 
    }