const nodemailer = require('nodemailer');

// configura o transportador de e-mail usando uma conta Gmail com senha de app
// (nunca use a senha normal da conta, tem que ser uma "senha de app" gerada
// em myaccount.google.com/apppasswords, com verificação em duas etapas ativada)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviarEmailCadastroAluno({ nome, email, senha }) {
    const mailOptions = {
        from: `"Academia Ulbra" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Seu cadastro foi realizado - Academia Ulbra',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #3880ff;">Bem-vindo(a), ${nome}!</h2>
                <p>Seu cadastro na Academia Ulbra foi realizado com sucesso. Abaixo estão seus dados de acesso ao aplicativo:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">E-mail:</td>
                        <td style="padding: 8px;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Senha:</td>
                        <td style="padding: 8px;">${senha}</td>
                    </tr>
                </table>
                <p style="color: #666; font-size: 13px;">
                    Por segurança, recomendamos alterar sua senha após o primeiro acesso.
                </p>
            </div>
        `
    };

    // não usamos "await" bloqueante aqui fora — quem chama decide se quer
    // esperar o envio ou disparar em segundo plano (veja o controller)
    return transporter.sendMail(mailOptions);
}

module.exports = { enviarEmailCadastroAluno };