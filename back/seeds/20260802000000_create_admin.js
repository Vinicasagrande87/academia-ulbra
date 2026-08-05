const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    await knex('admins').del();
    // limpa a tabela antes de inserir, evita duplicar toda vez que você rodar o seed

    const senhaCriptografada = await bcrypt.hash('admin123', 8);
    // essa é a senha "admin123" já criptografada — troque aqui se quiser outra

    await knex('admins').insert([
        {
            nome: 'Admin',
            email: 'admin@academiaulbra.com',
            senha: senhaCriptografada
        }
    ]);
};