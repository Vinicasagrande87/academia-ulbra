function dataDeHoje() {
// formata a data local de hoje como 'YYYY-MM-DD', pra comparar com uma
// coluna "date" do Postgres sem o descompasso de horário de um timestamp
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

module.exports = { dataDeHoje };
