// validação simples de entrada, sem depender de nenhuma lib externa —
// confere os campos do req.body antes de deixar a requisição chegar no
// controller, pra não virar um 500 genérico quando o Postgres reclamar
// de um "notNullable" ou de um tipo errado

function ehString(valor) {
    return typeof valor === 'string';
}

function ehEmailValido(valor) {
    // regex simples, suficiente pra pegar erro de digitação óbvio
    // (validar 100% o RFC de e-mail nenhuma regex faz direito mesmo)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function ehCpfValido(valor) {
    // aceita só os 11 dígitos, com ou sem pontuação (000.000.000-00 ou 00000000000)
    const digitos = String(valor).replace(/\D/g, '');
    return digitos.length === 11;
}

function ehNumero(valor) {
    return valor !== null && valor !== undefined && valor !== '' && !isNaN(Number(valor));
}

// gera um middleware que valida os campos do body de acordo com as regras passadas.
//
// exemplo de uso, dentro de routes.js:
//
// const { validarCampos } = require('./middlewares/validacao');
//
// routes.post('/alunos', authMiddleware, validarCampos({
//     nome: { obrigatorio: true },
//     email: { obrigatorio: true, tipo: 'email' },
//     idade: { obrigatorio: true, tipo: 'numero' }
// }), alunoController.create);
function validarCampos(regras) {
    return (req, res, next) => {
        const erros = [];

        for (const campo in regras) {
            const regra = regras[campo];
            const valor = req.body[campo];
            const vazio = valor === undefined || valor === null || valor === '';

            if (regra.obrigatorio && vazio) {
                erros.push(`O campo "${campo}" é obrigatório.`);
                continue;
                // já está vazio e é obrigatório — não faz sentido validar o
                // formato também, ia só gerar erro duplicado pro mesmo campo
            }

            if (vazio) {
                continue;
                // campo opcional e não veio, tudo bem, segue o baile
            }

            if (regra.tipo === 'email' && !ehEmailValido(valor)) {
                erros.push(`O campo "${campo}" precisa ser um e-mail válido.`);
            }

            if (regra.tipo === 'cpf' && !ehCpfValido(valor)) {
                erros.push(`O campo "${campo}" precisa ser um CPF válido (11 dígitos).`);
            }

            if (regra.tipo === 'numero' && !ehNumero(valor)) {
                erros.push(`O campo "${campo}" precisa ser um número.`);
            }

            if (regra.minLength && ehString(valor) && valor.length < regra.minLength) {
                erros.push(`O campo "${campo}" precisa ter pelo menos ${regra.minLength} caracteres.`);
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({ error: 'Dados inválidos.', detalhes: erros });
        }

        return next();
    };
}

module.exports = { validarCampos };