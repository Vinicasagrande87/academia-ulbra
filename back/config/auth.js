require('dotenv').config();
// deixando a chave do .env disponivel neste arquivo

module.exports = {
    secret: process.env.APP_SECRET,
    // string aleatória e grande usada pra assinar o token, precisa estar no .env
    // NUNCA deixe essa chave escrita direto no código

    expiresIn: '7d'
    // depois de 7 dias o token expira e o usuário precisa logar de novo
};