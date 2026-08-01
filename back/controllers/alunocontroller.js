const connection = require('../database/connection');
// criei uma variavel que fara conexão com o arquivo connection que esta na pasta database

module.exports = {
// informando que as funções a seguir estão disponiveis a outros arquivos
    async create (req, res){
    // estou criando uma função de criação de aluno e informando que ela é assincrona
        try {
        // se der tudo certo faça isso 
            const {nome, idade, peso, altura, cpf, telefone, email, finalidade} = req.body;
            // estou criando uma desestruturalçao com os atributos a serem preenchidos 
            const [id] = await connection('alunos').insert({
            // estou criando vetor e conectando as informações nele contidas nos atributos 
            // abaixo
                nome,
                peso,
                altura,
                cpf,
                telefone,
                email,
                finalidade
            });
            
            return res.status(201).json({id, nome, peso, altura, cpf, telefone, email, finalidade});
            // aqui retorna os status ok e me manda tofos os atributos listados
        } catch (error) {
          // mas caso de algo errado ele retorna a mensagem abaixo 
            return res.status(500).json({error: 'Erro ao cadastrar aluno'});
        }
    }, // Fechamento correto para separar as funções do objeto

    async treino (req, res){
    //estou criando uma função o aluno poder ler seus treinos 
        try {
        // caso de tudo certo 
            const id = req.userId;
            // criei uma variavel que guarda o usuario que esta online
            
            const aulas = await connection('aulas')
            // acessa a tabela aulas no banco e guarda o resultado da busca na constante aulas
            .join('alunos', 'alunos.aulas_id', '=', 'aulas.id')
                // junta a tabela alunos com a tabela aulas usando o ID da aula como ponte       
                .select(
                    'alunos.id as aluno_id',
                    'aulas.nome as aula_nome',
                    'aulas.carga as aula_carga'
                )
                // aqui são os atributos que vou querer juntar pra dar a resposta ao usuario 
                .where('alunos.id', id);
                // aqui é o filtro final onde busco o id do aluno
                if (!aulas || aulas.length === 0) {
                // se aula for nulo ou igual a zero, retorne ao usuario a mensagem abaixo 
                return res.status(404).json({ error: 'Nenhum treino encontrado para este aluno.' });
            }

            // Retorna a lista de treinos/aulas encontrados
            return res.json(aulas);
            // mas se tudo der certo mande ao usuario os seus treinos 
        } catch (error) {
        // caso algo de errado, mande essa mensagem 
            return res.status(500).json({ error: 'Erro ao buscar treinos do aluno.' });
        }
    
},

    async update (req, res){
    // estou criando uma função para caso o aluno queira editar seu cadastro
         try{
        // caso de tudo certo faça o codigo abaixo

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
                return res.status(500).json({ error: 'Erro ao deletar cadastro.' });
            }
    }
}
         
    